namespace roleChain2 {
    export class SureAwakePanel extends ui.roleChain2.panel.SureAwakePanelUI {
        private _awakeID: number;
        show(awakeId: number) {
            this._awakeID = awakeId;
            this.sideClose = false;
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSureClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnGoGet, Laya.Event.CLICK, this, this.onGoGetClick);

            let fairyid = xls.get(xls.awakeBase).get(awakeId).needCurrency;
            this.img.skin = pathConfig.getFairyIconPath(fairyid);
            // let coinNum = xls.get(xls.awakeBase).get(awakeId).needGold;
            // this.txt.text = `是否消耗1个${xls.get(xls.itemBag).get(fairyid).name}及${coinNum}个神叶进行绽放？`;

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "sureAwakePanel") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitAwakePanelOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private _netReqing: boolean = false;
        private async onSureClick() {
            if (this._netReqing)
                return;
            this._netReqing = true;
            clientCore.RoleManager.instance.awake(this._awakeID).then(() => {
                let awakeAniPanel = new AwakeAnimatePanel();
                awakeAniPanel.setData(xls.get(xls.awakeBase).get(this._awakeID));
                clientCore.DialogMgr.ins.open(awakeAniPanel);
                this.onCloseClick();
                this._netReqing = false;
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSureAwakeBtn") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }).catch(() => {
                this._netReqing = false;
            });
        }

        private onCloseClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onGoGetClick() {

        }

        destroy() {
            super.destroy();
            BC.removeEvent(this);
        }
    }
}