namespace timeAmbulatory {
    export class Evidence5Panel extends ui.timeAmbulatory.panel.Evidence5PanelUI {
        private goodsInfo: util.HashMap<{ id: number, itemId: number, oriPrice: number }>;
        private readonly hdlgBuyId = 2452;
        private readonly xszlBuyId = 2453;
        private readonly bgBuyId = 2454;
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
            let arr = [this.hdlgBuyId, this.xszlBuyId, this.bgBuyId];
            for (let i: number = 0; i < arr.length; i++) {
                let config = xls.get(xls.eventExchange).get(arr[i]);
                let itemId = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
                this.goodsInfo.add(arr[i], { id: arr[i], itemId: itemId, oriPrice: config.cost[0].v2 });
            }
            this.txtOriHdlg.text = "" + this.goodsInfo.get(this.hdlgBuyId).oriPrice;
            this.txtOriXszl.text = "" + this.goodsInfo.get(this.xszlBuyId).oriPrice;
            this.txtOriBg.text = "" + this.goodsInfo.get(this.bgBuyId).oriPrice;
            this.setUI();
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年2月12日活动', '【付费】光阴的回廊', '打开红白恋语页签');
        }

        private setUI() {
            this.curGot = [];
            this.curSelect = [];
            //默认没买的全选
            //红蝶恋归套装
            let isGotHdlg = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.hdlgBuyId).itemId);
            if (isGotHdlg) this.curGot.push(this.hdlgBuyId);
            else this.curSelect.push(this.hdlgBuyId);
            this.imgGotHdlg.visible = isGotHdlg;
            this.boxGouHdlg.visible = !isGotHdlg;
            this.imgGouHdlg.visible = true;
            //雪色之恋套装
            let isGotXszl = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.xszlBuyId).itemId);
            if (isGotXszl) this.curGot.push(this.xszlBuyId);
            else this.curSelect.push(this.xszlBuyId);
            this.imgGotXszl.visible = isGotXszl;
            this.boxGouXszl.visible = !isGotXszl;
            this.imgGouXszl.visible = true;
            //背景秀
            let isGotBg = clientCore.ItemsInfo.checkHaveItem(this.goodsInfo.get(this.bgBuyId).itemId);
            if (isGotBg) this.curGot.push(this.bgBuyId);
            else this.curSelect.push(this.bgBuyId);
            this.imgGotBg.visible = isGotBg;
            this.boxGouBg.visible = !isGotBg;
            this.imgGouBg.visible = true;
            ///////////////////////////////////////////////////
            this.boxBuy.visible = !(isGotHdlg && isGotXszl && isGotBg);
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
            if (this.curSelect.length == 0) return;
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
            net.sendAndWait(new pb.cs_time_cloister_buy_suit_5st({ idxs: this.curSelect })).then(async (data: pb.sc_time_cloister_buy_suit_2st) => {
                alert.showReward(data.itms);
                this.setUI();
            }).catch(() => {
                this.setUI();
            })
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            let buyId = idx == 0 ? this.hdlgBuyId : this.xszlBuyId;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.goodsInfo.get(buyId).itemId);
        }

        /**预览舞台 */
        private tryBgStage() {
            let _id = this.goodsInfo.get(this.xszlBuyId).itemId;
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: _id, condition: '', limit: '' });
        }

        onSelect(id: number) {
            let idx = this.curSelect.indexOf(id);
            if (idx >= 0) this.curSelect.splice(idx, 1);
            else this.curSelect.push(id);
            this.imgGouXszl.visible = this.curSelect.indexOf(this.xszlBuyId) >= 0;
            this.imgGouHdlg.visible = this.curSelect.indexOf(this.hdlgBuyId) >= 0;
            this.imgGouBg.visible = this.curSelect.indexOf(this.bgBuyId) >= 0;
            this.calculatePrice();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTryHdlg, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btnTryXszl, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
            BC.addEvent(this, this.boxGouXszl, Laya.Event.CLICK, this, this.onSelect, [this.xszlBuyId]);
            BC.addEvent(this, this.boxGouHdlg, Laya.Event.CLICK, this, this.onSelect, [this.hdlgBuyId]);
            BC.addEvent(this, this.boxGouBg, Laya.Event.CLICK, this, this.onSelect, [this.bgBuyId]);
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