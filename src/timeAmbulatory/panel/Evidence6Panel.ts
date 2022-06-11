namespace timeAmbulatory {
    export class Evidence6Panel extends ui.timeAmbulatory.panel.Evidence6PanelUI {
        private goodsInfo: util.HashMap<{ id: number, itemId: number, oriPrice: number }>;
        private readonly hmzcBuyId = 2455;
        private readonly rcxyBuyId = 2456;
        private readonly bgBuyId = 2457;
        private readonly allBuyId = 2458;
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            let arr = [this.allBuyId, this.hmzcBuyId, this.rcxyBuyId, this.bgBuyId];
            this.goodsInfo = new util.HashMap();
            for (let i: number = 0; i < arr.length; i++) {
                let config = xls.get(xls.eventExchange).get(arr[i]);
                let itemId = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
                this.goodsInfo.add(arr[i], { id: arr[i], itemId: itemId, oriPrice: config.cost[0].v2 });
            }
            this.setUI();
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年2月19日活动', '【付费】光阴的回廊', '打开祥瑞春涧页签');
        }

        private setUI() {
            //绘梦之春套装
            let isGotHmzc = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.hmzcBuyId).itemId);
            this.imgGotHmzc.visible = isGotHmzc;
            this.boxBuyHmzc.visible = !isGotHmzc;
            this.labCostHmzc.text = "" + this.goodsInfo.get(this.hmzcBuyId).oriPrice;
            //瑞春祥云套装
            let isGotRcxy = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.rcxyBuyId).itemId);
            this.imgGotRcxy.visible = isGotRcxy;
            this.boxBuyRcxy.visible = !isGotRcxy;
            this.labCostRcxy.text = "" + this.goodsInfo.get(this.rcxyBuyId).oriPrice;
            //背景秀
            let isGotBg = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.bgBuyId).itemId);
            this.imgGotBg.visible = isGotBg;
            this.boxBuyBg.visible = !isGotBg;
            this.labCostBg.text = "" + this.goodsInfo.get(this.bgBuyId).oriPrice;
            ///////////////////////////////////////////////////
            this.boxOff.visible = !(isGotHmzc || isGotRcxy || isGotBg);
            this.labCostOff.text = "" + this.goodsInfo.get(this.allBuyId).oriPrice;
        }

        public hide() {
            this.visible = false;
        }

        /**购买套装 */
        private async buySuit(idx: number) {
            let id = this.goodsInfo.getValues()[idx].id;
            let price = this.goodsInfo.getValues()[idx].oriPrice;
            if (!this.checkMoney(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, price)) return;
            alert.showSmall(`确定花费${price}灵豆购买所选商品吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_time_cloister_buy_suit_6st({ idx: id })).then(async (data: pb.sc_time_cloister_buy_suit_2st) => {
                            alert.showReward(data.itms);
                            this.setUI();
                        }).catch(() => {
                            this.setUI();
                        })
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

        /**试穿套装 */
        private trySuit(idx: number) {
            let buyId = idx == 0 ? this.hmzcBuyId : this.rcxyBuyId;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.goodsInfo.get(buyId).itemId);
        }

        /**预览舞台 */
        private tryBgStage() {
            let _id = this.goodsInfo.get(this.rcxyBuyId).itemId;
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: _id, condition: '', limit: '' });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTryHmzc, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btnTryRcxy, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.boxBuyHmzc, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.boxBuyRcxy, Laya.Event.CLICK, this, this.buySuit, [2]);
            BC.addEvent(this, this.boxBuyBg, Laya.Event.CLICK, this, this.buySuit, [3]);
            BC.addEvent(this, this.boxBuyOff, Laya.Event.CLICK, this, this.buySuit, [0]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.goodsInfo.clear();
            this.removeEventListeners();
        }
    }
}