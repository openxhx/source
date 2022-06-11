
namespace flowerSpring {
    export class FlowerExchangePanel extends ui.flowerSpring.panel.FlowerSpringExchangePanelUI {
        private _infoArr: xls.commonBuy[];
        private _buyHanlder: Laya.Handler;

        constructor() {
            super();
        }

        show(timeArr: number[], buyHanlder: Laya.Handler, open: boolean = false) {
            this._buyHanlder = buyHanlder;
            let xlsInfoArr = _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == 14 });
            let infoArr = _.chunk(xlsInfoArr, 4);
            this._infoArr = [];
            for (let i = 0; i < 2; i++) {
                let box = this['box_' + i];
                let buyInfoArr = infoArr[i]
                let nextBuyTimes = _.clamp(timeArr[i] + 1, 1, _.last(buyInfoArr).buyTimes);
                let buyInfo = _.find(buyInfoArr, (o) => { return o.buyTimes == nextBuyTimes });
                box.getChildByName('needIcon').skin = clientCore.ItemsInfo.getItemIconUrl(buyInfo.itemCost.v1);
                box.getChildByName('needNum').value = buyInfo.itemCost.v2;
                let rwd = clientCore.LocalInfo.sex == 1 ? buyInfo.femaleAward[0] : buyInfo.maleAward[0];
                box.getChildByName('icon').skin = clientCore.ItemsInfo.getItemIconUrl(rwd.v1);
                box.getChildByName('num').value = rwd.v2;
                this._infoArr[i] = buyInfo;
            }
            if (open)
                clientCore.DialogMgr.ins.open(this);
        }

        private onExchange(idx: number) {
            this._buyHanlder?.runWith([this._infoArr[idx].id, idx]);
        }

        addEventListeners() {
            for (let i = 0; i < 2; i++) {
                BC.addEvent(this, this['btnExchange_' + i], Laya.Event.CLICK, this, this.onExchange, [i]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        destroy() {
            super.destroy();
            this._buyHanlder = null;
        }
    }
}