
namespace orderSystem {
    export class OrderBuyTimePanel extends ui.orderSystem.panel.BuyTimePanelUI {
        private _currNum: number = 1;
        private _max: number;//当前可以购买的最大值
        /** 今天可以购买的最大值*/
        private _allCanBuyNum: number;
        /**今日已经购买的次数*/
        private _todayBuyNum: number;
        private _caller: any;
        private _call: Function;
        constructor() {
            super();
            this.addEventListeners();
            this.txtTime.style.fontSize = 26;
            this.txtTime.style.font = '汉仪中圆简';
            this.txtTime.style.align = 'center';
            this.txtTime.style.width = '487'
        }

        setData(maxBuyTime: number, restBuyTime: number, caller: any, call: Function) {
            this._currNum = 1;
            this._max = restBuyTime;
            this._allCanBuyNum = maxBuyTime;
            this._todayBuyNum = this._allCanBuyNum - this._max;
            this._caller = caller;
            this._call = call;
            this.updateView();
        }

        private onNumChange(change: number) {
            this._currNum += change;
            this._currNum = _.clamp(this._currNum, 1, this._max);
            this.updateView();
        }

        private updateView() {
            this.txtTime.innerHTML = util.StringUtils.getColorText2([
                '今日您还可以购买订单次数',
                '#805329',
                this._max.toString(),
                '#ff0000',
                '次',
                '#805329'
            ])
            this.txtNum.text = this._currNum.toString();
            let canAdd = this._currNum < this._max;
            this.btnAdd.gray = !canAdd;
            this.btnAdd.mouseEnabled = canAdd;
            let canSub = this._currNum > 1;
            this.btnSub.gray = !canSub;
            this.btnSub.mouseEnabled = canSub;
            this.calNeedNum();
        }
        /**
            订单购买计算公式：  购买订单消耗的神叶= min(购买订单消耗的最大神叶数量，初始神叶消耗的数量+购买增加值)
                                购买增加值 =  购买公差值 * 购买次数(表示当前是第几次，第一购买一个是1，第五次购买一个是5)
                               注：
                               购买订单消耗的最大神叶数量，
                               初始神叶消耗的数量,
                               购买公差值,
                               为global配表字段
        */
        private calNeedNum() {
            let maxCostNum = xls.get(xls.globaltest).get(1).maxBuyOrderCost;//购买订单消耗的最大神叶数量
            let oriCostNum = xls.get(xls.globaltest).get(1).initBuyOrderCost;//初始神叶消耗的数量
            let oneDiff = xls.get(xls.globaltest).get(1).BuyOrderDiff;//购买公差值
            let buyTotalNeedNum = 0;
            for (let i = this._todayBuyNum; i < this._currNum + this._todayBuyNum; i++) {
                buyTotalNeedNum += Math.min(maxCostNum, oriCostNum + i * oneDiff)
            }
            this.txtPrice.text = buyTotalNeedNum.toString();
        }

        private onSure() {
            let needLeaf = parseInt(this.txtPrice.text);
            // let haveLeaf = clientCore.ItemBagManager.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID)
            // if (needLeaf >= haveLeaf) {
            //     alert.showFWords('神叶不足');
            //     return;
            // }

            alert.useLeaf(needLeaf, Laya.Handler.create(this, () => {
                this._call.call(this._caller, this._currNum);
                this.onClose();
            }));
        }

        addEventListeners() {
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onNumChange, [1]);
            BC.addEvent(this, this.btnSub, Laya.Event.CLICK, this, this.onNumChange, [-1]);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}