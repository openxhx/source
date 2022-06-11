/// <reference path="MainUIBase.ts" />


namespace clientCore {
    export class WeddinMainUI extends MainUIBase {
        private _mainUI: ui.main.wedding.WeddingMainUIUI;
        private _targetTime: number;
        constructor() {
            super();
        }
        public setUp() {
            if (this._mainUI) {
                return;
            }
            this._mainUI = new ui.main.wedding.WeddingMainUIUI();
            this._mainUI.mouseThrough = true;
            this._mainUI.mcLeftView.mouseThrough = true;
            this._mainUI.mcRightView.mouseThrough = true;
            this._mainUI.drawCallOptimize = true;
            this._mainUI.btnCountDown.visible = this._mainUI.txtTime.visible = false;
            this.onCpRedUpdate();
            this.showUserInfo();
        }
        public showUserInfo() {
            let expInfo = LocalInfo.getLvInfo();
            this._mainUI.txtLevel.changeText("" + expInfo.lv);
            this._mainUI.txtName.changeText(LocalInfo.userInfo.nick);
            this._mainUI.mcExpMask.x = (expInfo.expPercent - 1) * this._mainUI.mcExpMask.width;
            this._mainUI.imgHead.skin = LocalInfo.headImgUrl;
            this._mainUI.txtExp.text = "" + expInfo.currExp + "/" + (expInfo.nextLvNeed + expInfo.currExp);
            this.onHeadChange();
        }
        private onHeadChange() {
            this._mainUI.imgHead.skin = LocalInfo.headImgUrl;
            this._mainUI.imgFrame.skin = LocalInfo.frameImgUrl;
        }
        private onCpRedUpdate() {
            if (this._mainUI.btnCp.parent) {
                let cpMgr = clientCore.CpManager.instance;
                this._mainUI.imgCpRed.visible = cpMgr.applyList.length > 0 || cpMgr.getDivorceAlert() != undefined;
            }
        }
        private addEvent() {
            BC.addEvent(this, this._mainUI.btnFunny, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.imgHead, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnPet, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnFriend, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnCloth, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnCp, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnBag, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, EventManager, globalEvent.CP_RED_BAG_TIME_CHANGE, this, this.startCountDown);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.onResize);
            //CP系统红点
            BC.addEvent(this, EventManager, globalEvent.CP_APPLY_LIST_UPDATE, this, this.onCpRedUpdate);
            BC.addEvent(this, EventManager, globalEvent.CP_INFO_UPDATE, this, this.onCpRedUpdate);
            BC.addEvent(this, EventManager, globalEvent.CP_DIVORCE_ALERT, this, this.onCpRedUpdate);
        }
        private onResize(): void{
            this._mainUI.mcRightView.x = Laya.stage.width;
        }
        private startCountDown(time: number) {
            this._targetTime = time;
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
        }
        private onTimer() {
            if ((clientCore.ServerManager.curServerTime - this._targetTime) < 60) {
                this._mainUI.btnCountDown.visible = this._mainUI.txtTime.visible = true;
                this._mainUI.txtTime.text = util.StringUtils.getDateStr2(60 - clientCore.ServerManager.curServerTime + this._targetTime, '{min}:{sec}');
            }
            else {
                Laya.timer.clear(this, this.onTimer);
                this._mainUI.btnCountDown.visible = this._mainUI.txtTime.visible = false;
            }
        }
        private onBtnClick(e: Laya.Event) {
            switch (e.currentTarget) {
                case this._mainUI.btnFunny:
                    clientCore.ModuleManager.open('weddingItem.WeddingItemModule')
                    break;
                case this._mainUI.btnCp:
                    clientCore.ToolTip.gotoMod(110);
                    break;
                case this._mainUI.btnFriend:
                    ModuleManager.open("friends.FriendMainModule");
                    break;
                case this._mainUI.btnCloth:
                    clientCore.ModuleManager.open('clothChange.ClothChangeModule');
                    break;
                case this._mainUI.btnBag:
                    let weddingIds = _.map(MapInfo.mapData.split('_'), s => parseInt(s));
                    if (weddingIds.indexOf(LocalInfo.uid) == -1)
                        alert.showFWords('只有结缘玩家可以操作~');
                    else
                        clientCore.ModuleManager.open('weddingLive.WedingBagModule');
                    break;
                case this._mainUI.imgHead:
                    clientCore.ModuleManager.open('selfInfo.SelfInfoModule');
                    break
                case this._mainUI.btnPet:
                    ModuleManager.open("flowerPet.FlowerPetModule");
                    break;
            }
        }
        public open() {
            this._mainUI.mcLeftView.x = 0;
            this._mainUI.alpha = 1;
            this._mainUI.mouseEnabled = true;
            this.onResize();
            this.addEvent();
            LayerManager.uiLayer.addChild(this._mainUI);
            UIManager.showTalk();
            this.showUserInfo();
        }
        public close() {
            this._mainUI.removeSelf();
            Laya.timer.clear(this, this.onTimer);
            BC.removeEvent(this);
        }
        public hide() {
            Laya.Tween.to(this._mainUI, { alpha: 0 }, 200);
            this._mainUI.mouseEnabled = false;
        }
        public show() {
            Laya.Tween.clearAll(this._mainUI);
            Laya.Tween.to(this._mainUI, { alpha: 1 }, 200);
            this._mainUI.mouseEnabled = true;
        }

        public isHide() {
            return !this._mainUI.mouseEnabled;
        }
    }
}