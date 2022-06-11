namespace cp {
    const SUIT_ID = 2100054;
    const BG_ID = 1000041;
    const SHOP_ID_NO_SUIT = 6001;
    const SHOP_ID_HAVE_SUIT = 6003;
    const SHOP_ID_COUPLE = 7001;

    export class CpBridePanel extends ui.cp.panel.CpBridePanelUI {
        private _onlyHaveSuit: boolean;
        private _haveSuit: boolean;
        private _haveBg: boolean;

        constructor() {
            super();
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/cp/2850.png' : 'unpack/cp/2851.png';
            this.txtInfo.style.font = '汉仪中圆简';
            this.txtInfo.style.fontSize = 20;
            this.txtInfo.style.width = 506;
            this.txtInfo.style.wordWrap = true;
        }

        show() {
            clientCore.Logger.sendLog('2020年9月4日活动', '【活动】鬼月新娘', '打开活动界面')
            clientCore.DialogMgr.ins.open(this);
            this.updateView();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private updateView() {
            this._haveSuit = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet;
            this._haveBg = clientCore.BgShowManager.instance.checkHaveBgShow(BG_ID)
            this._onlyHaveSuit = this._haveSuit && !this._haveBg;
            this.btnBuy_1.disabled = this._haveSuit || !clientCore.CpManager.instance.haveCp();
            this.btnBuy_0.disabled = this._haveBg;
            let shopId = this._onlyHaveSuit ? SHOP_ID_HAVE_SUIT : SHOP_ID_NO_SUIT;
            this.updatePrice(0, shopId);
            this.updatePrice(1, SHOP_ID_COUPLE);
            this.txtInfo.innerHTML = !this._onlyHaveSuit ? util.StringUtils.getColorText3('幽冥花嫁豪华礼包中包含{幽冥花嫁套装、幽冥花嫁背景秀、幽冥花嫁舞台、幽冥花嫁轿子（单人坐骑）}', '#ffffff', '#fdff4e') : util.StringUtils.getColorText3('幽冥花嫁精美礼包中含{幽冥花嫁背景秀、幽冥花嫁舞台、幽冥花嫁轿子（单人坐骑）}', '#ffffff', '#fdff4e')
        }

        private updatePrice(idx: number, shopId: number) {
            let price = xls.get(xls.cpShop).get(shopId);
            let priceWedding = xls.get(xls.cpShop).get(shopId + 1);
            this['txtPrice_' + idx].value = price.cost.v2;
            this['txtWeddingPrice_' + idx].text = priceWedding.cost.v2;
        }

        private onClose() {
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }

        private _tmpid: number;
        private onBuy(idx: number) {
            if (this._haveBg) {
                alert.showFWords('你已经购买过啦');
                return;
            }
            let shopId: number;
            if (idx == 0) {
                shopId = this._haveSuit ? SHOP_ID_HAVE_SUIT : SHOP_ID_NO_SUIT
            }
            else {
                if (!clientCore.CpManager.instance.haveCp) {
                    alert.showSmall('需要有花缘才可购买并赠送')
                    return;
                }
                shopId = SHOP_ID_COUPLE;
            }
            shopId += (clientCore.CpManager.instance.haveWedding ? 1 : 0); //结缘礼价格
            let xlsConfig = xls.get(xls.cpShop).get(shopId);
            this._tmpid = shopId;
            alert.buySecondConfirm(xlsConfig.cost.v1, xlsConfig.cost.v2, `${xlsConfig.Stat}吗?`, { caller: this, funArr: [this.sureBuy] });
        }

        private sureBuy() {
            net.sendAndWait(new pb.cs_cp_shop_buy_item({ index: this._tmpid, num: 1 })).then((msg: pb.sc_cp_shop_buy_item) => {
                alert.showReward(msg.itms);
                this.updateView();
            })
        }

        private onDetail() {
            alert.showRuleByID(1060);
        }

        private onSuit() {
            alert.showSmall('是否确认单独购买套装，单独购买后将不能享受购买两套礼包的超值优惠？', { callBack: { caller: this, funArr: [this.sureGoSuit] } })
        }

        private sureGoSuit() {
            this.onClose();
            this.event(Laya.Event.COMPLETE);
        }

        private onTry() {
            alert.showPreviewModule(SUIT_ID)
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnBuy_0, Laya.Event.CLICK, this, this.onBuy, [0]);
            BC.addEvent(this, this.btnBuy_1, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}