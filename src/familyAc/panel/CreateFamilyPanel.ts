namespace familyAc.panel {
    /**
     * 创建家族面板
     */
    export class CreateFamilyPanel extends ui.familyAc.panel.CreateFamilyUI implements clientCore.IDialog {

        private _boardId: number;
        private _badgeId: number;

        constructor() {
            super();
            let xlsFamily: xls.family = xls.get(xls.family).get(1);
            this.txCost.changeText(xlsFamily.createCost.v2 + "");
            this.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(xlsFamily.createCost.v1);
            this.updateBadge(xlsFamily.badgeBase.v1, xlsFamily.badgeType.v1);
        }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.onBadgeChange);
            BC.addEvent(this, this.btnCreate, Laya.Event.CLICK, this, this.onCreate);
            BC.addEvent(this, EventManager, globalEvent.UPDATE_FAMILY_BADGE, this, this.updateBadge);
            BC.addEvent(this, this.inputName, Laya.Event.FOCUS, this, this.onFocus);
            BC.addEvent(this, this.inputName, Laya.Event.BLUR, this, this.onBlur);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onBadgeChange(): void {
            clientCore.ModuleManager.open("familyBadge.FamilyBadgePanel","create");
        }

        private updateBadge(boardId: number, badgeId: number): void {
            this._boardId = boardId;
            this._badgeId = badgeId;
            this.imgBoard.skin = pathConfig.getFamilyBadgeUrl(this._boardId);
            this.imgBadge.skin = pathConfig.getFamilyBadgeUrl(this._badgeId);
        }

        private onCreate(): void {
            if (this.inputName.text == "") {
                alert.showFWords("家族名称不能为空^_^");
                return;
            }
            if(!util.StringUtils.testName(this.inputName.text)){
                alert.showFWords("家族名称不合法");
                return;
            }
            if (this.inputMint.text == "") {
                alert.showFWords("家族宣言不能为空^_^");
                return;
            }
            if(!util.StringUtils.testName(this.inputName.text)){
                alert.showFWords("家族宣言不合法");
                return;
            }
            alert.useLeaf(parseInt(this.txCost.text), Laya.Handler.create(this, () => {
                FamilyAcSCommand.ins.createFamily(this.inputName.text, this.inputMint.text, this._badgeId, this._boardId, Laya.Handler.create(this, (msg: pb.sc_create_family) => {
                    this.hide();
                    clientCore.FamilyMgr.ins.familyId = msg.fmlInfo.fmlId;
                    clientCore.FamilyMgr.ins.svrMsg = msg.fmlInfo;
                    clientCore.ModuleManager.closeModuleByName("familyAc");

                    clientCore.LocalInfo.srvUserInfo.badgeType = msg.fmlInfo.badgeType;
                    clientCore.LocalInfo.srvUserInfo.badgeBase = msg.fmlInfo.badgeBase;
                    EventManager.event(globalEvent.FAMILY_BADGE_CHANGE);
                }));
            }))
        }

        private onFocus(): void {
            this.inputName.text == "" && (this.inputName.text = "");
        }

        private onBlur(): void {
            // this.inputName.text = util.StringUtils.filterEmoji(this.inputName.text);
        }
    }
}