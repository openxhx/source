namespace newYearEgg {
    /**
     * 12.17
     * newYearEgg.ClothExchangePanel
     */
    export class ClothExchangePanel extends ui.newYearEgg.panel.ClothExchangePanelUI {
        private curSuit: number;
        private startId: number;
        private endId: number;
        private iconId: number;

        init(d: { suitId: number, startId: number, endId: number, iconId: number }) {
            this.sideClose = true;
            this.startId = d.startId;
            this.endId = d.endId;
            this.curSuit = d.suitId;
            this.iconId = d.iconId;
            this.imgSuit.skin = `unpack/newYearEgg/ExchangePanel/${this.curSuit}_${clientCore.LocalInfo.sex}.png`;
            this.imgSuit.scaleX = this.imgSuit.scaleY = 1.1;
            this.labSuit.text = clientCore.SuitsInfo.getSuitInfo(d.suitId).suitInfo.name + "套装";
            this.list.vScrollBarSkin = ""
            this.list.renderHandler = new Laya.Handler(this, this.ListRender);
        }

        initOver() {
            clientCore.UIManager.setMoneyIds([this.iconId, 9900001]);
            clientCore.UIManager.showCoinBox();
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
            var endID: number = this.endId;
            var arr = [];
            arr.push(xls.get(xls.eventExchange).get(3067));
            arr.push(xls.get(xls.eventExchange).get(3068));
            while (endID >= this.startId) {
                const config = xls.get(xls.eventExchange).get(endID);
                const reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
                if (clientCore.ItemsInfo.checkHaveItem(reward[0].v1)) arr.push(config);
                else arr.unshift(config);
                --endID;
            }

            this.list.array = arr;
        }

        /**render设置 */
        private ListRender(item: ui.newYearEgg.render.ExchangeRenderUI) {
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
            item.numTxt.text = " " + reward[0].v2;
            if(reward[0].v1 != 9900001 && reward[0].v1 != 9900007 && reward[0].v1 != 1550001){
                item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            }else{
                item.imgGot.visible = false;
            }
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
                item.imgEqual.skin = "newYearEgg/ExchangePanel/equal1.png";
                item.diTarget.skin = "newYearEgg/ExchangePanel/di_item1.png";
            } else {
                item.btnExchange.visible = false;
                item.imgEqual.skin = "newYearEgg/ExchangePanel/equal.png";
                item.diTarget.skin = "newYearEgg/ExchangePanel/di_item.png";
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
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 214 })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                this.list.refresh();
                this.showProgress();
                EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
                this.mouseEnabled = true;
            }).catch(() => {
                EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
                this.mouseEnabled = true;
            })
        }

    }
}
