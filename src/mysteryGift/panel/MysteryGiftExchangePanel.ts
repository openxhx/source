namespace mysteryGift {
    export class MysteryGiftExchangePanel extends ui.mysteryGift.panel.MysteryGiftExchangeUI {
        private type: number;
        private haveNum: number;
        private totalNum: number;
        constructor() {
            super();
            this.init();
            this.sideClose = true;
        }

        init() {
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.ListRender);
        }

        private ListRender(item: ui.mysteryGift.render.ExchangeRenderUI) {
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
                item.imgEqual.skin = "mysteryGift/equal1.png";
                item.diTarget.skin = "mysteryGift/di_item1.png";
            } else {
                item.btnExchange.visible = false;
                item.imgEqual.skin = "mysteryGift/equal.png";
                item.diTarget.skin = "mysteryGift/di_item.png";
            }
        }

        public ShowPanel(type: number) {
            this.type = type;
            let idx: number = 0;
            let max: number = 0;
            if (type == 1) {
                idx = 2898;
                max = 2905;
            } else if (type == 2) {
                idx = 2906;
                max = 2919;
            } else {
                idx = 2920;
                max = 2927;
            }
            let arr: xls.eventExchange[] = [];
            this.haveNum = this.totalNum = 0;
            while (idx <= max) {
                this.totalNum++;
                let config = xls.get(xls.eventExchange).get(idx);
                let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1
                arr.push(config);
                if (clientCore.ItemsInfo.checkHaveItem(reward)) {
                    this.haveNum++;
                }
                idx++;
            }
            this.list.array = arr;
            let suitId = type == 1 ? 2110495 : (type == 2 ? 2100337 : 2110496);
            this.labSuit.text = clientCore.SuitsInfo.getSuitInfo(suitId).suitInfo.name;
            this.imgSuit.skin = `unpack/mysteryGift/suit_${type}_${clientCore.LocalInfo.sex}.png`;
            this.labPro.text = "已集齐：" + this.haveNum + "/" + this.totalNum;
            clientCore.DialogMgr.ins.open(this);
        }

        private ShowItemTip(item: any, id: number, e: Laya.Event) {
            clientCore.ToolTip.showTips(item, { id: id });
            e.stopPropagation();
        }

        private Exchange(id: number) {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_mystical_gift_reward({ id: id, type: this.type })).then((msg: pb.sc_get_mystical_gift_reward) => {
                alert.showReward(msg.item);
                this.haveNum++;
                this.labPro.text = "已集齐：" + this.haveNum + "/" + this.totalNum;
                this.list.refresh();
                this.mouseEnabled = true;
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}