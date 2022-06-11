namespace runningTurkey {
    export class RunningTurkeyExchangePanel extends ui.runningTurkey.panel.RunningTurkeyExchangePanelUI {
        constructor() {
            super();
            this.init();
            this.sideClose = true;
        }

        init() {
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.dataSource = _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.type == 182 });
        }

        popupOver() {
            this.list.refresh();
        }

        /**兑换列表渲染 */
        private listRender(item: ui.runningTurkey.render.TurkeyClothItemUI) {
            // let data: xls.eventExchange = item.dataSource;
            // let target = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            // let cost = data.cost[0];
            // item.imgCloth.skin = clientCore.ItemsInfo.getItemIconUrl(target.v1);
            // item.labTarget.text = "x" + target.v2;
            // item.labCost.text = cost.v2 + "";
            // item.labName.text = clientCore.ItemsInfo.getItemName(target.v1);
            // let has = clientCore.ItemsInfo.getItemNum(cost.v1);
            // item.btnExchange.disabled = cost.v2 > has;
            // BC.addEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.exchangeGoods, [data.id]);
            // BC.addEvent(this, item.imgCloth, Laya.Event.CLICK, this, this.showItemInfo, [item, target.v1]);
        }

        /**显示物品tip */
        private showItemInfo(item, id) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        /**兑换服装 */
        private exchangeGoods(goodId: number) {
            net.sendAndWait(new pb.cs_common_exchange({ activityId: 182, exchangeId: goodId })).then((data: pb.sc_common_exchange) => {
                // util.RedPoint.reqRedPointRefresh(10501);
                alert.showReward(clientCore.GoodsInfo.createArray(data.item), "", {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.list.refresh();
                        }]
                    }
                });
            })
        }

        private closeSelf() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeSelf);
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