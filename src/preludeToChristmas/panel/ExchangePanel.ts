namespace preludeToChristmas {
    export class ExchangePanel extends ui.preludeToChristmas.panel.ExchangePanelUI {
        private _sign: number;
        private index: number;

        private _model: PreludeToChristmasModel;
        private _control: PreludeToChristmasControl;

        private rewardInfo: xls.eventExchange;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as PreludeToChristmasModel;
            this._control = clientCore.CManager.getControl(this._sign) as PreludeToChristmasControl;

            this.index = data;
            this.rewardInfo = this._model.getRewardArr()[data];

            let hasNum = clientCore.ItemsInfo.getItemNum(this.rewardInfo.cost[0].v1);
            let reward = clientCore.LocalInfo.sex == 1 ? this.rewardInfo.femaleProperty[0] : this.rewardInfo.maleProperty[0];
            this.imgEquip.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            this.labName.text = clientCore.ItemsInfo.getItemName(reward.v1);
            this.labNum.text = hasNum + "/" + this.rewardInfo.cost[0].v2;

            this.btnExchange.disabled = hasNum < this.rewardInfo.cost[0].v2 || clientCore.ItemsInfo.getItemNum(reward.v1) > 0;
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onExchange(): void {
            this._control.commonExchange(this.rewardInfo.id, Laya.Handler.create(this, (msg: pb.sc_common_exchange) => {
                this.event("ON_UPDATE");
                alert.showReward(msg.item);
                this.close();
            }));
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            this.rewardInfo = null;
            super.destroy();
        }
    }
}