
namespace rechargeActivity {
    export class CumulativeSpendPanel extends BasePanel {
        constructor() {
            super();
        }
        init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info) {
            super.init(data, info);
            this._mainUI = new ui.rechargeActivity.panel.CumulativeSpendPanelUI();
            this.addChild(this._mainUI);
            this.initPanel();
            this.addEventListenters();
            this._mainUI["txtActivityContent"].text = "活动内容：活动时间内，累计消费到指定数额，即可领取相应奖励";
        }
        refreshGetBitData() {
            this.bitData = this.rechargeInfo.accumulateCostStatus;
        }
        protected itemRender(item: RechargeRender, index: number) {
            item.setInfo(this.type, item.dataSource, this.rechargeInfo.accumulateCostCnt);
        }
        addEventListenters() {
            super.addEventListenters();
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}