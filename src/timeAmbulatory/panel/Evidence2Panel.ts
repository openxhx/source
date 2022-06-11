namespace timeAmbulatory {
    export class Evidence2Panel extends ui.timeAmbulatory.panel.Evidence2PanelUI {
        private goodsInfo: util.HashMap<{ id: number, itemId: number, oriPrice: number }>;
        private readonly suitBuyId = 2431;
        private readonly stageBuyId = 2432;
        private readonly tipBuyId = 2433;
        private curSelect: number[];
        private curPrice: number;
        private curGot: number[];
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.goodsInfo = new util.HashMap();
            let arr = [this.suitBuyId, this.stageBuyId, this.tipBuyId];
            for (let i: number = 0; i < arr.length; i++) {
                let config = xls.get(xls.eventExchange).get(arr[i]);
                let itemId = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
                this.goodsInfo.add(arr[i], { id: arr[i], itemId: itemId, oriPrice: config.cost[0].v2 });
            }
            this.txtOriSuit.text = "" + this.goodsInfo.get(this.suitBuyId).oriPrice;
            this.txtOriStage.text = "" + this.goodsInfo.get(this.stageBuyId).oriPrice;
            this.txtOriTip.text = "" + this.goodsInfo.get(this.tipBuyId).oriPrice;
            this.setUI();
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年1月22日活动', '【付费】光阴的回廊', '打开融雪之恋页签');
        }

        private setUI() {
            this.curGot = [];
            this.curSelect = [];
            //默认没买的全选
            //套装
            let isGotSuit = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.suitBuyId).itemId);
            if (isGotSuit) this.curGot.push(this.suitBuyId);
            else this.curSelect.push(this.suitBuyId);
            this.imgGotSuit.visible = isGotSuit;
            this.boxGouSuit.visible = !isGotSuit;
            this.imgGouSuit.visible = true;
            //舞台
            let isGotStage = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.stageBuyId).itemId);
            if (isGotStage) this.curGot.push(this.stageBuyId);
            else this.curSelect.push(this.stageBuyId);
            this.imgGotStage.visible = isGotStage;
            this.boxGouStage.visible = !isGotStage;
            this.imgGouStage.visible = true;
            //贴纸
            let isGotTip = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.tipBuyId).itemId);
            if (isGotTip) this.curGot.push(this.tipBuyId);
            else this.curSelect.push(this.tipBuyId);
            this.imgGotTip.visible = isGotTip;
            this.boxGouTip.visible = !isGotTip;
            this.imgGouTip.visible = true;
            ///////////////////////////////////////////////////
            this.boxBuy.visible = !(isGotSuit && isGotStage && isGotTip);
            this.calculatePrice();
        }

        private calculatePrice() {
            let cnt = this.curGot.length + this.curSelect.length;
            let curOff = cnt == 2 ? 0.2 : cnt == 3 ? 0.3 : 0;//当前享受的折扣
            let gotOff = this.curGot.length == 2 ? 0.2 : this.curGot.length == 3 ? 0.3 : 0;//享受过的折扣
            let gotPrice = 0;//买过的商品的原价
            for (let i: number = 0; i < this.curGot.length; i++) {
                gotPrice += this.goodsInfo.get(this.curGot[i]).oriPrice;
            }
            let selectPrice = 0;//当前选择的商品的原价
            for (let i: number = 0; i < this.curSelect.length; i++) {
                selectPrice += this.goodsInfo.get(this.curSelect[i]).oriPrice;
            }
            let allOffCnt = Math.floor((gotPrice + selectPrice) * curOff);//总折扣
            let gotOffCnt = Math.floor(gotPrice * gotOff);//享受过的折扣
            this.curPrice = selectPrice - allOffCnt + gotOffCnt;//当前应付的价格
            this.txtTotal.text = "" + this.curPrice;
        }

        public hide() {
            this.visible = false;
        }

        /**购买套装 */
        private async buySuit() {
            if(this.curSelect.length == 0) return;
            if (!this.checkMoney(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, this.curPrice)) return;
            alert.showSmall(`确定花费${this.curPrice}灵豆购买所选商品吗？`, {
                callBack: {
                    caller: this, funArr: [this.buy]
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
        private buy() {
            net.sendAndWait(new pb.cs_time_cloister_buy_suit_2st({ idxs: this.curSelect })).then(async (data: pb.sc_time_cloister_buy_suit_2st) => {
                alert.showReward(data.itms);
                this.setUI();
            }).catch(() => {
                this.setUI();
            })
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.goodsInfo.get(this.suitBuyId).itemId);
        }

        /**预览舞台 */
        private tryBgStage() {
            let _id = this.goodsInfo.get(this.stageBuyId).itemId;
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: _id, condition: '', limit: '' });
        }

        onSelect(id: number) {
            let idx = this.curSelect.indexOf(id);
            if (idx >= 0) this.curSelect.splice(idx, 1);
            else this.curSelect.push(id);
            this.imgGouStage.visible = this.curSelect.indexOf(this.stageBuyId) >= 0;
            this.imgGouSuit.visible = this.curSelect.indexOf(this.suitBuyId) >= 0;
            this.imgGouTip.visible = this.curSelect.indexOf(this.tipBuyId) >= 0;
            this.calculatePrice();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnTryStage, Laya.Event.CLICK, this, this.tryBgStage);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
            BC.addEvent(this, this.boxGouStage, Laya.Event.CLICK, this, this.onSelect, [this.stageBuyId]);
            BC.addEvent(this, this.boxGouSuit, Laya.Event.CLICK, this, this.onSelect, [this.suitBuyId]);
            BC.addEvent(this, this.boxGouTip, Laya.Event.CLICK, this, this.onSelect, [this.tipBuyId]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.goodsInfo.clear();
            this.curGot = this.curSelect = null;
            this.removeEventListeners();
        }
    }
}