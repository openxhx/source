namespace schoolTime {
    export class BuyPanel extends ui.schoolTime.panel.BuyPanelUI {
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
            this.initView();
        }

        private initView() {
            clientCore.GlobalConfig.setRewardUI(this.itemTarget, { id: 9900187, cnt: 50, showName: false });
            this.labCost.text = "" + 200;
        }

        toBuy() {
            let has: number = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            if (has < 200) {
                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                    alert.AlertLeafEnough.showAlert(200 - has);
                }));
                return;
            }
            alert.showSmall('单科学分上限100,确认消耗200神叶购买随机一科50学分吗?', {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_buy_finish_school_times_token()).then((msg: pb.sc_buy_finish_school_times_token) => {
                            alert.showReward(msg.item);
                            let model = clientCore.CManager.getModel(this._sign) as SchoolTimeModel;
                            model.allCoin += msg.item[0].cnt;
                            EventManager.event('SCHOOL_TIME_SET_COIN', msg.item[0].id - 9900186);
                        });
                    }]
                }
            });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.toBuy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}