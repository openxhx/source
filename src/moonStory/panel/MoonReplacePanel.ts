namespace moonStory {
    export class MoonReplacePanel extends ui.moonStory.panel.MoonReplacePanelUI {
        constructor() {
            super();
            this.listOld.renderHandler = this.listNew.renderHandler = new Laya.Handler(this, this.itemRender);
        }

        public show() {
            let oldItem = [];
            let newItem = [];
            if (clientCore.ItemsInfo.getItemNum(1511008) > 0) {
                oldItem.push({ id: 1511008, cnt: clientCore.ItemsInfo.getItemNum(1511008) });
                let off = xls.get(xls.eventExchange).get(2281).cost[0].v2;
                newItem.push({ id: 1511010, cnt: Math.ceil(clientCore.ItemsInfo.getItemNum(1511008) / off) });
            }
            if (clientCore.ItemsInfo.getItemNum(1511009) > 0) {
                oldItem.push({ id: 1511009, cnt: clientCore.ItemsInfo.getItemNum(1511009) });
                let off = xls.get(xls.eventExchange).get(2282).cost[0].v2;
                newItem.push({ id: 1511011, cnt: Math.ceil(clientCore.ItemsInfo.getItemNum(1511009) / off) });
            }
            this.listOld.repeatX = oldItem.length;
            this.listOld.array = oldItem;
            this.listNew.repeatX = newItem.length;
            this.listNew.array = newItem;
            clientCore.DialogMgr.ins.open(this);
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI) {
            let data = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: data.id, cnt: data.cnt, showName: false });
        }

        private replace() {
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: 2281, activityId: 78 })).then(async (data: pb.sc_common_exchange) => {
                alert.showReward(data.item);
                clientCore.DialogMgr.ins.close(this);
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOk, Laya.Event.CLICK, this, this.replace);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}