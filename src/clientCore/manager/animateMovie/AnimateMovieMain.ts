namespace clientCore {
    export class AnimateMovieMain {
        public param: AnimateParam;
        private _mainUI: ui.animateMovie.AnimateMovieModuleUI;
        private _mcLeftNpc: Laya.Image;
        private _mcRightNpc: Laya.Image;
        private _mcCenterNpc: Laya.Image;
        private _mcLeftNpcCon: Laya.UIComponent;
        private _mcRightNpcCon: Laya.UIComponent;
        private _mcCenterNpcCon: Laya.UIComponent;

        private _talkJson: any;
        private _talkInfoList: any[];
        private _actionStepIndex: number;

        private _talkControl: AnimateMovieTalkControl;

        private _tweenArr: egret.Tween[];
        private _reviewArr: Array<{ name: string, content: string }>;
        private _reviewPanel: AnimateStoryPanel;
        private _choicePanel: AnimateChoicePanel;
        private _reviewMask: Laya.Sprite;
        private _mask: Laya.Sprite;

        startPlay() {
            this._mask = new Laya.Sprite();
            this._mask.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
            this._mask.width = Laya.stage.width;
            this._mask.height = Laya.stage.height;
            this._mask.mouseEnabled = true;
            this._mask.alpha = this.param.bgAlpha;
            LayerManager.upMainLayer.addChild(this._mask);
            this._mainUI = new ui.animateMovie.AnimateMovieModuleUI();
            LayerManager.upMainLayer.addChild(this._mainUI);
            this._mainUI.x = LayerManager.OFFSET;
            this.initNpc();
            this.onPreloadOver();
            this.addEventListeners();

            if (clientCore.GlobalConfig.guideAutoPlay && clientCore.GuideMainManager.instance.isGuideAction) {
                Laya.timer.once(600, this, () => {
                    this.forceClose();
                });
            }
            this._mainUI.hitArea = new Laya.Rectangle(-clientCore.LayerManager.mainLayer.x, 0, Laya.stage.width, Laya.stage.height);
            this._mainUI.btnClose.pos(60 - (Laya.stage.width - Laya.stage.designWidth) / 2, 40, true);
        }

        private initNpc() {
            this._mcLeftNpcCon = new Laya.UIComponent();
            this._mcRightNpcCon = new Laya.UIComponent();
            this._mcCenterNpcCon = new Laya.UIComponent();

            this._mcLeftNpc = new Laya.Image();
            this._mcRightNpc = new Laya.Image();
            this._mcCenterNpc = new Laya.Image();

            this._mcLeftNpcCon.addChild(this._mcLeftNpc);
            this._mcRightNpcCon.addChild(this._mcRightNpc);
            this._mcCenterNpcCon.addChild(this._mcCenterNpc);

            this._mainUI.mcNpcContainer.addChild(this._mcLeftNpcCon);
            this._mainUI.mcNpcContainer.addChild(this._mcRightNpcCon);
            this._mainUI.mcNpcContainer.addChild(this._mcCenterNpcCon);

            this._mcLeftNpcCon.x = 0 - LayerManager.OFFSET;
            this._mcLeftNpcCon.y = 750;
            this._mcRightNpcCon.x = Laya.stage.width;
            this._mcRightNpcCon.y = 750;
            this._mcCenterNpcCon.x = Laya.stage.width / 2;
            this._mcCenterNpcCon.y = 750;

            this._mcLeftNpcCon.scaleX = -1;
        }
        public onPreloadOver() {
            this._talkControl = new AnimateMovieTalkControl(this._mainUI.mcTalkDialog);

            this._tweenArr = [];
            this._reviewArr = [];
            this._talkJson = clientCore.AnimateMovieManager.animateTalkJson;
            this._mainUI.mcBgImg1.skin = pathConfig.getAnimateBgPath(this._talkJson.defaultBg);
            this._mainUI.mcBgImg2.skin = pathConfig.getAnimateBgPath(this._talkJson.defaultBg);
            this._talkInfoList = this._talkJson.talkInfoList;
            console.log(`配表动画总共需要执行${this._talkInfoList.length}步`);
            this._mainUI.bg_black.visible = this._mainUI.bg_white.visible = false;
            this._actionStepIndex = 0;
            this._mainUI.imgAuto.visible = false;
            if (this.param?.forceSkipOpt) {
                this._mainUI.btnSkip.visible = this.param?.forceSkipOpt == 1 ? true : false;
            }
            else {
                this._mainUI.btnSkip.visible = this._talkJson.canSkip;
            }
            if (this._talkJson.hasOwnProperty("backBtnShow")) {
                this._mainUI.btnClose.visible = this._talkJson.backBtnShow;
            }
            else {
                this._mainUI.btnClose.visible = this._mainUI.btnSkip.visible;
            }
            this.talkAction();
        }
        private talkAction(): void {
            if (this._actionStepIndex == this._talkInfoList.length) {
                this.movieOver(false);
                return;
            }
            var talkInfo: any = this._talkInfoList[this._actionStepIndex];

            this._actionStepIndex++;
            console.log(`配表动画执行第${this._actionStepIndex}步:${talkInfo.type}`);
            switch (talkInfo.type) {
                case "npcIn":
                    this.moveInAction(talkInfo);
                    break;
                case "npcOut":
                    this.moveOutAction(talkInfo);
                    break;
                case "talk":
                    this.talkPlayAction(talkInfo);
                    break;
                case "float":
                    this.floatTalk(talkInfo);
                    break;
                case "hideFloat":
                    this.hideFloat(talkInfo);
                    break;
                case "changeBg":
                    this.changeBg(talkInfo);
                    break;
                case "fullscreen":
                    this.fullscreen(talkInfo);
                    break;
                case "shake":
                    this.shake(talkInfo);
                    break;
                case "changeBgm":
                    this.changeBgm(talkInfo);
                    break;
                case "playSound":
                    this.playSound(talkInfo);
                    break;
                case "visible":
                    this.setVisible(talkInfo);
                    break;
                case "changeEmoj":
                    this.talkAction()
                    break;
                case "ease":
                    this.talkAction();
                    break;
                case "choice":
                    this.showChoice(talkInfo);
                    break;
            }
        }

        private moveInAction(info: any): void {
            if (info.npcID.indexOf("i") > -1)
                info.npcID = info.npcID.replace(/i/g, clientCore.RoleManager.instance.getSelfInfo().id.toString());
            if (info.pos == "left") {
                this._mcLeftNpcCon.visible = true;
                this._mcLeftNpcCon.x = 0;
                this._talkControl.showNpcName(info.npcID, 'left');
                this.addLeftNpc(info.npcID);
                let t: egret.Tween;
                if (info.ani == "move") {
                    this._mcLeftNpcCon.x -= this._mcLeftNpc.source.width;
                    t = egret.Tween.get(this._mcLeftNpcCon).to({ x: 0 }, 600).call(this.talkAction, this);
                }
                if (info.ani == "ease") {
                    this._mcLeftNpcCon.alpha = 0;
                    t = egret.Tween.get(this._mcLeftNpcCon).to({ alpla: 1 }, 600).call(this.talkAction, this);
                }
                if (t) {
                    this._tweenArr.push(t);
                }
                if (info.ani == "visible") {
                    this.talkAction();
                }
            }
            else if (info.pos == "right") {
                this._mcRightNpcCon.visible = true;
                this._mcRightNpcCon.x = Laya.stage.width;
                this._talkControl.showNpcName(info.npcID, 'right');
                this.addRightNpc(info.npcID);
                let t: egret.Tween
                if (info.ani == "move") {
                    this._mcRightNpcCon.x = Laya.stage.width + this._mcRightNpc.source.width;
                    t = egret.Tween.get(this._mcRightNpcCon).to({ x: Laya.stage.width }, 600).call(this.talkAction, this);
                }
                if (info.ani == "ease") {
                    this._mcRightNpcCon.alpha = 0;
                    t = egret.Tween.get(this._mcRightNpcCon).to({ alpla: 1 }, 600).call(this.talkAction, this);
                }
                if (t)
                    this._tweenArr.push(t);
                if (info.ani == "visible") {
                    this.talkAction();
                }
            }
            else if (info.pos == "center") {

            }
        }
        private moveOutAction(info: any): void {
            this._talkControl.clearTalk();
            let dis = info.pos == "left" ? this._mcLeftNpcCon : this._mcRightNpcCon;
            let tarX = info.pos == "left" ? -this._mcLeftNpc.source.width : Laya.stage.width + this._mcRightNpc.source.width;
            let t: egret.Tween
            if (info.ani == "move") {
                t = egret.Tween.get(dis).to({ x: tarX }, 600).call(() => {
                    dis.visible = false;
                    this.talkAction();
                });
            }
            if (info.ani == "ease") {
                t = egret.Tween.get(dis).to({ alpla: 0 }, 600).call(() => {
                    dis.visible = false;
                    dis.alpha = 1;
                    this.talkAction();
                });
            }
            if (t)
                this._tweenArr.push(t)
            if (info.ani == "visible") {
                dis.visible = false;
                this.talkAction();
            }
        }
        private talkPlayAction(info: any): void {
            info.talkContent = info.talkContent.replace(/&name&/g, clientCore.LocalInfo.userInfo.nick);
            this._talkControl.showTalk(info, this.talkCompleteCallBack, this);
            let nameUI: Laya.Label;
            this._mcRightNpcCon.filters = info.pos == 'left' ? util.DisplayUtil.darkFilter : [];
            this._mcLeftNpcCon.filters = info.pos == 'right' ? util.DisplayUtil.darkFilter : [];
            if (info.pos == "left") {
                nameUI = this._mainUI.mcTalkDialog.txtLeftName;
            }
            else {
                nameUI = this._mainUI.mcTalkDialog.txtRightName;
            }
            let obj: any = {};
            obj.name = nameUI.visible ? nameUI.text : '';
            obj.content = info.talkContent.split('//').join('\n');
            this._reviewArr.push(obj);
        }
        private floatTalk(info: any) {
            info.talkContent = info.talkContent.replace(/&name&/g, clientCore.LocalInfo.userInfo.nick);
            this._talkControl.showFloat(info, this.talkCompleteCallBack, this);
            let obj: any = {};
            obj.name = '';
            obj.content = info.talkContent.split('//').join('\n');
            this._reviewArr.push(obj);
        }
        private async talkCompleteCallBack() {
            console.log("npc 对话说完！");
            // if (this._talkSoundChannel) {
            //     if (this._talkSoundChannel.isStopped)
            //         this.talkAction();
            // }
            // else {
            this.talkAction();
            // }
        }
        private hideFloat(info: any) {
            this._talkControl.hideFloat(info);
            this.talkAction();
        }
        private changeBg(info: any): void {
            this._mainUI.mcBgImg1.skin = pathConfig.getAnimateBgPath(info.bgID);
            let t = egret.Tween.get(this._mainUI.mcBgImg2).to({ alpha: 0 }, 700).call(() => {
                this._mainUI.mcBgImg2.skin = pathConfig.getAnimateBgPath(info.bgID);
                this._mainUI.mcBgImg2.alpha = 1;
                this.talkAction();
            });
            this._tweenArr.push(t);
        }
        private fullscreen(info: any): void {
            let rect: Laya.Image = this._mainUI["bg_" + info.color];
            rect.visible = true;
            rect.alpha = 0;

            let t = egret.Tween.get(rect)
                .to({ alpha: 1 }, info.transTime)
                .wait(info.coverTime)
                .to({ alpha: 0.2 }, info.transTime)
                .wait(200)
                .call(() => {
                    rect.visible = false;
                    this.talkAction();
                });
            this._tweenArr.push(t);
        }
        private shake(info: any): void {
            let p1: Laya.Point = new Laya.Point(this._mainUI.x - info.range, this._mainUI.y - info.range);
            let p2: Laya.Point = new Laya.Point(this._mainUI.x + info.range, this._mainUI.y + info.range);
            let t = egret.Tween.get(this._mainUI).to({ x: p1.x, y: p1.y }, 100)
                .to({ x: p2.x, y: p2.y }, 100)
                .to({ x: p1.x, y: p1.y }, 100)
                .to({ x: p2.x, y: p2.y }, 100)
                .to({ x: p1.x, y: p1.y }, 100)
                .to({ x: p1.x + info.range, y: p1.y + info.range }, 100)
                .call(this.talkAction, this);
            this._tweenArr.push(t);
        }
        private playSound(info: any): void {
            this.talkAction();
        }
        private changeBgm(info: any) {
            core.SoundManager.instance.playBgm(pathConfig.getAnimateMusicPath(info.id));
            this.talkAction();
        }
        private setVisible(info: any): void {
            let isShow: boolean = info.isShow;
            if (info.pos == "left") {
                this._mcLeftNpcCon.visible = isShow;
            }
            else if (info.pos == "right") {
                this._mcRightNpcCon.visible = isShow;
            }
            this.talkAction();
        }
        private addLeftNpc(npcID: string): void {
            let id = parseInt(npcID.split('_')[0]);
            let emoj = parseInt(npcID.split('_')[1]);
            emoj = emoj ? 1 : 0;
            this._mcLeftNpc.skin = pathConfig.getNpcPath(npcID)[emoj];
            let npcInfo = xls.get(xls.npcBase).get(id);
            this._mcLeftNpc.x = npcInfo.npcPosition.v1;
            this._mcLeftNpc.y = npcInfo.npcPosition.v2;
            this._mcLeftNpc.y -= (this._mcLeftNpc.source.height > 750 ? 750 : this._mcLeftNpc.source.height);
            this._mcLeftNpc.x -= (this._mcLeftNpc.source.width - clientCore.LayerManager.OFFSET);
            this._mainUI.mcNpcContainer.visible = true;
        }
        private addRightNpc(npcID: string): void {
            let id = parseInt(npcID.split('_')[0]);
            let emoj = parseInt(npcID.split('_')[1]);
            emoj = emoj ? 1 : 0;
            this._mcRightNpc.skin = pathConfig.getNpcPath(npcID)[emoj];
            let npcInfo = xls.get(xls.npcBase).get(id);
            this._mcRightNpc.x = npcInfo.npcPosition.v1;
            this._mcRightNpc.y = npcInfo.npcPosition.v2;
            this._mcRightNpc.y -= (this._mcRightNpc.source.height > 750 ? 750 : this._mcRightNpc.source.height);
            this._mcRightNpc.x -= (this._mcRightNpc.source.width + clientCore.LayerManager.OFFSET);
            this._mainUI.mcNpcContainer.visible = true;
        }
        private async movieOver(isForceEnd: boolean) {
            //配表动画播放结束
            console.log("配表动画播放完成！");
            this._talkControl.destroy();
            for (let t of this._tweenArr) {
                t.pause();
            }
            //新手过渡动画
            this.destroy();

        }
        private onAutoClick() {
            this._talkControl.autoPlay = !this._talkControl.autoPlay;
            this._mainUI.imgAuto.visible = this._talkControl.autoPlay;
        }
        private onShowLog() {
            this._talkControl.pause();
            if (!this._reviewPanel) {
                this._reviewPanel = new AnimateStoryPanel();
                this.initReviewMask();
            }
            LayerManager.upMainLayer.addChild(this._reviewMask);
            LayerManager.upMainLayer.addChild(this._reviewPanel);
            this._reviewPanel.show(this._reviewArr);
            this._reviewPanel.once(Laya.Event.CLOSE, this, () => {
                this._talkControl.resume();
                this._reviewMask.removeSelf();
            })
        }
        private showChoice(info: any) {
            if (!this._choicePanel) {
                this._choicePanel = new AnimateChoicePanel();
                this.initReviewMask();
            }
            LayerManager.upMainLayer.addChild(this._reviewMask);
            LayerManager.upMainLayer.addChild(this._choicePanel);
            let selectArr = this.param ? this.param.selectArr : [];
            this._choicePanel.show(selectArr, info.options);
            this._choicePanel.once(Laya.Event.CLOSE, this, () => {
                this._reviewMask.removeSelf();
                this.talkAction();
            })
        }
        private initReviewMask() {
            this._reviewMask = new Laya.Sprite();
            this._reviewMask.mouseEnabled = true;
            this._reviewMask.alpha = 0.5;
            let width: number = this._reviewMask.width = Laya.stage.width;
            let height: number = this._reviewMask.height = Laya.stage.height;
            this._reviewMask.graphics.clear();
            this._reviewMask.graphics.drawRect(0, 0, width, height, "#000000");
        }
        private onClose() {
            this._talkControl.pause();
            alert.showSmall('是否确认跳过本段剧情？', { callBack: { caller: this, funArr: [this.destroy, this.cancleClose] } })
        }
        private cancleClose() {
            this._talkControl.resume();
        }
        addEventListeners() {
            BC.addEvent(this, this._mainUI.btnAuto, Laya.Event.CLICK, this, this.onAutoClick);
            BC.addEvent(this, this._mainUI.btnShowLog, Laya.Event.CLICK, this, this.onShowLog);
            BC.addEvent(this, this._mainUI.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this._mainUI.btnSkip, Laya.Event.CLICK, this, this.onSkip);

            BC.addEvent(this, EventManager, "force_close_animate_movie", this, this.forceClose);
            BC.addEvent(this, this._talkControl, "stop_auto_run", this, this.stopAutoRun);

        }
        private stopAutoRun() {
            if (this._talkControl.autoPlay) {
                this._talkControl.autoPlay = !this._talkControl.autoPlay;
                this._mainUI.imgAuto.visible = this._talkControl.autoPlay;
            }
        }
        private onSkip() {
            this.destroy();
        }
        forceClose() {
            this.destroy();
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            this.param = null;
            let choice = this._choicePanel ? this._choicePanel.selectArr : [];
            EventManager.event(globalEvent.ANIMATE_MOVIE_PLAY_OVER, [choice]);
            console.log('本次剧情中选择了', choice);
            this._mainUI.removeSelf();
            this._mask.removeSelf();
            this.removeEventListeners();
            this._mainUI = null;
            this._mcLeftNpc = null;
            this._mcRightNpc = null;
            this._mcCenterNpc = null;
            this._mcLeftNpcCon = null;
            this._mcRightNpcCon = null;
            this._mcCenterNpcCon = null;
            this._talkJson = null;
            this._talkInfoList = null;
            this._actionStepIndex = null;
            this._talkControl.destroy();
            this._talkControl = null;
            this._tweenArr.forEach((t) => {
                if (t && t['_target'])
                    egret.Tween.removeTweens(t['_target']);
            })
            this._tweenArr = null;
            this._reviewArr = null;
            if (this._reviewPanel) {
                this._reviewPanel.destroy();
            }
            if (this._choicePanel) {
                this._choicePanel.destroy();
            }
            this._reviewPanel = null;
            this._choicePanel = null;
        }
    }
}