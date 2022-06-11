namespace diningCar {
    export class DiningCarShopPanel extends ui.diningCar.panel.DiningCarShopUI {
        private curPage: number;
        /**当前选择商品 */
        private curId: number;
        private waitMsg: boolean;
        private buyInfo: pb.IcommonShop[];
        constructor(buyInfo: pb.IcommonShop[]) {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.buyInfo = buyInfo;
            this.initView();
            this.setPage(1);
        }

        private initView() {
            let tili = xls.get(xls.eventExchange).get(2434);
            let coin = xls.get(xls.eventExchange).get(2435);
            let limitTili = _.find(this.buyInfo, (o) => { return o.id == 2434 }).buyCnt;
            let limitCoin = _.find(this.buyInfo, (o) => { return o.id == 2435 }).buyCnt;
            this.labLimit1.text = `每日限购：${limitTili}/${tili.limit.v2}`;
            this.labTgt1.text = "x" + tili.maleProperty[0].v2;
            this.btnBuy1.disabled = limitTili >= tili.limit.v2;
            this.labLimit2.text = `每日限购：${limitCoin}/${coin.limit.v2}`;
            this.labTgt2.text = "x" + coin.maleProperty[0].v2;
            this.btnBuy2.disabled = limitCoin >= coin.limit.v2;
            this.list.array = _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.id >= 2436 && o.id <= 2444 });
        }

        public show() {
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开特殊商店弹窗');
            this.list.refresh();
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.diningCar.render.DiningCarShopItemUI) {
            let data: xls.eventExchange = item.dataSource;
            let reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            item.bg.skin = clientCore.ItemsInfo.getItemIconBg(reward.v1);
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            if (data.limit.v1 != 0) {
                let limit = _.find(this.buyInfo, (o) => { return o.id == data.id }).buyCnt;
                item.labCost.text = `${data.cost[0].v2}`;
                item.boxLimit.visible = true;
                item.labLimit.text = "今日剩余:" + (data.limit.v2 - limit);
                item.imgGot.visible = item.btnGet.disabled = limit >= data.limit.v2;
            } else {
                item.boxLimit.visible = false;
                item.labCost.text = data.cost[0].v2.toString();
                if (data.repeat == 1) {
                    item.btnGet.disabled = false;
                    item.imgGot.visible = false;
                } else {
                    item.btnGet.disabled = item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
                }
            }
            BC.addEvent(this, item.icon, Laya.Event.CLICK, this, this.shopTips, [item, reward.v1]);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.checkCost, [data.id]);
        }

        private shopTips(item: ui.diningCar.render.DiningCarShopItemUI, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        private setPage(page: number) {
            if (this.curPage == page) return;
            this.curPage = page;
            this.boxShop.visible = page == 1;
            this.list.visible = page == 2;
            this.di_tag1.skin = this.curPage == 1 ? "diningCar/clip_l_w_1.png" : "diningCar/clip_l_w_2.png";
            this.di_tag2.skin = this.curPage == 2 ? "diningCar/clip_l_w_1.png" : "diningCar/clip_l_w_2.png";
            this.name_shop.y = this.curPage == 1 ? 22 : 36;
            this.name_exchange.y = this.curPage == 2 ? 22 : 36;
        }

        private checkCost(id: number) {
            let config = xls.get(xls.eventExchange).get(id);
            let cost = config.cost[0];
            let have = clientCore.ItemsInfo.getItemNum(cost.v1);
            if (have >= cost.v2) {
                this.curId = id;
                alert.showSmall(`确定花费${cost.v2}${clientCore.ItemsInfo.getItemName(cost.v1)}购买所选商品？`, { callBack: { caller: this, funArr: [this.buy] } });
            } else {
                if (cost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(cost.v2 - have);
                    }));
                } else if (cost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`${clientCore.ItemsInfo.getItemName(cost.v1)}不足~`);
                }
            }
        }

        private buy() {
            if (this.waitMsg || !this.curId) return;
            this.waitMsg = true;
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: this.curId, activityId: 113 })).then(async (data: pb.sc_common_exchange) => {
                alert.showReward(data.item);
                let limit = _.find(this.buyInfo, (o) => { return o.id == this.curId });
                if (limit) {
                    limit.buyCnt += 1;
                    let config = xls.get(xls.eventExchange).get(this.curId);
                    if (this.curId == 2434) {
                        this.labLimit1.text = `每日限购：${limit.buyCnt}/${config.limit.v2}`;
                        this.btnBuy1.disabled = limit.buyCnt >= config.limit.v2;
                    } else if (this.curId == 2435) {
                        this.labLimit2.text = `每日限购：${limit.buyCnt}/${config.limit.v2}`;
                        this.btnBuy2.disabled = limit.buyCnt >= config.limit.v2;
                    } else {
                        this.list.refresh();
                    }
                }
                this.curId = 0;
                this.waitMsg = false;
            }).catch(() => {
                this.waitMsg = false;
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.di_tag1, Laya.Event.CLICK, this, this.setPage, [1]);
            BC.addEvent(this, this.di_tag2, Laya.Event.CLICK, this, this.setPage, [2]);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.checkCost, [2434]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.checkCost, [2435]);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}