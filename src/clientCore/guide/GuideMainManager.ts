namespace clientCore {
    export class GuideMainManager {
        private static _instance: GuideMainManager;
        private _ui: ui.newPlayerGuide.newPlayerGuideUI;
        private _mainStep: number;
        private _subStep: number;
        private _guideInfoArr: xls.newPlayerGuide[];
        private _curGuideInfo: xls.newPlayerGuide;
        private _curHoleInfo: GuideHoleInfo;
        private _bgArr: Laya.Sprite[];
        private _movieSk: Laya.Skeleton;
        private _movieCon: Laya.Sprite;
        private _handMovieSk: Laya.Skeleton;

        public isGuideAction: boolean = false;//表示是否正在进行新手引导
        public static get instance(): GuideMainManager {
            if (!this._instance) {
                this._instance = new GuideMainManager();
            }
            return this._instance;
        }
        /**
         * 初始化引导步骤
         */
        public initGuideStep(mStep: number, sStep: number) {
            this._mainStep = mStep;
            this._subStep = sStep;
            this._curGuideInfo = this.findCurGuideInfo();
            if (this._curGuideInfo.skip.v1 > 0 && this._curGuideInfo.skip.v2 > 0) {
                this._mainStep = this._curGuideInfo.skip.v1;
                this._subStep = this._curGuideInfo.skip.v2;
                this._curGuideInfo = this.findCurGuideInfo();
            }
            this.checkChangeNpc();
        }
        public setUp(): void {
            this._ui = new ui.newPlayerGuide.newPlayerGuideUI();
            this.initBg();
            this.initSk();
            this.addEventListeners();
            this._guideInfoArr = xls.get(xls.newPlayerGuide).getValues();
            this.addEventListeners();
            GuideStepControl.instance.setUp();

            this._ui.mcTalkCon.mouseEnabled = true;
            this._ui.mcTalkCon.mouseThrough = true;
            this._ui.mcBack.visible = false;
        }

        private onForceSkip() {
            //二次确认 调整层级
            Laya.stage.addChild(LayerManager.alertLayer);
            alert.showSmall('是否跳过所有新手引导？', {
                callBack: {
                    caller: this,
                    funArr: [this.sureForceSkip, this.recoverLayer]
                }
            })
        }
        private sureForceSkip() {
            this.recoverLayer();
            this.setPartGuideCompleteState();
            clientCore.PartyManager.openGuideFlag = false;
            clientCore.RestaurantManager.openGuideFlag = false;
        }
        private recoverLayer() {
            let idx = Laya.stage.getChildIndex(LayerManager.upMainLayer);
            Laya.stage.addChildAt(LayerManager.alertLayer, idx + 1);
        }
        private initSk() {
            this._movieSk = new Laya.Skeleton();
            this._movieSk.load("res/animate/guide/guideLight.sk", Laya.Handler.create(this, () => {
                this._ui.addChild(this._movieSk);
                this._movieSk.mouseEnabled = false;
            }));

            this._handMovieSk = new Laya.Skeleton();
            this._handMovieSk.load("res/animate/guide/hand.sk", Laya.Handler.create(this, () => {
                this._ui.addChild(this._handMovieSk);
                this._handMovieSk.mouseEnabled = false;
            }));
        }
        private initBg(): void {
            this._bgArr = [];
            for (let i = 0; i < 5; i++) {
                this._bgArr.push(new Laya.Sprite());
                this._bgArr[i].alpha = 0.5;
                this._ui.addChildAt(this._bgArr[i], 0);
                this._bgArr[i].mouseEnabled = true;
            }
            this._ui.mcRoundMask.alpha = 0.5;

            this._ui.mouseThrough = true;
            this._ui.mcArrow.mouseEnabled = false;
        }
        public startGuide(): void {
            if (!GlobalConfig.isGuideOpen) {
                this.skipStep(99, 1);
                return;
            }
            console.log(`start new player guide, guide step is ${this._mainStep}  ${this._subStep}`);
            //这里需要拉一下当前的步骤，因为上面initGuideStep的时候，有可能步骤跳转了，所以这里初始化当前步骤不能去掉
            this._curGuideInfo = this.findCurGuideInfo();
            this.showGuide();
            if (this._curGuideInfo && this._curGuideInfo.mainID < 99)
                this.isGuideAction = true;
            if(this._mainStep < 99)
                net.send(new pb.cs_advance_new_player_guide({ guideMainStep: this._mainStep, guideSubStep: this._subStep }));
            EventManager.event("NEW_PLAYER_START_GUIDE");
        }
        public skipStep(id1: number, id2: number) {
            this._mainStep = id1;
            this._subStep = id2;
        }
        private findCurGuideInfo(): xls.newPlayerGuide {
            for (let i = 0; i < this._guideInfoArr.length; i++) {
                if (this._guideInfoArr[i].mainID == this._mainStep && this._guideInfoArr[i].stepID == this._subStep) {
                    return this._guideInfoArr[i];
                }
            }
            return null;
        }

        private showGuide(): void {
            if (this._curGuideInfo.type == 1) {/**播放配表动画 */
                clientCore.AnimateMovieManager.showAnimateMovie(this._curGuideInfo.data, this, this.onAnimateMoviePlayOver);
            }
            GuideStepControl.instance.showUIByStep(this._mainStep, this._subStep);
        }
        private onAnimateMoviePlayOver() {
            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
        }
        /**
         * 显示引导，包括遮罩、箭头、npc已经说明文字
         * 单独一个接口，有些引导需要打开模块之后显示
         * 通过事件来显示
         */
        private showGuideCoverUI(): void {
            console.log("show  " + this._mainStep + "_" + this._subStep + " ui");
            if (this._ui.mcBack.visible == true) {
                this._ui.txtNpcWord.text = "快点击这里返回自己的家园吧！";
            }
            else {
                this._ui.txtNpcWord.text = this._curGuideInfo.npcTalk;
            }

            if (this._curHoleInfo.pos.x > 350) {
                this._ui.mcLeftNpc.visible = true;
                this._ui.mcRightNpc.visible = false;
                this._ui.btnSkip.x = 181;
            }
            else {
                this._ui.mcLeftNpc.visible = false;
                this._ui.mcRightNpc.visible = true;
                this._ui.btnSkip.x = 729;
            }
            this._ui.mcTalkCon.visible = this._curGuideInfo.npcShowFlag == 1;
            this._ui.mcArrow.visible = this._curGuideInfo.arrowHideFlag == 0;
            this._movieSk.visible = this._curGuideInfo.arrowHideFlag == 0;

            this.drawBgDigHole(this._curHoleInfo.pos.x, this._curHoleInfo.pos.y, this._curHoleInfo.width, this._curHoleInfo.height);
            if (this._curGuideInfo.arrowRotation == "up") {
                this._ui.mcArrow.x = this._curHoleInfo.pos.x + (this._curHoleInfo.width - this._ui.mcArrow.width) / 2;
                this._ui.mcArrow.scaleY = -1;
                this._ui.mcArrow.y = this._curHoleInfo.pos.y + this._curHoleInfo.height + 50;
            }
            else {
                this._ui.mcArrow.x = this._curHoleInfo.pos.x + (this._curHoleInfo.width - this._ui.mcArrow.width) / 2;
                this._ui.mcArrow.scaleY = 1;
                this._ui.mcArrow.y = this._curHoleInfo.pos.y - 50 - 10;
            }
            this.setNpcTalkPos();
            clientCore.LayerManager.guideLayer.addChild(this._ui);
            this._movieSk.pos(this._curHoleInfo.pos.x + this._curHoleInfo.width / 2, this._curHoleInfo.pos.y + this._curHoleInfo.height / 2);
            this._handMovieSk.pos(this._curHoleInfo.pos.x + this._curHoleInfo.width / 2, this._curHoleInfo.pos.y + this._curHoleInfo.height / 2);
            this._ui.aniArrow.play(0, true);
            //第一步手型特殊处理
            this._handMovieSk.visible = false;
            if (this._curGuideInfo.mainID == 1 && this._curGuideInfo.stepID == 1) {
                this._handMovieSk.visible = true;
                this._movieSk.visible = false;
            }
        }
        private setNpcTalkPos(): void {
            if (this._ui.mcTalkCon.visible) {
                let lr = "";//left right
                let ud = "";//up  down
                if (this._curHoleInfo.pos.x > Laya.stage.width - this._curHoleInfo.pos.x - this._curHoleInfo.width) {
                    lr = "left";
                }
                else {
                    lr = "right";
                }

                if (this._curHoleInfo.pos.y > Laya.stage.height - this._curHoleInfo.pos.y - this._curHoleInfo.height) {
                    ud = "up";
                }
                else {
                    ud = "down"
                }
                if (lr == "left") {
                    this._ui.mcTalkCon.x = this._curHoleInfo.pos.x - this._ui.mcTalkCon.width;
                }
                else {
                    this._ui.mcTalkCon.x = this._curHoleInfo.pos.x + this._curHoleInfo.width;
                }
                if (ud == "up") {
                    this._ui.mcTalkCon.y = this._curHoleInfo.pos.y - this._ui.mcTalkCon.height;
                }
                else {
                    this._ui.mcTalkCon.y = this._curHoleInfo.pos.y + this._curHoleInfo.height;
                }

                if (this._ui.mcTalkCon.x < 0) {
                    this._ui.mcTalkCon.x = 0;
                }
                else if (this._ui.mcTalkCon.x + this._ui.mcTalkCon.width > Laya.stage.width) {
                    this._ui.mcTalkCon.x = Laya.stage.width - this._ui.mcTalkCon.width;
                }
                if (this._ui.mcTalkCon.y < 0) {
                    this._ui.mcTalkCon.y = 0;
                }
                else if (this._ui.mcTalkCon.y + this._ui.mcTalkCon.height > Laya.stage.height) {
                    this._ui.mcTalkCon.y = Laya.stage.height - this._ui.mcTalkCon.height;
                }
            }

        }
        public drawBgDigHole(x: number, y: number, w: number, h: number): void {
            for (let i = 0; i < this._bgArr.length; i++) {
                this._bgArr[i].graphics.clear();
            }
            let sw = Laya.stage.width;
            let sh = Laya.stage.height;

            if (w == 0 || h == 0) {
                this.drawBg(this._bgArr[0], 0, 0, sw, sh, "#000000", this._curGuideInfo.maskAlpha);
                return;
            }

            this.drawBg(this._bgArr[0], 0, 0, x, sh, "#000000", this._curGuideInfo.maskAlpha);
            this.drawBg(this._bgArr[1], x, 0, sw - x, y, "#000000", this._curGuideInfo.maskAlpha);
            this.drawBg(this._bgArr[2], x + w, y, sw - x - w, h, "#000000", this._curGuideInfo.maskAlpha);
            this.drawBg(this._bgArr[3], x, y + h, sw - x, sh - y - h, "#000000", this._curGuideInfo.maskAlpha);
            // 

            if (this._curGuideInfo.blockAlpha < 0.1 && this._curGuideInfo.maskAlpha < 0.1) {
                this.drawBg(this._bgArr[4], x, y, w, h, "#000000", this._curGuideInfo.blockAlpha);
                this._bgArr[4].visible = true;
                this._bgArr[4].mouseEnabled = this._curGuideInfo.blockThrough == 0;

                this._ui.mcRoundMask.visible = false;
            }
            else {
                this._ui.mcRoundMask.visible = true;
                this._bgArr[4].visible = false;
                this._ui.mcRoundMask.x = x;
                this._ui.mcRoundMask.y = y;
                this._ui.mcRoundMask.width = w;
                this._ui.mcRoundMask.height = h;
                this._ui.mcRoundMask.mouseEnabled = this._curGuideInfo.blockThrough == 0;
            }
            // if( this._curGuideInfo.maskAlpha < 0.1){
            //     console.log("roundMask visible false");
            //     this._ui.mcRoundMask.visible = false;
            // }
            // else {
            //     console.log("roundMask visible true");
            //     this._ui.mcRoundMask.visible = true;
            // }
        }
        private drawBg(mc: Laya.Sprite, x: number, y: number, w: number, h: number, color: string, a: number): void {
            mc.x = x;
            mc.y = y;
            mc.graphics.drawRect(0, 0, w, h, color);
            mc.width = w;
            mc.height = h;
            mc.alpha = a;
        }
        public get curGuideInfo(): xls.newPlayerGuide {
            if (this._curGuideInfo)
                return this._curGuideInfo;
            let info = new xls.newPlayerGuide();
            info.mainID = 99;
            info.stepID = 1;
            return info;
        }
        public setPartGuideCompleteState() {
            this.hideGuidUI();
            this.skipStep(99, 1);
            this._curGuideInfo = this.findCurGuideInfo();
            net.send(new pb.cs_advance_new_player_guide({ guideMainStep: this._mainStep, guideSubStep: this._subStep }));
            this.isGuideAction = false;
        }
        private onOneStepCom(e: Laya.Event) {
            console.log(`guide step ${this._mainStep} ${this._subStep} complete!`);
            if (this.curGuideInfo.type == 4) {/**小步骤引导到此结束 */
                this.setPartGuideCompleteState();
                return;
            }
            // if(!this.isGuideAction){
            //     return;
            // }
            /** 同步引导步骤 */
            this._subStep++;
            this._curGuideInfo = this.findCurGuideInfo();
            if (this._curGuideInfo == null) {
                this._mainStep++;
                //这里判断一下是不是全部任务做完
                this._subStep = 1;
                this._curGuideInfo = this.findCurGuideInfo();
                this.checkChangeNpc();

            }
            this._ui.removeSelf();
            this._ui.aniArrow.stop();
            this.showGuide();

            net.send(new pb.cs_advance_new_player_guide({ guideMainStep: this._mainStep, guideSubStep: this._subStep }));
        }
        private checkChangeNpc() {
            if (this.curGuideInfo.npcID == 1) {
                this._ui.mcLeftNpc.skin = "newPlayerGuide/npc1.png";
                this._ui.mcRightNpc.skin = "newPlayerGuide/npc1.png";
                this._ui.txtNpcName.text = "露莎仙女";
            }
            else if (this.curGuideInfo.npcID == 2) {
                this._ui.mcLeftNpc.skin = "newPlayerGuide/npc2.png";
                this._ui.mcRightNpc.skin = "newPlayerGuide/npc2.png";
                this._ui.txtNpcName.text = "琳恩";
            }
        }
        public hideGuidUI() {
            if (this._ui) {
                this._ui.removeSelf();
                this._ui.aniArrow.stop();
            }
        }
        private onGuideUIClick(e: Laya.Event) {
            if (this._curGuideInfo.operationBehavior == "clickBlank") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                EventManager.event("guide_click_blank");
            }
        }
        private _sp: Laya.Sprite = new Laya.Sprite();
        private _clickObj: Laya.UIComponent;
        private onDrawHoleInfoBack(obj: any) {
            if (obj) {
                let realObj = obj.hasOwnProperty("guideRealTarget") ? obj.guideRealTarget : obj;
                realObj.addChild(this._sp);
                let pos: Laya.Point = this._sp.localToGlobal(new Laya.Point(0, 0));
                let holeInfo = new clientCore.GuideHoleInfo();
                holeInfo.pos = new Laya.Point(Math.floor(pos.x), Math.floor(pos.y));
                holeInfo.width = Math.floor(realObj.width * Math.abs(realObj.scaleX));
                holeInfo.height = Math.floor(realObj.height * Math.abs(realObj.scaleY));
                this._curHoleInfo = holeInfo;
                console.log(`hole info : x: ${this._curHoleInfo.pos.x} y: ${this._curHoleInfo.pos.y} w: ${this._curHoleInfo.width} h: ${this._curHoleInfo.height} `);

                /**
                * 自动点击代码
                */
                if (GlobalConfig.guideAutoPlay && GuideMainManager.instance.curGuideInfo.blockThrough == 1) {
                    Laya.timer.once(600, this, () => {
                        let event = new Laya.Event();
                        if (obj.hasOwnProperty("guideRealTarget")) {
                            obj.cell.event(Laya.Event.CLICK, event.setTo(Laya.Event.CLICK, obj.cell, obj.guideRealTarget));
                        }
                        else {
                            if (obj.hasListener(Laya.Event.CLICK)) {
                                obj.event(Laya.Event.CLICK, event.setTo(Laya.Event.CLICK, obj, obj));
                            }
                            else if (obj.hasListener(Laya.Event.MOUSE_DOWN)) {
                                obj.event(Laya.Event.MOUSE_DOWN, event.setTo(Laya.Event.MOUSE_DOWN, obj, obj));
                            }
                        }
                    });
                }
            }
            else {
                let tmpHoleInfo = new clientCore.GuideHoleInfo();
                tmpHoleInfo.pos = new Laya.Point(50, 50);
                tmpHoleInfo.width = Laya.stage.width - 100;
                tmpHoleInfo.height = Laya.stage.height - 100;
                this._curHoleInfo = tmpHoleInfo;
                console.log(`hole obj is null!!! `);
            }
            this.showGuideCoverUI();
            /**
             * 自动点击代码
             */
            if (GlobalConfig.guideAutoPlay) {
                if (this._curGuideInfo.operationBehavior == "clickBlank") {
                    Laya.timer.once(600, this, () => {
                        let event = new Laya.Event();
                        this._ui.event(Laya.Event.CLICK, event.setTo(Laya.Event.CLICK, this._ui, this._ui));
                    });
                }
            }
        }
        private findInList(obj: any): any {
            let curObj = obj;
            while (curObj != Laya.stage) {
                if (curObj instanceof Laya.List) {
                    return curObj;
                }
                curObj.parent && (curObj = curObj.parent);
            }
            return null;
        }
        private addEventListeners(): void {
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_STEP_COM, this, this.onOneStepCom);
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this, this.onDrawHoleInfoBack);
            BC.addEvent(this, this._ui, Laya.Event.CLICK, this, this.onGuideUIClick);
            BC.addEvent(this, this._ui.btnSkip, Laya.Event.CLICK, this, this.onForceSkip);

            BC.addEvent(this, this._ui.btnBackHome, Laya.Event.CLICK, this, this.onBackHomeClick);
        }
        private onBackHomeClick(e: Laya.Event) {
            this._ui.mcBack.visible = false;
            this.hideGuidUI();
            this.closeAllModules();
            if (!MapInfo.isSelfHome) {
                if (MapManager.isPickingMapItem) {/**在场景里面采集，采集过程中是不能跳地图的，新手引导这里，需要判断下，如果在采集中，那么停止采集，然后跳地图 */
                    UserPickManager.ins.stopPick();
                }
                EventManager.once(globalEvent.ENTER_MAP_SUCC, this, () => {
                    Laya.timer.frameOnce(3,this,()=>{
                        this.startGuide();
                    })
                    
                });
                MapManager.enterHome(LocalInfo.uid);
            }
            else {
                this.startGuide();
            }
        }
        public checkGuideByLevelUp() {
            if (!GlobalConfig.isGuideOpen) {
                return;
            }
            let lv = LocalInfo.userLv;
            for (let i = 0; i < this._guideInfoArr.length; i++) {
                if (this._guideInfoArr[i].openLevel == lv) {
                    this._mainStep = this._guideInfoArr[i].mainID;
                    this._subStep = this._guideInfoArr[i].stepID;
                    this._curGuideInfo = this.findCurGuideInfo();
                    this.isGuideAction = true;
                    // if(this._mainStep == 19 && this._subStep == 1){
                    //     debugger;
                    // }
                    this.checkShowBackHomeBtn();
                    console.log(`start guide level up  mainID:${this._mainStep}  subID:${this._subStep}`);
                    break;
                }
            }
        }
        public checkGuideByStageComplete(stageID: number) {
            if (!GlobalConfig.isGuideOpen) {
                return;
            }
            if (stageID > 0) {
                for (let i = 0; i < this._guideInfoArr.length; i++) {
                    if (this._guideInfoArr[i].openLevel == stageID) {
                        this._mainStep = this._guideInfoArr[i].mainID;
                        this._subStep = this._guideInfoArr[i].stepID;
                        this.isGuideAction = true;
                        // if(this._mainStep == 19 && this._subStep == 1){
                        //     debugger;
                        // }
                        this.checkShowBackHomeBtn();
                        console.log(`start guide stage up  mainID:${this._mainStep}  subID:${this._subStep}`);
                        break;
                    }
                }
            }
        }
        private checkShowBackHomeBtn() {
            if (!MapInfo.isSelfHome) {/**不在自己的家园，需要把模块全部关掉，然后回家园 */
                this.showBackBtn();
            }
            else {/**在自己的家园， 判断有没有模块打开*/
                if (DialogMgr.ins.curShowPanelNum > 0 || ModuleManager.curShowModuleNum > 0 || ModuleManager.opening) {
                    this.showBackBtn();
                }
                else {
                    this.startGuide();
                    /**showGuide 方法没有用，因为设置了特殊处理 */
                    // EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            }
        }
        private closeAllModules() {
            ModuleManager.closeAllOpenModule();
            DialogMgr.ins.closeAllDialog();
        }
        private showBackBtn() {
            if (this._ui.mcBack.numChildren == 1) {
                let sp = new Laya.Sprite();
                sp.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, '#000000');
                sp.width = Laya.stage.width;
                sp.height = Laya.stage.height;
                sp.alpha = 0;
                this._ui.mcBack.addChildAt(sp, 0);
            }
            this._ui.mcBack.visible = true;
            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this._ui.btnBackHome);
        }

        private removeEventListeners(): void {
            BC.removeEvent(this);
        }
        public destroy(): void {
            this.removeEventListeners();
        }
    }
}