namespace summerMemory {
    export class ExchangePanel extends ui.summerMemory.panel.ExchangePanelUI {
        private _sign: number;
        private _myCooky: number;
        private cost: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        public setInfo(sign: number) {
            this._sign = sign;
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            let config = xls.get(xls.eventExchange).get(2632);
            this._myCooky = clientCore.MaterialBagManager.getItemNum(model.MATEIAL_ID);
            this.labMyCooky.text = this._myCooky.toString();
            this.cost = config.cost[0].v2;
            this.labCost.text = "/" + config.cost[0].v2;
            this.labGetCount.text = "x" + config.femaleProperty[0].v2;
        }

        private showTips(idx: number) {
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            let item = idx == 1 ? this.boxMao : this.boxYu;
            let id = idx == 1 ? model.MATEIAL_ID : model.TARGET_ITEM_ID;
            clientCore.ToolTip.showTips(item, { id: id });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnchallenge, Laya.Event.CLICK, this, this.checkCooky);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.boxMao, Laya.Event.CLICK, this, this.showTips, [1]);
            BC.addEvent(this, this.boxYu, Laya.Event.CLICK, this, this.showTips, [2]);
        }

        private checkCooky() {
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            if (this._myCooky < this.cost) {
                clientCore.MaterialsTip.showTips([{ id: model.MATEIAL_ID, cnt: this.cost - this._myCooky }], new Laya.Handler(this, this.eat, null, true));
                return;
            } else {
                this.eat();
            }
        }

        private eat() {
            // clientCore.Logger.sendLog('2021年5月21日活动', '【主活动】初夏的记忆', '绒毛兑换夏之鱼');
            net.sendAndWait(new pb.cs_summer_memory_exchange_item({ exchangeId: 2632 })).then((msg: pb.sc_summer_memory_exchange_item) => {
                alert.showReward(msg.items);
                let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
                model._exchangeTimes++;
                EventManager.event("MOKA_COIN_CHANGE");
                this.close();
            });
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        destroy() {
            super.destroy();
        }
    }
}