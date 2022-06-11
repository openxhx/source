namespace ginkgoOath {
    export class GinkgoOathXyhlPanel extends ui.ginkgoOath.panel.GinkgoOathXyhlPanelUI {
        private readonly suitIds: number[] = [2110175, 2100256, 2110183, 2100257, 2110186, 2100261, 2100265];
        private readonly coinId: number = 1511012;
        private readonly giftIds: number[] = [2316, 2317, 2320, 2321, 2344, 2345, 2369, 2365, 2366, 2367, 2368];
        private curPage: number;
        private panelName: { name: string, open: number }[];
        private _moving: boolean;
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.panelName = [{ name: "hqny", open: 0 }, { name: "hfqy", open: 0 }, { name: "syyy", open: 0 }, { name: "lzjl", open: 1 }];
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.list.array = this.panelName;
        }

        public onShow() {
            clientCore.Logger.sendLog('2020年11月13日活动', '【付费】淘乐节·银杏誓约', '打开杏叶画廊面板');
            clientCore.UIManager.setMoneyIds([this.coinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.setUI();
        }

        private async setUI() {
            this.setOneUI();
            this.setTwoUI();
            this.setThreeUI();
            this.setFourUI();
            this.tabMouse(3);
        }

        /**页签 */
        private tabRender(item: ui.ginkgoOath.render.PageTagItemUI) {
            let data: { name: string, open: number } = item.dataSource;
            item.di.skin = `ginkgoOath/di_show_${data.open}.png`;
            item.img_name.skin = `ginkgoOath/tag_${data.name}_${data.open}.png`;
            switch (data.name) {
                case "syyy":
                    item.red.visible = util.RedPoint.checkShow([19304]);
                    break;
                default:
                    item.red.visible = false;
            }
        }

        private tabMouse(idx: number) {
            if (idx < 0) return;
            if (this.curPage > 0) {
                this["box" + this.curPage].visible = false;
                this.panelName[this.curPage - 1].open = 0;
            }
            this.panelName[idx].open = 1;
            this.list.refresh();
            this.curPage = idx + 1;
            this["box" + this.curPage].visible = true;
            this.img_suit.skin = `unpack/ginkgoOath/suit_${this.panelName[idx].name}_${clientCore.LocalInfo.sex}.png`;
            this.btn_try_1.visible = this.btn_try_2.visible = this.curPage < 4;
            this.list.selectedIndex = -1;
        }

        /**第一期UI */
        private setOneUI() {
            let haveMysg = clientCore.SuitsInfo.getSuitInfo(this.suitIds[0]).allGet;
            let haveCmnx = clientCore.SuitsInfo.getSuitInfo(this.suitIds[1]).allGet;
            let costMysg = xls.get(xls.eventExchange).get(this.giftIds[0]).cost[0].v2;
            let costCmnx = xls.get(xls.eventExchange).get(this.giftIds[1]).cost[0].v2;
            this.img_got_1.visible = haveMysg;
            this.img_got_2.visible = haveCmnx;
            this.img_off.visible = (haveMysg || haveCmnx) && !(haveMysg && haveCmnx);
            if (haveMysg && this.img_off.visible) {
                this.img_off.pos(this.btn_buy_2.x - 38, this.btn_buy_2.y - 32);
                costCmnx -= 120;
            }
            if (haveCmnx && this.img_off.visible) {
                this.img_off.pos(this.btn_buy_1.x - 38, this.btn_buy_1.y - 32);
                costMysg -= 120;
            }
            this.cost_1.skin = `ginkgoOath/${costMysg}.png`;
            this.cost_2.skin = `ginkgoOath/${costCmnx}.png`;
        }

        /**第二期UI */
        private setTwoUI() {
            let have3 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[2]).allGet;
            let have4 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[3]).allGet;
            let cost3 = xls.get(xls.eventExchange).get(this.giftIds[2]).cost[0].v2;
            let cost4 = xls.get(xls.eventExchange).get(this.giftIds[3]).cost[0].v2;
            this.img_got_3.visible = have3;
            this.img_got_4.visible = have4;
            this.img_off_2.visible = (have3 || have4) && !(have3 && have4);
            if (have3 && this.img_off_2.visible) {
                this.img_off_2.pos(this.btn_buy_4.x - 38, this.btn_buy_4.y - 32);
                cost4 -= 120;
            }
            if (have4 && this.img_off_2.visible) {
                this.img_off_2.pos(this.btn_buy_3.x - 38, this.btn_buy_3.y - 32);
                cost3 -= 120;
            }
            this.cost_3.skin = `ginkgoOath/${cost3}.png`;
            this.cost_4.skin = `ginkgoOath/${cost4}.png`;
        }

        /**第三期 */
        private setThreeUI() {
            this.img_got_5.visible = clientCore.SuitsInfo.getSuitInfo(this.suitIds[4]).allGet;;
            this.img_got_6.visible = clientCore.SuitsInfo.getSuitInfo(this.suitIds[5]).allGet;;
            this.btn_buy_5.disabled = clientCore.FlowerPetInfo.petType < 3;
        }

        /**第四期 */
        private setFourUI() {
            let isOff = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) < util.TimeUtil.formatTimeStrToSec("2020/11/30 00:00:00");
            this.img_limit_off.visible = isOff;
            let allGet = true;
            let allCost = isOff ? xls.get(xls.eventExchange).get(2370).cost[0].v2 : xls.get(xls.eventExchange).get(2371).cost[0].v2;
            let d_value = 0;
            for (let i = 6; i < 11; i++) {
                let config = xls.get(xls.eventExchange).get(this.giftIds[i]);
                let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
                this["img_got_" + (i + 1)].visible = clientCore.ItemsInfo.checkHaveItem(target);
                allGet = allGet && this["img_got_" + (i + 1)].visible;
                if (this["img_got_" + (i + 1)].visible) d_value += config.cost[0].v2;
                if (i > 6) this["icon_" + this.giftIds[i]].skin = clientCore.ItemsInfo.getItemIconUrl(target);
            }
            if (!allGet) allCost -= d_value;
            if (allCost < 0) allCost = 0;
            this.img_got_all.visible = allGet;
            this.price_all.value = "" + allCost;

        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**购买套装 */
        private async buySuit(idx: number) {
            if (this["img_got_" + (idx + 1)].visible) return;
            let off_value = 0;
            if ([0, 1].indexOf(idx) >= 0 && this.img_off.visible) off_value = 120;
            else if ([2, 3].indexOf(idx) >= 0 && this.img_off_2.visible) off_value = 120;
            let config = xls.get(xls.eventExchange).get(this.giftIds[idx]);
            let cost = config.cost[0].v2 - off_value;
            if (!this.checkMoney(config.cost[0].v1, cost)) return;
            let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            let suitName = clientCore.ItemsInfo.getItemName(target);
            alert.showSmall(`确定花费${cost}${clientCore.ItemsInfo.getItemName(config.cost[0].v1)}购买${suitName}吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.buy(this.giftIds[idx]);
                    }]
                }
            })
        }

        /**检查余额 */
        private checkMoney(costId: number, costValue: number) {
            let has = clientCore.ItemsInfo.getItemNum(costId);
            if (has < costValue) {
                alert.showSmall("淘乐球不足，是否要购买？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            alert.alertQuickBuy(costId, costValue - has, true);
                        }]
                    }
                })
                return false;
            }
            return true;
        }

        /**实际购买 */
        private buy(id: number) {
            if (id == 2344 && this.img_got_5.visible) return;
            if ([2370, 2371].indexOf(id) > 0 && this.img_got_all.visible) return;
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 92 })).then(async (data: pb.sc_common_exchange) => {
                let arr: pb.IItem[] = [];
                for (let j: number = 0; j < data.item.length; j++) {
                    if (xls.get(xls.suits).has(data.item[j].id)) {
                        let clothes = clientCore.SuitsInfo.getSuitInfo(data.item[j].id).clothes;
                        for (let i: number = 0; i < clothes.length; i++) {
                            let item = new pb.Item();
                            item.id = clothes[i];
                            item.cnt = 1;
                            arr.push(item);
                        }
                    } else {
                        arr.push(data.item[j]);
                    }
                }
                alert.showReward(arr);
                if (this.giftIds.indexOf(id) >= 0) {
                    if (this.giftIds.indexOf(id) < 2) this.setOneUI();
                    else if (this.giftIds.indexOf(id) < 4) this.setTwoUI();
                    else if (this.giftIds.indexOf(id) < 6) this.setThreeUI();
                    else this.setFourUI();
                } else {
                    this.setFourUI();
                }
                if (this.giftIds.indexOf(id) == 4) {
                    await util.RedPoint.reqRedPointRefresh(19304);
                    this.list.refresh();
                    EventManager.event("GINKGOOATH_REFRESH_TAB");
                }
            }).catch(() => {
                this.setFourUI();
            })
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            let target = idx + this.curPage * 2 - 2;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitIds[target]);
        }

        /**翻页 */
        private changePage(flag: number) {
            if (this._moving) return;
            let out = this["box" + this.curPage];
            if (flag == -1 && this.curPage == 1) this.curPage = 2;
            else if (flag == 1 && this.curPage == 2) this.curPage = 1;
            else this.curPage = this.curPage + flag;
            let enter = this["box" + this.curPage];
            if (flag > 0) {
                this.toLeft(enter, out);
            } else {
                this.toRight(enter, out);
            }
        }

        /**右移 */
        private async toRight(enter: any, out: any) {
            this._moving = true;
            enter.x = -1027;
            enter.visible = true;
            Laya.Tween.to(out, { x: 1027 }, 500, null, new Laya.Handler(this, () => {
                out.visible = false;
            }));
            Laya.Tween.to(enter, { x: 0 }, 500);
            await util.TimeUtil.awaitTime(600);
            this._moving = false;
        }

        /**左移 */
        private async toLeft(enter: any, out: any) {
            this._moving = true;
            enter.x = 1027;
            enter.visible = true;
            Laya.Tween.to(out, { x: -1027 }, 500, null, new Laya.Handler(this, () => {
                out.visible = false;
            }));
            Laya.Tween.to(enter, { x: 0 }, 500);
            await util.TimeUtil.awaitTime(600);
            this._moving = false;
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        /**打包购买 */
        private buyAll() {
            let isOff = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) < util.TimeUtil.formatTimeStrToSec("2020/11/30 00:00:00");
            if (this.img_limit_off.visible != isOff) this.setFourUI();
            if (this.img_got_all.visible) return;
            if (!this.checkMoney(1511012, parseInt(this.price_all.value))) return;
            let id = isOff ? 2370 : 2371;
            alert.showSmall(`确定花费${parseInt(this.price_all.value)}淘乐球打包购买未拥有服装吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.buy(id);
                    }]
                }
            })
        }

        private showTip(item: any, id: number) {
            let config = xls.get(xls.eventExchange).get(id);
            let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            clientCore.ToolTip.showTips(item, { id: target });
        }

        addEventListeners() {
            // BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changePage, [-1]);
            // BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changePage, [1]);
            BC.addEvent(this, this.btn_try_1, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btn_try_llmy, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btn_try_2, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.btn_up_huabao, Laya.Event.CLICK, this, this.goHuabaoHouse);
            BC.addEvent(this, this.btn_buy_all, Laya.Event.CLICK, this, this.buyAll);
            BC.addEvent(this, this.icon_2365, Laya.Event.CLICK, this, this.showTip, [this.icon_2365, 2365]);
            BC.addEvent(this, this.icon_2366, Laya.Event.CLICK, this, this.showTip, [this.icon_2366, 2366]);
            BC.addEvent(this, this.icon_2367, Laya.Event.CLICK, this, this.showTip, [this.icon_2367, 2367]);
            BC.addEvent(this, this.icon_2368, Laya.Event.CLICK, this, this.showTip, [this.icon_2368, 2368]);
            for (let i: number = 1; i <= 11; i++) {
                if (i == 5) {
                    BC.addEvent(this, this["btn_buy_" + i], Laya.Event.CLICK, this, this.buy, [2344]);
                } else {
                    BC.addEvent(this, this["btn_buy_" + i], Laya.Event.CLICK, this, this.buySuit, [i - 1]);
                }
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}