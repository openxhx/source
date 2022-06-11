namespace springMedal {
    export class ActiveBuyPanel extends ui.springMedal.panel.ActiveBuyPanelUI {
        private _sign: number;
        constructor(sign: number) {
            super();
            this.sideClose = true;
            this._sign = sign;
        }
        private _waiting: boolean;
        private buy() {
            if (this._waiting) return;
            if(clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) < 50){
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall(`确定花费50灵豆购买150活跃度吗?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this._waiting = true;
                        net.sendAndWait(new pb.cs_buy_lucky_medal_active()).then((msg: pb.sc_buy_lucky_medal_active) => {
                            let model = clientCore.CManager.getModel(this._sign) as SpringMedalModel;
                            model.activeValue = msg.activeValue;
                            EventManager.event("SPRING_MEDAL_ACTIVE");
                            alert.showFWords("获得150活跃度");
                            this.onClose();
                            this._waiting = false;
                        }).catch(() => {
                            this._waiting = false;
                        });
                    }]
                }
            })
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buy);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            BC.removeEvent(this);
            super.destroy();
        }
    }
}