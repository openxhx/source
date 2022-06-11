namespace halloweenCandy {
    /**
     * 万圣节讨糖主活动
     * halloweenCandy.HalloweenCandyExchangePanel
     * 2021.10.29
     */
    export class HalloweenCandyExchangePanel extends ui.halloweenCandy.panel.HalloweenCandyExchangePanelUI {
        private activityID: number = 201;
        private times: number = util.TimeUtil.formatTimeStrToSec("2021-11-05 00:00:00");
        private curSuit: number;
        constructor() {
            super();
            this.showSuit();
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.ListRender);
        }

        show() {
            this.switch(0);
            clientCore.DialogMgr.ins.open(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSuit0, Laya.Event.CLICK, this, this.switch, [0]);
            BC.addEvent(this, this.btnSuit1, Laya.Event.CLICK, this, this.switch, [1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        /**切换 */
        private switch(num: number): void {
            if (2110520 + num == this.curSuit) {
                this.list.refresh();
                return;
            }
            this.curSuit = 2110520 + num;
            this.showProgress();
            var starID: number = 2945;
            var endID: number = 2952;
            if (num == 1) {
                starID = 2953;
                endID = 2967;
            }
            let arr = [];
            while (starID <= endID) {
                let config = xls.get(xls.eventExchange).get(starID);
                if (config.type == this.activityID) {
                    arr.push(config);
                }
                starID++;
            }
            this.list.scrollTo(0);
            this.list.array = arr;
        }

        private showProgress() {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.curSuit);
            this.labPro.text = "已集齐：" + suitInfo.hasCnt + "/" + suitInfo.clothes.length;
        }

        /**显示套装 */
        private showSuit(): void {
            this.suit1.visible = clientCore.LocalInfo.sex == 1;
            this.suit2.visible = clientCore.LocalInfo.sex == 2;
            this.btnSuit1.visible = this.hide0.visible = this.hide1.visible = this.box1.visible = clientCore.ServerManager.curServerTime >= this.times;
        }
        /**关闭 */
        private onClose(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        /**套装预览 */
        private onTry(idx: number): void {
            alert.showCloth(2110520 + idx);
        }

        /**render设置 */
        private ListRender(item: ui.halloweenCandy.render.ExchangeRenderUI) {
            const data: xls.eventExchange = item.dataSource;
            const reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
            const cost = data.cost;
            item.imgTarget.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.imgCost1.skin = clientCore.ItemsInfo.getItemIconUrl(cost[0].v1);
            item.imgCost2.skin = clientCore.ItemsInfo.getItemIconUrl(cost[1].v1);
            let have1 = clientCore.ItemsInfo.getItemNum(cost[0].v1);
            let have2 = clientCore.ItemsInfo.getItemNum(cost[1].v1);
            item.labCost1.text = have1 + "/" + cost[0].v2;
            item.labCost2.text = have2 + "/" + cost[1].v2;
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
                item.imgEqual.skin = "halloweenCandy/equal1.png";
                item.diTarget.skin = "halloweenCandy/di_item1.png";
            } else {
                item.btnExchange.visible = false;
                item.imgEqual.skin = "halloweenCandy/equal.png";
                item.diTarget.skin = "halloweenCandy/di_item.png";
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
            net.sendAndWait(new pb.cs_halloween_candy_megagame_exchange({ id: id })).then((msg: pb.sc_halloween_candy_megagame_exchange) => {
                alert.showReward(msg.item);
                this.showProgress();
                this.list.refresh();
                util.RedPoint.reqRedPointRefresh(29306);
                this.mouseEnabled = true;
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }
    }
}