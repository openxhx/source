namespace actingTrainee {
    export class BuyPanel extends ui.actingTrainee.panel.BuyPanelUI {
        private _sign: number;

        private isPlaying: boolean = false;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any) {
            this.updateView();

            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;

            clientCore.UIManager.setMoneyIds([model.tokenId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private updateView(): void {
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;

            this.txtTimes.text = (model.buyTimesMax - model.buyTimes) + '';
            this.txtTimes2.text = '/' + model.buyTimesMax;

            if (!model.isCanBuy) {
                this.btnBuy.disabled = true;
            }
            this.aniMask.visible = false;
        }

        toBuy() {
            if (this.isPlaying) {
                return;
            }
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;
            let cls: xls.commonBuy = model.getBuyInfo()[model.buyTimes];
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0] : cls.maleAward[0];
            let has: number = clientCore.ItemsInfo.getItemNum(cls.itemCost.v1);
            if (has < cls.itemCost.v2) {
                if (cls.itemCost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(cls.itemCost.v2 - has);
                    }));
                } else if (cls.itemCost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                }
                return;
            }
            alert.showBuyTimesPanel({
                nowTime: model.buyTimes, maxTime: model.buyTimesMax, coinNum: cls.itemCost.v2, coinId: cls.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    let control = clientCore.CManager.getControl(this._sign) as ActingTraineeControl;
                    control.commonBuy(Laya.Handler.create(this, (msg: pb.sc_common_buy) => {
                        this.onShowBuy(msg.item);
                    }));
                }), noIcon: `确认消耗${cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(cls.itemCost.v1)}购买${reward.v2}${clientCore.ItemsInfo.getItemName(reward.v1)}吗？`
            });
        }

        toBuy2() {
            if (this.isPlaying) {
                return;
            }
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;
            let has: number = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (has < model.buy_price) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.alertQuickBuy(model.tokenId, 10, true, new Laya.Handler(this, (items) => {
                util.RedPoint.reqRedPointRefresh(model.redPointId);
                this.onShowBuy(items);
            }));
        }

        private onShowBuy(items): void {
            this.isPlaying = true;
            this.aniMask.visible = true;
            let aniBtnDati: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/actingTrainee/daiweiwei.sk", 0, false, this.boxAni as Laya.Sprite);
            aniBtnDati.pos(0, 200);
            aniBtnDati.once(Laya.Event.COMPLETE, this, () => {
                this.isPlaying = false;
                this.updateView();
                alert.showReward(items);
                this.event("ON_UPDATE_TOKEN");
            })
        }

        close() {
            this.event("ON_UPDATE_TOKEN");
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.toBuy);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.toBuy2);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}