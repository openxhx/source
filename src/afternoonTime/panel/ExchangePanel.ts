namespace afternoonTime {
    /**
     * 11.5
     * 主活动感恩午后时光
     * afternoonTime.ExchangePanel
     */
    export class ExchangePanel extends ui.afternoonTime.panel.ExchangePanelUI {
        private curSuit: number;
        private startId: number;
        private endId: number;
        init(d: { suitId: number, startId: number, endId: number }) {
            this.sideClose = true;
            this.startId = d.startId;
            this.endId = d.endId;
            this.curSuit = d.suitId;
            this.imgSuit.skin = `unpack/afternoonTime/${d.suitId}_${clientCore.LocalInfo.sex}.png`;
            this.labSuit.text = clientCore.SuitsInfo.getSuitInfo(d.suitId).suitInfo.name + "套装";
            this.list.vScrollBarSkin = ""
            this.list.renderHandler = new Laya.Handler(this, this.ListRender);
            this.addPreLoad(xls.load(xls.eventExchange));
        }

        onPreloadOver() {
            if (this.curSuit == 2110531) {
                clientCore.UIManager.setMoneyIds([9900268, 9900269]);
                clientCore.UIManager.showCoinBox();
            } else {
                let coinId = xls.get(xls.eventExchange).get(this.startId).cost[0].v1;
                clientCore.UIManager.setMoneyIds([coinId, clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            }
            this.setSuit();
            this.showProgress();
        }

        addEventListeners() {
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
        }

        removeEventListeners() {
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }

        private freshCoinInfo() {
            this.list.refresh();
        }

        private showProgress() {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.curSuit);
            this.labNum.text = "已集齐：" + suitInfo.hasCnt + "/" + suitInfo.clothes.length;
        }

        /**套装预览 */
        private onTry(): void {
            alert.showCloth(this.curSuit);
        }

        private setSuit() {
            var starID: number = this.startId;
            var arr = [];
            while (starID <= this.endId) {
                let config = xls.get(xls.eventExchange).get(starID);
                arr.push(config);
                starID++;
            }
            this.list.array = arr;
        }

        /**render设置 */
        private ListRender(item: ui.afternoonTime.render.ExchangeRenderUI) {
            const data: xls.eventExchange = item.dataSource;
            const reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
            const cost = data.cost;
            item.imgTarget.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.imgCost1.skin = clientCore.ItemsInfo.getItemIconUrl(cost[0].v1);
            item.imgCost2.skin = clientCore.ItemsInfo.getItemIconUrl(cost[1].v1);
            let have1 = clientCore.ItemsInfo.getItemNum(cost[0].v1);
            let have2 = clientCore.ItemsInfo.getItemNum(cost[1].v1) > 2000 ? 2000 : clientCore.ItemsInfo.getItemNum(cost[1].v1);
            item.labCost1.text = " " + have1 + "/" + cost[0].v2;
            item.labCost2.text = " " + have2 + "/" + cost[1].v2;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            BC.removeEvent(this, item.imgCost1, Laya.Event.CLICK, this, this.ShowItemTip);
            BC.removeEvent(this, item.imgCost2, Laya.Event.CLICK, this, this.ShowItemTip);
            BC.removeEvent(this, item.imgTarget, Laya.Event.CLICK, this, this.ShowItemTip);
            BC.removeEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.Exchange);
            BC.addEvent(this, item.imgCost1, Laya.Event.CLICK, this, this.ShowItemTip, [item.imgCost1, cost[0].v1]);
            BC.addEvent(this, item.imgCost2, Laya.Event.CLICK, this, this.ShowItemTip, [item.imgCost2, cost[1].v1]);
            BC.addEvent(this, item.imgTarget, Laya.Event.CLICK, this, this.ShowItemTip, [item.imgTarget, reward[0].v1]);
            BC.addEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.Exchange, [data.id]);
            if (have1 >= cost[0].v2 && have2 >= cost[1].v2 && !item.imgGot.visible) {
                item.btnExchange.visible = true;
                item.imgEqual.skin = "afternoonTime/equal1.png";
                item.diTarget.skin = "afternoonTime/di_item1.png";
            } else {
                item.btnExchange.visible = false;
                item.imgEqual.skin = "afternoonTime/equal.png";
                item.diTarget.skin = "afternoonTime/di_item.png";
            }
        }

        /**显示物品信息 */
        private ShowItemTip(item: any, id: number, e: Laya.Event) {
            clientCore.ToolTip.showTips(item, { id: id });
            e.stopPropagation();
        }

        /**领取物品 */
        private Exchange(id: number) {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_thanks_afternoon_exchange({ id: id })).then((msg: pb.sc_thanks_afternoon_exchange) => {
                alert.showReward(msg.item);
                // this.list.refresh();
                this.showProgress();
                this.mouseEnabled = true;
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }

    }
}
