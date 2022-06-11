
/**
 * 在地图中的人物对象
 */
namespace clientCore {
    interface IFunnyToy {
        toolId: number,
        toolType: number,
        img: Laya.Image | FunnyBody;
        ani: clientCore.Bone;
        diffY: number;
    }
    /**
     * 奇趣道具变化的形象
     */
    export class FunnyBody extends ui.weddingItem.render.BodyRenderUI {
        set skin(value: string) {
            this.setSkin(value);

        }
        get skin(): string {
            return this.img.skin;
        }
        private async setSkin(value: string): Promise<void> {
            await res.load(value, Laya.Loader.IMAGE);
            let source: Laya.Texture = res.get(value);
            if (!source || this._closed) return;
            this.img.pivotX = source.width / 2;
            this.img.pivotY = source.height / 2;
            this.img.source = source;
        }
    }
    export class PersonUnit {

        private readonly BASE_SCALE: number = 0.25; //模型缩放值
        private readonly TITLE_HEIGHT: number = 200; //称号高度
        private readonly SWIMSUIT_HEIGHT: number = 80; //泳装高度
        private readonly CP_RING_EFFECT_SCALE: number = 0.5;//cp戒指特效的缩放
        protected _data: pb.IUserBase;
        /** 人物身体*/
        protected _dispaly: Laya.Sprite;
        protected _cpEffect: clientCore.Bone;
        /** 名字*/
        protected _lbName: Laya.Label;
        /** 拾取进度*/
        protected _progress: Laya.Sprite;
        protected _badgeBg: Laya.Image;
        protected _badgeDec: Laya.Image;
        /** 方向 0-左 1-右*/
        protected _dirction: number;
        /** 持续的奇趣道具 key是funnyProp中parameter字段的v1*/
        protected _funnyToyMap: util.HashMap<IFunnyToy>;

        protected _pet: Pet;

        protected _id: number;
        protected _sex: number;
        protected _name: string;
        protected _x: number;
        protected _y: number;
        protected _scale: number;
        protected _rotation: number;
        protected _visible: boolean;

        protected _clickArea: Laya.Sprite;

        /** 称号*/
        protected _title: Laya.Image;
        protected bodySetScale: number;

        /**对话 */
        protected _alert:AlertTalk;

        /**泳衣 */
        public _swim: Swim;

        /**雪人 */
        protected _snowMan: Laya.Sprite;
        protected _snowManAni: clientCore.Bone;
        protected _clearAni: clientCore.Bone;
        protected _diLoopTime: Laya.Image;
        protected _loopTime: Laya.Label;
        protected _snowmanCd: number;
        public _isSnowMan: boolean;
        private _clickTime: number;
        private _tempVisible: boolean;

        /**活动道具 */
        protected _basket: Basket;

        /**是否有坐骑 */
        protected _haveRider:boolean;

        constructor() {
            //人物身体
            this.bodySetScale = MapInfo.isParty ? this.BASE_SCALE * 1.6 : this.BASE_SCALE;
            this._dispaly = new Laya.Sprite();
            this._dispaly.scaleX = this._dispaly.scaleY = this.bodySetScale;
            //人物名字
            this._lbName = new Laya.Label();
            this._lbName.anchorX = 0.5;
            this._lbName.width = 240;
            this._lbName.fontSize = 32;
            this._lbName.scale(0.5, 0.5);
            this._lbName.font = "汉仪中圆简";
            this._lbName.align = "center";
            this._lbName.stroke = 2;
            this._lbName.strokeColor = "#494545";
            this._scale = 1;
            this._lbName.mouseEnabled = false;

            this._badgeBg = new Laya.Image();
            this._badgeBg.mouseEnabled = false;
            this._badgeDec = new Laya.Image();
            this._badgeDec.mouseEnabled = false;
            this._badgeBg.anchorX = this._badgeBg.anchorY = this._badgeDec.anchorX = this._badgeDec.anchorY = 0.5;
            this._badgeBg.scaleX = this._badgeBg.scaleY = this._badgeDec.scaleX = this._badgeDec.scaleY = 0.1;

            this._title = new Laya.Image();
            this._title.anchorX = 0.5;
            this._title.scale(0.4, 0.4);

            this._alert = new AlertTalk();
            this._alert.scale(0.6,0.6);
            this._alert.visible = false;
            this._alert.showAlert();

            this._dirction = 0;
            this._funnyToyMap = new util.HashMap();
            this._visible = true;
        }

        public init(data: pb.IUserBase): void {
            this._data = data;
            this.resetScale();
        }

        public resetScale() {
            this.bodySetScale = MapInfo.isParty ? this.BASE_SCALE * 1.6 : this.BASE_SCALE;
            this._dispaly.scaleX = this._dispaly.scaleY = this.bodySetScale;
            this.y = this.y;
        }

        public addToLayer(): void {
            PersonLayer.ins.bodyLayer.addChildAt(this._dispaly, 0);
            if (this._data.userid == LocalInfo.uid) this._dispaly.zOrder = 4;
            else this._dispaly.zOrder = 3;
            PersonLayer.ins.nameLayer.addChild(this._lbName);
            PersonLayer.ins.addUI(this._badgeBg, PersonLayer.ins.badgeBgLayer);
            PersonLayer.ins.addUI(this._badgeDec, PersonLayer.ins.badgeDecLayer);
        }

        public updateName(name: string): void {
            this._name = name;
            this._lbName.changeText(name);
            this.x = this.x;
        }

        public updateBadge(badgeBgID: number, badgeDecID: number) {
            this._badgeBg?.removeSelf();
            this._badgeBg.skin = badgeBgID == 0 ? "" : pathConfig.getFamilyBadgeUrl(badgeBgID);
            PersonLayer.ins.addUI(this._badgeBg, PersonLayer.ins.badgeBgLayer);
            this._badgeDec?.removeSelf();
            this._badgeDec.skin = badgeDecID == 0 ? "" : pathConfig.getFamilyBadgeUrl(badgeDecID);
            PersonLayer.ins.addUI(this._badgeDec, PersonLayer.ins.badgeDecLayer);
        }

        public updateFunnyToyByIdEndTime(id: number, time: number) {
            let haveThisIdx = _.findIndex(this._data.propStampInfo, o => o.propId == id)
            if (haveThisIdx > -1) {
                this._data.propStampInfo[haveThisIdx] = { propId: id, clearPropStamp: time };
            } else {
                this._data.propStampInfo.push({ propId: id, clearPropStamp: time });
            }
            this.updateFunnyToy(this._data.propStampInfo);
        }

        /**
         * 更新持续显示的奇趣道具
         * @param itemId 道具id 
         * @param endTime 起始时间戳，传0代表脱下
         */
        public updateFunnyToy(data: pb.IpropInfo[]) {
            //更新数据
            this._data.propStampInfo = data;
            //先计算出最新的奇趣道具状态（需要穿上的）
            let newMap = this.caculateFunnyToyMap(data);
            //先删除newMap里面没有的
            for (const kv of this._funnyToyMap.toArray()) {
                let key = kv[0];
                let value = kv[1];
                if (!newMap.has(key)) {
                    //删除需要替换的
                    value?.img?.destroy();
                    value?.ani?.dispose();
                    this._funnyToyMap.remove(key);
                }
            }
            //添加或者替换
            for (const kv of newMap.toArray()) {
                let key = kv[0];
                //替换图片
                let newValue = newMap.get(key);
                // let img = this._funnyToyMap.get(key)?.img ? this._funnyToyMap.get(key)?.img : new Laya.Image();
                let img = null;
                let ani = null;
                let cfg: xls.funnyProp = xls.get(xls.funnyProp).get(newValue.propId);
                if (cfg.type == 5) {
                    ani = this._funnyToyMap.get(key)?.ani;
                    if (!ani) {
                        ani = clientCore.BoneMgr.ins.play(pathConfig.getFunnyToySk(newValue.propId), 0, true, PersonLayer.ins.effectLayer);
                    }
                    ani.visible = this.visible;
                } else {
                    img = this._funnyToyMap.get(key)?.img;
                    if (!img) {
                        img = cfg.type == 4 ? new FunnyBody() : new Laya.Image();
                    }
                    img.anchorX = img.anchorY = 0.5;
                    img.skin = pathConfig.getFunnyToyPeopleImg(newValue.propId);
                    img.visible = this.visible;
                    PersonLayer.ins.addUI(img, PersonLayer.ins.effectLayer);
                }
                let diffY = 0;
                switch (xls.get(xls.funnyProp).get(newValue.propId).parameter.v1) {
                    case 1:
                        diffY = -85;
                        break;
                    case 2:
                        diffY = -60;
                        break;
                    default:
                        break;
                }
                //替换map
                this._funnyToyMap.add(key, { toolId: newValue.propId, toolType: cfg.type, img: img, ani: ani, diffY: diffY });
                this.pos(this.x, this.y);
            }
            //检查是否有整体替换的选手
            this._dispaly.visible = this._visible && this.checkShowBody();
        }

        /** 检查身体是否可以显示*/
        protected checkShowBody(): boolean {
            return !(!!_.find(this._funnyToyMap.getValues(), (element: IFunnyToy) => { return element.toolType == 4; }) || this._swim?.visible);
        }

        /**计算最新的奇趣道具状态，一个type只能有一个没过期的 */
        private caculateFunnyToyMap(data: pb.IpropInfo[]) {
            let map: util.HashMap<pb.IpropInfo> = new util.HashMap();
            let now = clientCore.ServerManager.curServerTime;
            for (const info of data) {
                let itemType = xls.get(xls.funnyProp)?.get(info.propId)?.parameter?.v1;
                if (itemType) {
                    let notEnd = now <= info.clearPropStamp && info.clearPropStamp != 0;
                    if (notEnd) {
                        map.add(itemType, info);
                    }
                }
            }
            return map;
        }

        /**检查是否有冲突的奇趣道具 */
        public checkCanUserFunnyToy(type: number) {
            if (type != 3 && type != 5) return true;
            return _.findIndex(this._funnyToyMap.getValues(), (element: IFunnyToy) => { return element.toolType == 3 || element.toolType == 5; }) < 0;
        }

        public set x(value: number) {
            if (this._dispaly) {
                this._x = value;
                this._lbName.x = this._dispaly.x = value;
                this._progress && (this._progress.x = value);
                this._title && (this._title.x = value);
                this._basket && (this._basket.x = value);
                this._swim && (this._swim.x = value);
                this._badgeBg.x = value - (this._lbName.text.length * 16 / 2 + 15) * this._scale;
                this._badgeDec.x = value - (this._lbName.text.length * 16 / 2 + 15) * this._scale;
                this._cpEffect && (this._cpEffect.x = value);
                let arr = _.map(this._funnyToyMap.getValues(), o => o.img);
                for (const img of arr) {
                    if (img)
                        img.x = value;
                }
                let aniArr = _.map(this._funnyToyMap.getValues(), o => o.ani);
                for (const ani of aniArr) {
                    if (ani)
                        ani.x = value;
                }
            }
        }
        public setCpEffect(id: number) {
            let haveEffect = CpManager.checkHaveRingEffect(id);
            if (haveEffect) {
                this._cpEffect?.dispose();
                this._cpEffect = BoneMgr.ins.play(pathConfig.getCpRingSk(id), 0, true, PersonLayer.ins.effectLayer);
                this._cpEffect.pos(this._x, this._y);
                this._cpEffect.scaleY = this._cpEffect.scaleX = this._scale * this.CP_RING_EFFECT_SCALE;
            }
            else {
                this._cpEffect?.dispose();
            }
        }
        public get x(): number {
            return this._x;
        }
        public set y(value: number) {
            if (this._dispaly) {
                this._y = value;
                this._dispaly.y = value;
                this._lbName.y = value - 112 * this._scale + this.getPartyDiffY();
                this._progress && (this._progress.y = value - 140);
                this._title && (this._title.y = value - this.TITLE_HEIGHT * this._scale + this.getPartyDiffY());
                this._basket && (this._basket.y = value);
                this._swim && (this._swim.y = value - this.SWIMSUIT_HEIGHT * this._scale);
                this._badgeBg.y = value - 105 * this._scale + this.getPartyDiffY();
                this._badgeDec.y = value - 105 * this._scale + this.getPartyDiffY();
                this._cpEffect && (this._cpEffect.y = value);
                for (const o of this._funnyToyMap.getValues()) {
                    if (o.img)
                        o.img.y = value + o.diffY;
                    if (o.ani)
                        o.ani.y = value + o.diffY;
                }
            }
        }
        private getPartyDiffY(): number {
            let diff = 0;
            if (MapInfo.isParty) {
                diff = -110;
            }
            return diff;
        }
        public get y(): number {
            return this._y;
        }
        public set scale(value: number) {
            if (this._dispaly) {
                this._scale = value;
                this._dispaly.scale(value * this.bodySetScale, value * this.bodySetScale);
                this._lbName.scale(value * 0.5, value * 0.5);
                this._title?.scale(value * 0.4, value * 0.4);
                this._swim?.scale(value * 0.6, value * 0.6);
                this._snowMan?.scale(value * 0.6, value * 0.6);
                this._badgeBg?.scale(value * 0.1, value * 0.1);
                this._badgeDec?.scale(value * 0.1, value * 0.1);
                if (this._cpEffect) {
                    this._cpEffect.scaleX = this._cpEffect.scaleY = value * this.CP_RING_EFFECT_SCALE;
                }
                this.pos(this.x, this.y);
            }
        }
        public get scale(): number {
            return this._scale;
        }
        public set rotation(value: number) {
            this._rotation = value;
            this._dispaly.rotation = value;
        }
        public get rotation(): number {
            return this._rotation;
        }
        public get visible(): boolean {
            return this._visible;
        }
        public set visible(value: boolean) {
            this._visible = value;
            this._dispaly && (this._dispaly.visible = value && this.checkShowBody());
            this._lbName && (this._lbName.visible = value);
            this._progress && (this._progress.visible = value);
            this._pet && (this._pet.visible = value);
            this._badgeBg && (this._badgeBg.visible = value);
            this._badgeDec && (this._badgeDec.visible = value);
            this._cpEffect && (this._cpEffect.visible = false);
            for (const o of this._funnyToyMap.getValues()) {
                if (o.img)
                    o.img.visible = value;
                if (o.ani)
                    o.ani.visible = value;
            }
        }
        public get id(): number {
            return this._id;
        }
        public pos(x: number, y: number): void {
            this.x = x;
            this.y = y;
        }

        /** 是否翻转*/
        public reversal(bool: Boolean): void {
            this._dirction = bool ? 1 : 0;
            this._dispaly.scaleX = bool ? -this._scale * this.bodySetScale : this._scale * this.bodySetScale;
            this._dispaly.scaleY = this._scale * this.bodySetScale;
            this._swim && (this._swim.scaleX = bool ? -this._scale * 0.6 : this._scale * 0.6);
            this._swim && (this._swim.scaleY = this._scale * 0.6);
            let arr = _.map(this._funnyToyMap.getValues(), o => o.img);
            for (const img of arr) {
                if (img)
                    img.scaleX = bool ? -1 : 1;
            }
        }

        /** 方向 0-左 1-右*/
        public get dirction(): number {
            return this._dirction;
        }

        /** 飞行动作*/
        public flyAcceleration(): void {
        }

        public flySlowDown(): void {
        }

        /**
         * 创建花宝
         */
        public creFlowerPet(bigType: number, littleType: number, x: number, y: number): void {
            if (MapInfo.mapID == 24) return;
            if (!this._pet) {
                this._pet = new Pet();
                this._pet.init(bigType, littleType, this);
            }
            x = this._dirction == 0 ? x + 120 : x - 120;
            y = y - 60;
            this._pet.pos(x, y);
        }

        /**
         * 更换花宝
         * @param type 
         * @param lv 
         */
        public changeFlowerPet(bigType: number, littleType: number): void {
            if (this._pet) {
                let x: number = this._pet.x;
                let y: number = this._pet.y;
                this._pet.dispose();
                this._pet = null;
                this.creFlowerPet(bigType, littleType, x, y);
            }
        }

        public showFlowerPet(isShow: boolean): void {
            this._pet && (this._pet.visible = isShow && MapInfo.mapID != 24);
        }

        /** 显示收集进度*/
        public showProgress(progress: Laya.Sprite): void {
            this._progress = progress;
            this._progress.pos(this._x, this.y - 140);
            PersonLayer.ins.progressLayer.addChild(this._progress);
            this._progress.mouseEnabled = false;
            if (this._id != LocalInfo.uid && !PeopleManager.showPlayerFlag) {
                this._progress.visible = false;
            }
        }

        /**
         * 展示称号
         * @param path 资源地址 
         */
        public showTitle(path: string): void {
            if (this._title.skin == path) return;
            this._title.skin = path;
            PersonLayer.ins.addUI(this._title, PersonLayer.ins.titleLayer);
        }

        public setTitleVisb(isShow: boolean): void {
            this._title && (this._title.visible = isShow);
        }

        /**
         * 检查泳衣
         */
        public checkSwimsuit() {
            let info = OnsenRyokanManager.ins.getOneInfo(this._data.userid);
            if (info) {
                this.showSwimsuit(info.sex, info.image);
                this.setSwimsuitVisible(true);
            }
        }

        /**
         * 展示泳衣
         * @param path 资源地址
         */
        public showSwimsuit(sex: number, img: number) {
            if (!this._swim) this._swim = new Swim();
            let url = `res/swimsuit/${sex}_${img}.png`;
            this._swim.skin = url;
            PersonLayer.ins.bodyLayer.addChild(this._swim.base);
            if (this._data.userid == LocalInfo.uid) this._swim.base.zOrder = 2;
            else this._dispaly.zOrder = 1;
        }

        public setSwimsuitVisible(isShow: boolean) {
            this._swim && (this._swim.visible = isShow);
            this._dispaly.visible = !isShow;
        }

        /**
         * 展示雪人
         * @param path 资源地址 
         */
        public showSnowman() {
            this._isSnowMan = true;
            if (!this._snowMan) this.addSnowMan();
            this._tempVisible = this.visible;
            this.visible = false;
            this._snowmanCd = 20;
            this._loopTime.text = "复原倒计时：20";
            PersonLayer.ins.bodyLayer.addChild(this._snowMan);
            this._snowMan.pos(this._x - 81, this._y - 93);
            this._snowMan.visible = true;
            this._clickTime = 0;
            Laya.timer.loop(1000, this, this.loopTime);
            if (!this._snowManAni) {
                this._snowManAni = clientCore.BoneMgr.ins.play("res/animate/chrismasInteract/snowman.sk", 0, true, this._snowMan, { addChildAtIndex: 0 });
                this._snowManAni.pos(134, 212);
            }
            BC.addOnceEvent(this, this._snowMan, Laya.Event.CLICK, this, this.showUserInfo);
        }

        private addSnowMan() {
            this._snowMan = new Laya.Sprite();
            this._snowMan.width = 480;
            this._snowMan.height = 280;
            this._snowMan.visible = false;
            this._snowMan.scale(0.6, 0.6);
            this._diLoopTime = new Laya.Image("res/animate/chrismasInteract/di_time.png");
            this._snowMan.addChild(this._diLoopTime);
            this._diLoopTime.pos(35, 220);
            this._loopTime = new Laya.Label();
            this._loopTime.font = "汉仪中圆简";
            this._loopTime.fontSize = 20;
            this._loopTime.color = "#ffffff";
            this._snowMan.addChild(this._loopTime);
            this._loopTime.pos(47, 221);
        }

        protected loopTime() {
            // this._snowmanCd--;
            // this._loopTime.text = "复原倒计时：" + this._snowmanCd;
            // if (this._snowmanCd <= 0) {
            //     Laya.timer.clear(this, this.loopTime);
            // }
        }

        public hideSnowman() {
            Laya.timer.clear(this, this.loopTime);
            BC.removeEvent(this, this._snowMan, Laya.Event.CLICK, this, this.showUserInfo);
            if (!this._clearAni) {
                this._clearAni = clientCore.BoneMgr.ins.play("res/animate/chrismasInteract/clear.sk", 0, false, this._snowMan);
                this._clearAni.pos(134, 212);
            }
            this._clearAni.once(Laya.Event.COMPLETE, this, this.clearSnow);
        }

        private clearSnow() {
            this._clearAni.dispose();
            this._clearAni = null;
            this._snowMan.visible = false;
            this._isSnowMan = false;
            this.visible = this._tempVisible;
        }

        public creatBasket() {
            if (MapInfo.mapID != 11) return;
            if (!this._basket) {
                this._basket = new Basket();
                this._basket.init(this);
            }
        }

        private limitEffect: clientCore.Bone;
        public isLimit:boolean;
        public showLimitEffect() {
            this.isLimit = true;
            this._alert.visible = true;
            PersonLayer.ins.bodyLayer.addChild(this._alert);
            this.limitEffect?.dispose();
            this.limitEffect = clientCore.BoneMgr.ins.play("res/animate/activity/effect.sk", 0, true, this._dispaly);
            // this.limitEffect.pos(134, 212);
        }

        public clearLimitEffect() {
            this.isLimit = false;
            this._alert.visible = false;
            this.limitEffect?.dispose();
            this.limitEffect = null;
        }

        /**更换坐骑姿势 */
        public changeRiderPosture(idx:number){

        }

        protected getPosName() {
            if (this._haveRider) {
                return ["zuoxia", "zuoxia1", "zuoxia4", "zuoxia5"][this._data.actionId];
                // if (clientCore.LocalInfo.sex == 1) {
                //     return ["zuoxia", "zuoxia1", "zuoxia4", "zuoxia5"][this._data.actionId];
                // } else {
                //     return ["zuoxia", "zuoxia1", "zuoxia4", "zuoxia5"][this._data.actionId];
                // }
            }
            return "huxi";
        }

        public dispose(): void {
            BC.removeEvent(this);
            if (this._isSnowMan) this.hideSnowman();
            this._dispaly?.destroy();
            this._lbName?.destroy();
            this._title?.destroy();
            this._basket?.dispose();
            this._swim?.destroy();
            this._loopTime?.destroy();
            this._diLoopTime?.destroy();
            this._snowMan?.destroy();
            this._alert?.destroy();
            this._snowManAni?.dispose(false);
            this._clearAni?.dispose(false);
            this._pet?.dispose();
            this._badgeDec?.destroy();
            this._badgeBg?.destroy();
            this._cpEffect?.dispose();
            this._alert = this._swim = null;
            this._diLoopTime = this._loopTime = this._snowMan = this._snowManAni = this._clearAni = this._badgeBg = this._badgeDec = this._pet = this._progress = this._lbName = this._dispaly = null;
            let arr = _.map(this._funnyToyMap.getValues(), o => o.img);
            for (const img of arr) {
                if (img)
                    img.destroy();
            }
            let aniArr = _.map(this._funnyToyMap.getValues(), o => o.ani);
            for (const ani of aniArr) {
                if (ani)
                    ani.dispose();
            }
            this._funnyToyMap.clear();
        }

        protected addClickArea() {
            this._clickArea = new Laya.Sprite();
            this._clickArea.width = 80 / this.bodySetScale;
            this._clickArea.height = 180 / this.bodySetScale;
            this._clickArea.x = -40 / this.bodySetScale;
            this._clickArea.y = -90 / this.bodySetScale;
            this._clickArea.graphics.clear();
            this._clickArea.graphics.drawRect(0, 0, this._clickArea.width, this._clickArea.height, "#000000");
            this._clickArea.alpha = 0;
            this._dispaly.addChild(this._clickArea);
            BC.addEvent(this, this._clickArea, Laya.Event.MOUSE_DOWN, this, this.showUserInfo);
        }
        protected showUserInfo(e: Laya.Event) {
            e.stopPropagation();
        }
    }
}