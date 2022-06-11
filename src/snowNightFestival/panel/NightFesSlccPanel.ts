namespace snowNightFestival {
    export class NightFesSlccPanel extends ui.snowNightFestival.panel.NightFesSlccPanelUI {
        private readonly suitIds: number[] = [2110166, 2100269, 2110187, 2110219];
        private readonly coinId: number = clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID;
        private readonly giftIds: number[] = [2393, 2394, 2426, 2427];
        private curPage: number;
        private panelName: { name: string, open: number }[];
        private _moving: boolean;
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.panelName = [{ name: "txny", open: 0 }, { name: "sdhl", open: 1 }];
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.list.array = this.panelName;
        }

        public onShow() {
            // clientCore.Logger.sendLog('2020年11月13日活动', '【付费】淘乐节·银杏誓约', '打开杏叶画廊面板');
            clientCore.UIManager.setMoneyIds([this.coinId]);
            clientCore.UIManager.showCoinBox();
            this.setUI();
        }

        private async setUI() {
            this.setOneUI();
            this.setTwoUI();
            this.tabMouse(1);
        }

        /**页签 */
        private tabRender(item: ui.snowNightFestival.render.PageTagItemUI) {
            let data: { name: string, open: number } = item.dataSource;
            item.di_0.visible = data.open == 0;
            item.di_1.visible = data.open == 1;
            item.img_name.skin = `snowNightFestival/tag_${data.name}.png`;
            switch (data.name) {
                case "txny":
                    item.red.visible = util.RedPoint.checkShow([21303]);
                    break;
                case "sdhl":
                    item.red.visible = util.RedPoint.checkShow([21306]);
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
            this.img_suit.skin = `unpack/snowNightFestival/suit_${this.panelName[idx].name}_${clientCore.LocalInfo.sex}.png`;
            this.btn_try_1.visible = this.btn_try_2.visible = this.curPage < 4;
            if (idx == 0) this.setOneUI();
            else if (idx == 1) this.setTwoUI();
            this.list.selectedIndex = -1;
        }

        /**第一期UI */
        private setOneUI() {
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[0]).allGet;
            let have2 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[1]).allGet;
            this.img_got_1.visible = have1;
            this.img_got_2.visible = have2;
            this.btn_buy_1.visible = !have1;
            this.btn_buy_2.visible = !have2;
            this.btn_get.visible = have1 && have2 && !clientCore.ItemsInfo.checkHaveItem(1000069);
            this.img_tip_1.visible = !have1 || !have2;
        }

        /**第二期UI */
        private setTwoUI() {
            let have3 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[2]).allGet;
            let have4 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[3]).allGet;
            this.img_got_3.visible = have3;
            this.img_got_4.visible = have4;
            this.btn_buy_3.visible = !have3;
            this.btn_buy_4.visible = !have4;
            this.btn_get.visible = have3 && have4 && !clientCore.ItemsInfo.checkHaveItem(1000070);
            this.img_tip_1.visible = !have3 || !have4;
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**购买套装 */
        private async buySuit(idx: number) {
            if (this["img_got_" + (idx + 1)].visible) return;
            let config = xls.get(xls.eventExchange).get(this.giftIds[idx]);
            let cost = config.cost[0].v2;
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
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return false;
            }
            return true;
        }

        /**实际购买 */
        private buy(id: number) {
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 106 })).then(async (data: pb.sc_common_exchange) => {
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
                if (this.giftIds.indexOf(id) < 2) this.setOneUI();
                else this.setTwoUI();
                alert.showReward(arr);
            }).catch(() => {
                if (this.giftIds.indexOf(id) < 2) this.setOneUI();
                else this.setTwoUI();
            })
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitIds[idx]);
        }

        /**预览背景秀舞台 */
        private tryBgStage(_id: number) {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: _id, condition: '', limit: '' });
        }

        private checkAllGet() {
            net.sendAndWait(new pb.cs_get_snowy_night_rewards({ id: 1, period: this.curPage })).then(async (msg: pb.sc_get_snowy_night_rewards) => {
                alert.showReward(msg.items);
                this.btn_get.visible = false;
                await util.RedPoint.reqRedPointRefresh(21303);
                await util.RedPoint.reqRedPointRefresh(21306);
                this.list.refresh();
                EventManager.event("NIGHTFES_REFRESH_TAB");
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btn_try_1, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btn_try_2, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.btn_try_3, Laya.Event.CLICK, this, this.trySuit, [2]);
            BC.addEvent(this, this.btn_try_4, Laya.Event.CLICK, this, this.trySuit, [3]);
            BC.addEvent(this, this.btn_detial, Laya.Event.CLICK, this, this.tryBgStage, [1000069]);
            BC.addEvent(this, this.btn_try_bgshow, Laya.Event.CLICK, this, this.tryBgStage, [1000070]);
            BC.addEvent(this, this.btn_try_stage, Laya.Event.CLICK, this, this.tryBgStage, [1100039]);
            BC.addEvent(this, this.btn_get, Laya.Event.CLICK, this, this.checkAllGet);
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this["btn_buy_" + i], Laya.Event.CLICK, this, this.buySuit, [i - 1]);
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