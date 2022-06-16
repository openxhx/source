namespace paddingImage {
    export class ExchangePanel extends ui.paddingImage.panel.ExchangePanelUI {
        constructor() {
            super();
            this.sideClose = true;
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
        }

        initOver() {
            this.list.array = _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.type == 236 });
        }

        private listRender(item: ui.paddingImage.item.ExchangeItemUI) {
            let reward: xls.eventExchange = item.dataSource;
            item.imgReward.skin = clientCore.ItemsInfo.getItemIconUrl(reward.femaleProperty[0].v1);
            item.labNumber.text = reward.femaleProperty[0].v2.toString();
            item.labName.text = clientCore.ItemsInfo.getItemName(reward.femaleProperty[0].v1);
            BC.addEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.exchangeItem, [reward.id]);
        }

        private exchangeItem(id: number) {
            let config = xls.get(xls.eventExchange).get(id);
            if (clientCore.ItemsInfo.getItemNum(config.cost[0].v1) < config.cost[0].v2) {
                alert.showFWords("代币不足~");
                return;
            }
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 236 })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                this.mouseEnabled = true;
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }

        private closeSelf() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.closeSelf);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }

}