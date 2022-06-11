namespace timeAmbulatory {
    export class Evidence3Panel extends ui.timeAmbulatory.panel.Evidence3PanelUI {
        //2445,2446,2447,2448
        private buyJlcId: number;
        private buyBgzcId: number;
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.setUI();
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年1月29日活动', '【付费】光阴的回廊', '打开北国锦鲤页签');
        }

        private setUI() {
            //锦鲤抄
            let isGotJlc = clientCore.SuitsInfo.getSuitInfo(2100279).allGet;
            this.boxBuyJlc.visible = !isGotJlc;
            this.imgGotJlc.visible = isGotJlc;
            //北国之春
            let isGotBgzc = clientCore.SuitsInfo.getSuitInfo(2110262).allGet;
            this.boxBuyBgzc.visible = !isGotBgzc;
            this.imgGotBgzc.visible = isGotBgzc;
            //舞台
            let isGotStage = clientCore.ItemsInfo.checkHaveItem(1100051);
            this.btnGet.visible = !isGotStage && isGotJlc && isGotBgzc;
            this.imgGotStage.visible = isGotStage;
            //价格
            this.buyJlcId = isGotBgzc ? 2446 : 2445;
            this.buyBgzcId = isGotJlc ? 2448 : 2447;
            this.labCostJlc.text = "" + xls.get(xls.eventExchange).get(this.buyJlcId).cost[0].v2;
            this.labCostBgzc.text = "" + xls.get(xls.eventExchange).get(this.buyBgzcId).cost[0].v2;
        }

        public hide() {
            this.visible = false;
        }

        /**购买套装 */
        private buySuit(type: number) {
            let target = type == 1 ? this.buyJlcId : this.buyBgzcId;
            let cost = xls.get(xls.eventExchange).get(target).cost[0].v2;
            if (!this.checkMoney(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, cost)) return;
            alert.showSmall(`确定花费${cost}灵豆购买所选商品吗？`, {
                callBack: {
                    caller: this, funArr: [() => { this.buy(type); }]
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
        private buy(type: number) {
            net.sendAndWait(new pb.cs_time_cloister_buy_suit_3st({ idx: type })).then(async (data: pb.sc_time_cloister_buy_suit_3st) => {
                alert.showReward(data.itms);
                this.setUI();
            }).catch(() => {
                this.setUI();
            })
        }

        /**试穿套装 */
        private trySuit(id: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
        }

        /**预览舞台 */
        private tryBgStage() {
            let _id = 1100051;
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: _id, condition: '', limit: '' });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTryBgzc, Laya.Event.CLICK, this, this.trySuit, [2110262]);
            BC.addEvent(this, this.btnTryJlc, Laya.Event.CLICK, this, this.trySuit, [2100279]);
            BC.addEvent(this, this.boxBuyBgzc, Laya.Event.CLICK, this, this.buySuit, [2]);
            BC.addEvent(this, this.boxBuyJlc, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.buy, [3]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
        }
    }
}