namespace saveFaery {
    export class RewardPanel extends ui.saveFaery.panel.RewardPanelUI {
        public rewardFlag: number;
        private suit1: number;
        private suit2: number = 2110583;
        private itemExchangetTimes: number = 0;
        constructor() {
            super();
            this.listExchange.vScrollBarSkin = ""
            this.listExchange.renderHandler = new Laya.Handler(this, this.exchangeRender);
            this.listReward.vScrollBarSkin = ""
            this.listReward.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.imgSuit2.skin = `unpack/saveFaery/2110583_${clientCore.LocalInfo.sex}.png`;
        }

        show(curPoint: number) {
            this.labCur.text = "" + curPoint;
            this.listExchange.array = _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.type == 225 });
            let curTime = clientCore.ServerManager.curServerTime;
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-1-28 00:00:00")) {
                this.listReward.array = _.filter(xls.get(xls.collocationActivity).getValues(), (o) => { return o.id >= 7 && o.id <= 15 });
                this.suit1 = 2110582;
                this.imgSuit1.skin = `unpack/saveFaery/2110582_${clientCore.LocalInfo.sex}.png`;
                this.labTime.text = "1.21~1.27";
                this.labEnd.text = "1.27";
            } else if (curTime < util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")) {
                this.listReward.array = _.filter(xls.get(xls.collocationActivity).getValues(), (o) => { return o.id >= 16 && o.id <= 24 });
                this.suit1 = 2110587;
                this.imgSuit1.skin = `unpack/saveFaery/2110587_${clientCore.LocalInfo.sex}.png`;
                this.labTime.text = "1.28~2.3";
                this.labEnd.text = "2.3";
            } else {
                this.listReward.array = _.filter(xls.get(xls.collocationActivity).getValues(), (o) => { return o.id >= 25 && o.id <= 33 });
                this.suit1 = 2110588;
                this.imgSuit1.skin = `unpack/saveFaery/2110588_${clientCore.LocalInfo.sex}.png`;
                this.labTime.text = "2.4~2.10";
                this.labEnd.text = "2.10";
            }
            this.labName1.text = clientCore.SuitsInfo.getSuitInfo(this.suit1).suitInfo.name + "套装";
            this.openExchangeReward(false);
            this.openPointReward(false);
            this.getItemGotInfo();
            clientCore.DialogMgr.ins.open(this, false);
        }

        private getItemGotInfo() {
            net.sendAndWait(new pb.cs_common_exchange_limit_time({ exchangeId: [3113] })).then((msg: pb.sc_common_exchange_limit_time) => {
                this.itemExchangetTimes = msg.time[0];
                this.listExchange.refresh();
            })
        }

        /**打开积分奖励 */
        private openPointReward(flag: boolean) {
            this.box1_1.visible = this.imgSuit1.visible = !flag;
            this.btnBack1.visible = this.boxPoint.visible = this.listReward.visible = flag;
        }

        /**打开兑换奖励 */
        private openExchangeReward(flag: boolean) {
            this.box2_1.visible = this.imgSuit2.visible = !flag;
            this.btnBack2.visible = this.listExchange.visible = flag;
        }

        private rewardRender(item: ui.saveFaery.render.RewardItemUI) {
            const data: xls.collocationActivity = item.dataSource;
            const reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
            const cost = data.score;
            item.imgTarget.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.numTxt.text = "勇气积分达到" + cost;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            item.btnExchange.visible = !item.imgGot.visible;
            BC.removeEvent(this, item.imgTarget, Laya.Event.CLICK, this, this.ShowItemTip);
            BC.removeEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, item.imgTarget, Laya.Event.CLICK, this, this.ShowItemTip, [item.imgTarget, reward[0].v1]);
            BC.addEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.getReward, [data.id]);
            let have = clientCore.ItemsInfo.getItemNum(data.cost[0].v1);
            if (have >= data.cost[0].v2 && parseInt(this.labCur.text) >= cost && !item.imgGot.visible) {
                item.imgEqual.skin = "saveFaery/equal1.png";
                item.diTarget.skin = "saveFaery/di_item1.png";
            } else {
                item.imgEqual.skin = "saveFaery/equal.png";
                item.diTarget.skin = "saveFaery/di_item.png";
            }
        }

        private getReward(id: number) {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_save_hua_reward({ id: id })).then((msg: pb.sc_get_save_hua_reward) => {
                alert.showReward(msg.item);
                this.listReward.refresh();
                util.RedPoint.reqRedPointRefresh(29322);
                this.mouseEnabled = true;
            }).catch(() => {
                this.mouseEnabled = true;
            });
        }

        /**render设置 */
        private exchangeRender(item: ui.saveFaery.render.ExchangeItemUI) {
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
            if (data.id == 3113) {
                item.imgGot.visible = this.itemExchangetTimes == data.limit.v2;
            } else {
                item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1) && data.repeat == 0;
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
                item.imgEqual.skin = "saveFaery/equal1.png";
                item.diTarget.skin = "saveFaery/di_item1.png";
            } else {
                item.btnExchange.visible = false;
                item.imgEqual.skin = "saveFaery/equal.png";
                item.diTarget.skin = "saveFaery/di_item.png";
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
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 225 })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                if (id == 3113) {
                    this.itemExchangetTimes++;
                }
                this.listExchange.refresh();
                EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
                util.RedPoint.reqRedPointRefresh(29321);
                this.mouseEnabled = true;
            }).catch(() => {
                EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
                this.mouseEnabled = true;
            })
        }

        private freshCoinInfo() {
            this.listExchange.refresh();
        }

        private onCloseClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            let suitId = idx == 1 ? this.suit1 : this.suit2;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnBack1, Laya.Event.CLICK, this, this.openPointReward, [false]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.openPointReward, [true]);
            BC.addEvent(this, this.btnBack2, Laya.Event.CLICK, this, this.openExchangeReward, [false]);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.openExchangeReward, [true]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.trySuit, [2]);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.freshCoinInfo);
        }

        destroy() {
            super.destroy();
        }
    }
}