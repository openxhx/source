namespace meteorShowerGame {
    /**
     * 一起去看流星雨游戏
     * meteorShowerGame.MeteorShowerGameModule
     * 策划案：\\10.1.1.98\incoming\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\1127\一起去看流星雨_connie.xlsx
     */
    export class MeteorShowerGameModule extends ui.meteorShowerGame.MeteorShowerGameModuleUI {
        private _rocker: Rocker;
        private _camera: Camera;
        private _t: time.GTime;
        private _time: number;
        private _cfg: xls.gameStarFly;
        private _source: number = 0;
        private _is4: boolean;
        private _is5: boolean;
        private _4die: number = 0;
        private _5die: number = 0;
        private _maxSouce: number;
        constructor() { super(); }

        init(data: number): void {
            super.init(data);
            this.resizeView();
            this.clickLayer.width = Laya.stage.width;
            this.clickLayer.height = Laya.stage.height;
            //摇杆
            this._rocker = new Rocker();
            this._rocker.configure(this.clickLayer);
            //相机
            this._camera = new Camera();
            //配置预加载
            this.addPreLoad(xls.load(xls.gameStarFly));
            this.addPreLoad(res.load('res/activity/meteor/data.json'));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(15, clientCore.LocalInfo.uid).then((msg: clientCore.RankInfo) => {
                this._maxSouce = msg.msg.score;
            }));
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onBack);
            BC.addEvent(this, EventManager, Constant.TRIGGER_STAR, this, this.onTriggerEnter);
            BC.addEvent(this, EventManager, Constant.STAR_DIED, this, this.onStarDied);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
            Laya.timer.clear(this,this.update);
        }

        onPreloadOver(): void {
            this._cfg = xls.get(xls.gameStarFly).get(this._data);
        }

        popupOver(): void {
            this.initPlayer();
            this.sourceTxt.changeText('0');
            this.maxTxt.changeText(this._maxSouce + '');
            this.boxPlayer.addComponent(Player);
            this._rocker.player = this.boxPlayer;
            this._rocker.camera = this._camera;
            //背景图
            this.initMap();
            //定时器
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 500, this, this.onTime);
            this.prepare();
            this._startTime = Date.now();
            Laya.timer.frameLoop(1, this, this.update);
        }

        private _startTime: number;
        private update() {
            //根据时间设置背景位置
            this._camera?.updateBg((Date.now() - this._startTime) / this._cfg.time / 1000);
        }

        destroy(): void {
            clientCore.ModuleManager.open('meteorShower.MeteorShowerModule');
            util.TweenUtils.over('MeteorShowerGameModule');
            this._t?.dispose();
            this._t = null;
            this._rocker?.dispose();
            this._rocker = null;
            this._camera?.dispose();
            this._camera = null;
            this._cfg = null;
            super.destroy();
        }

        private initPlayer(): void {
            let player: clientCore.Bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate(clientCore.LocalInfo.sex == 1 ? 'playerF' : 'playerM'), 0, true, this.boxPlayer);
            player.pos(this.boxPlayer.width / 4 * 3, this.boxPlayer.height);
            //芬妮
            let fenni: clientCore.Bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('fenni'), 0, true, this.boxPlayer);
            fenni.pos(this.boxPlayer.width / 3, this.boxPlayer.height);
        }

        private prepare(): void {
            this.imgLayer.x = -clientCore.LayerManager.OFFSET;
            this.mapLayer.y = 0;
            this._time = this._cfg.time;
            // this._time = 10;
            this._camera.init(this.mapLayer, this.imgLayer);
            this._curHeight = Config.CREATE_HEIGHT;
            this._rocker.forbidden = true;
            this._camera.speed = new util.Vector2D(0, -this._rocker.maxDis);
            this._camera.lookObj(this.boxPlayer);
            this.boxPlayer.rotation = -18;
            this.boxPlayer.scale(0.6, 0.6);
            this.boxPlayer.y = Laya.stage.height;
            util.TweenUtils.creTween(this.boxPlayer, { scaleX: 1, scaleY: 1, y: 375 }, 1500, null, this, this.gameStart);
        }

        private over(): void {
            this._rocker.forbidden = true;
            this.boxPlayer.rotation = 0;
            util.TweenUtils.creTween(this.boxPlayer, { scaleX: 0.6, scaleY: 0.6, y: 160 }, 1500, null, this, this.gameOver);
        }

        private gameStart(): void {
            net.sendAndWait(new pb.cs_mini_game_begin({ stageId: 60128 })).then(() => {
                this._rocker.forbidden = false;
                this._camera.speed = new util.Vector2D(0, 0);
                this._t.start();
                // this.createStar(4);
            })
        }

        private async gameOver(): Promise<void> {
            Laya.timer.clear(this,this.update);
            clientCore.DialogMgr.ins.closeAllDialog();
            this._camera?.dispose();
            let ret: number = await clientCore.MiniGameResultMgr.openResultPanel({
                isWin: true,
                score: this._source,
                stageId: 60128,
                type: null
            });
            ret == 1 ? this.prepare() : this.destroy();
        }

        private initMap(): void {
            let url: string = 'res/activity/meteor/data.json';
            let data: object = res.get(url);
            let row: number = data['row'];
            let col: number = data['col'];
            let childSize: number[] = data['childSize'];
            let size: number[] = data['size'];
            this.imgLayer.width = size[0];
            this.imgLayer.height = size[1];
            for (let i: number = row-1; i >= 0; i--) {
                for (let j: number = 0; j < col; j++) {
                    let url: string = `res/activity/meteor/${i}_${j}.png`;
                    Laya.loader.load(url, new Laya.Handler(this, (data: Laya.Texture) => {
                        this.imgLayer.graphics.drawImage(data, j * childSize[0], -(row - i) * childSize[1], childSize[0], childSize[1]);
                    }),
                        null,
                        Laya.Loader.IMAGE);
                }
            }
        }

        private onBack(): void {
            alert.showSmall2('是否确认结束游戏，结束后将不能获得奖励', new Laya.Handler(this, () => {
                clientCore.Logger.sendLog('2020年11月27日活动', '【小游戏】一起来看流星雨', '中途离开小游戏');
                this.destroy();
            }));
        }

        private _times: number = 0;
        private onTime(): void {
            this.createWave();
            if (this._times == 1) {
                this._times = 0;
                return;
            }
            this._times++;
            if (this._time-- <= 0) {
                this._t?.stop();
                this.over();
                return;
            }
            this.createCloud();
            this.timeTxt.changeText(`倒计时：${util.StringUtils.getDateStr2(this._time, '{min}:{sec}')}″`);
            this.mapLayer.y > this._cfg.refreshHeight[3].v2 * 100 && this.createStar(4);
            this.mapLayer.y > this._cfg.refreshHeight[4].v2 * 100 && this.createStar(5);
        }

        private createStar(type: number): void {
            if (type == 0) return;
            if (type == 4 && (this._is4 || this.mapLayer.y - this._4die < this._cfg.probability[3].v2 * 100)) return;
            if (type == 5 && (this._is5 || this.mapLayer.y - this._5die < this._cfg.probability[4].v2 * 100)) return;
            type == 4 && (this._is4 = true);
            type == 5 && (this._is5 = true);
            let star: Laya.Image = new Laya.Image(`meteorShowerGame/star_${type}.png`);
            let dir: number = _.random(0,1);
            if (type == 4 || type == 5) {
                star.pos(-this.mapLayer.x + (dir ? 0 : Laya.stage.designWidth), -this.mapLayer.y);
            } else {
                star.pos(_.random(0, Laya.stage.width) - this.mapLayer.x - clientCore.LayerManager.OFFSET, _.random(-Laya.stage.height / 2, 0) - this.mapLayer.y);
            }
            this.mapLayer.addChild(star);
            let sc: Star = star.addComponent(Star);
            sc.init(type, this.boxPlayer, this._camera, this._rocker.maxDis,dir ? 1 : -1);
        }

        private _curHeight: number = 0;
        /** 创建一波星星*/
        private createWave(): void {
            if (this.mapLayer.y - this._curHeight < Config.ADD_HEIGHT) return;
            this._curHeight = this.mapLayer.y;
            let len: number = _.random(Config.WARE_COUNT[0], Config.WARE_COUNT[1]);
            while (len--) { this.createStar(this.getType()); }
        }

        private _creH: number = 0;
        private createCloud(): void {
            if (this.mapLayer.y <= 9000 || this.mapLayer.y - this._creH < 500) return;
            this._creH = this.mapLayer.y;
            let len: number = _.random(1, 3);
            for (let i: number = 0; i < len; i++) {
                let cloud: Laya.Image = new Laya.Image(`res/activity/meteor/yun${_.random(1, 3)}.png`);
                cloud.pos(_.random(0, Laya.stage.width / 2) - this.mapLayer.x - clientCore.LayerManager.OFFSET, _.random(-Laya.stage.height, -Laya.stage.height / 2) - this.mapLayer.y);
                cloud.addComponent(Cloud);
                this.mapLayer.addChildAt(cloud, 0);
            }
        }

        /** 根据配置表的概率生成星星类型*/
        private getType(): number {
            let array: number[] = [];
            let curr: number = this.mapLayer.y;
            for (let i: number = 0; i < 3; i++) {
                let element: xls.pair = this._cfg.refreshHeight[i];
                if (curr < element.v2 * 100) break;
                array.push(element.v1);
            }
            let len: number = array.length;
            if (len <= 0) return 0;
            let all: number = 0;
            _.forEach(array, (element: number) => { all += this._cfg.probability[element - 1].v2; });
            let random: number = _.random(0, all);
            let now: number = 0;
            for (let i: number = 0; i < len; i++) {
                let value: number = this._cfg.probability[array[i] - 1].v2;
                if (random >= now && random < value + now) return array[i];
                now += value;
            }
            return 0;
        }

        private resizeView(): void {
            let len: number = this.numChildren;
            for (let i: number = 0; i < len; i++) {
                let element: Laya.Sprite = this.getChildAt(i) as Laya.Sprite;
                element.x >= 1111 && (element.x += clientCore.LayerManager.OFFSET);
            }
        }

        private onTriggerEnter(type: number, x: number, y: number): void {
            if (type < 4) {
                core.SoundManager.instance.playSound('res/sound/stand.ogg');
            } else {
                core.SoundManager.instance.playSound('res/sound/bubble.ogg');
            }
            this._source += this.getSource(type);
            let point: number[] = [[1216, 481], [1215, 411], [1210, 330], [1210, 259], [1206, 187]][type - 1];
            let img: Laya.Image = new Laya.Image(`meteorShowerGame/show_${type}.png`);
            img.pos(x, y);
            this.addChild(img);
            util.TweenUtils.creTween(img, { x: point[0] + clientCore.LayerManager.OFFSET, y: point[1] }, 1500, Laya.Ease.cubicOut, this, () => {
                img?.destroy();
                //分数加成
                let lab: Laya.Label = this[`txt${type}`];
                lab.changeText('' + (parseInt(lab.text) + 1));
                this.sourceTxt.changeText(this._source + '');
            }, 'MeteorShowerGameModule');
        }

        private onStarDied(type: number): void {
            this['_is' + type] = false;
            this[`_${type}die`] = this.mapLayer.y;
        }

        private getSource(type: number): number {
            return _.filter(this._cfg.starIntegral, (element: xls.pair) => { return element.v1 == type; })[0].v2;
        }
    }
}