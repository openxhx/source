namespace girlMemories {
    /**
     * 线人来报面板
     */
    export class InformationComePanel extends ui.girlMemories.panel.InformationComePanelUI {
        private _model: GirlMemoriesModel;
        private _control: GirlMemoriesControl;

        public constructor(sign: number) {
            super();
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as GirlMemoriesModel;
            this._control = clientCore.CManager.getControl(this.sign) as GirlMemoriesControl;
        }

        initOver(): void {
            if (clientCore.FlowerPetInfo.petType >= 1) {
                if (clientCore.SearchClubsMapManager.ins.searchData.flag == 1) {
                    this.btnGet.visible = false;
                } else {
                    this.btnGet.visible = true;
                }
                this.btnUpgrade.visible = false;
            } else {
                this.btnGet.visible = false;
                this.btnUpgrade.visible = true;
            }
            if (this._model.InformationComePanel_RULE_ID == null) {
                this.btnHelp.visible = false;
            }
            //初始化奖励
            clientCore.GlobalConfig.setRewardUI(this.itemReward, { id: this._model.MONEY_ID, cnt: 25, showName: false });
            this.itemReward.num.visible = true;
            this.itemReward.visible = true;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnUpgrade, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [null]);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.itemReward, Laya.Event.CLICK, this, this.onShowReward);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onShowReward(): void {
            clientCore.ToolTip.showTips(this.itemReward, { id: this._model.MONEY_ID });
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnGet:
                    this._control.getInformationReward().then((msg) => {
                        alert.showReward(msg.item);
                        clientCore.SearchClubsMapManager.ins.searchData.flag = 1;//刷新数据
                        this.onClose(true);//领取了奖励
                    });
                    break;
                case this.btnUpgrade:
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击升级奇妙花宝按钮');
                    clientCore.ToolTip.gotoMod(52);
                    this.onClose(false);
                    break;
            }
        }


        private onClose(isSucc: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(GirlMemoriesEventType.CLOSE_InformationComePanel, isSucc);
        }


        private onShowRule(): void {
            alert.showRuleByID(this._model.InformationComePanel_RULE_ID);
        }

        destroy(): void {
            this._model = this._control = null;
            super.destroy();
        }
    }
}