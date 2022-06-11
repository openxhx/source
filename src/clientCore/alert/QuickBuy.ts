
namespace alert {
    /**
     * 通用购买
     * 点击确认，回调函数里面传入购买物品ID跟数量
     */
    export function quickBuy(buyInfo: QuickBuyInfo) {
        let view = new QuickBuy();
        view.setData(buyInfo);
        clientCore.DialogMgr.ins.open(view);
    }

    class QuickBuy extends ui.alert.QuickBuyUI {
        private _buyInfo: QuickBuyInfo;
        private _rewardDetail: ui.alert.RewardDetailUI;
        private _person: clientCore.Person;
        constructor() {
            super();
            this.addEventListeners();
            this.txtBuyNum.maxChars = 6;
            this.txtBuyNum.restrict = '0-9';
        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "quickBuyOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        setData(info: QuickBuyInfo) {
            this._buyInfo = info;
            this.txtName.text = this._buyInfo.buyItemName;
            this.txtSinglePrice.changeText("" + this._buyInfo.singlePrice);
            this.txtItemIntro.changeText(this._buyInfo.buyItemIntro);

            this.calMaxCanBuyNum();

            if (this._buyInfo.limitNum > 0) {
                this.mcLimit.visible = true;
                if (this._buyInfo.buyItemID == clientCore.MoneyManager.HEALTH_ID) { //体力购买
                    let vipInfo: xls.pair = clientCore.LocalInfo.getVipPrivilege(6);
                    this._buyInfo.limitNum = vipInfo ? this._buyInfo.limitNum + vipInfo.v2 : this._buyInfo.limitNum;
                }
                this.txtLimitNum.changeText("" + this._buyInfo.limitNum * this._buyInfo.stepNum);
            }
            else {
                this.mcLimit.visible = false;
            }
            this.txtHaveNum.changeText("" + this._buyInfo.haveNum);

            //计算合适的默认购买数量
            let rem: number = this._buyInfo.defaultBuyNum % this._buyInfo.stepNum;
            this._buyInfo.defaultBuyNum = rem == 0 ? this._buyInfo.defaultBuyNum : this._buyInfo.defaultBuyNum + this._buyInfo.stepNum - rem;
            this._buyInfo.minNum = this._buyInfo.minNum || this._buyInfo.defaultBuyNum;

            this.txtBuyNum.changeText("" + this._buyInfo.defaultBuyNum);
            if (this._buyInfo.buyItemID == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
                this.txtTotalPrice.changeText("" + this._buyInfo.defaultBuyNum / this._buyInfo.stepNum);
                this.boxSinglePrice.visible = false;
            }
            else {
                this.txtTotalPrice.changeText("" + this._buyInfo.defaultBuyNum * this._buyInfo.singlePrice);
            }

            this.itemBG.skin = clientCore.ItemsInfo.getItemIconBg(this._buyInfo.buyItemID);
            this.mcTokenImg1.skin = this.mcTokenImg2.skin = clientCore.ItemsInfo.getItemIconUrl(this._buyInfo.tokenID);
            if (clientCore.SeedFlowerRelateConf.isSeed(info.buyItemID)) {
                this.mcItemImg.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.SeedFlowerRelateConf.getRelateID(this._buyInfo.buyItemID));
            }
            else {
                this.mcItemImg.skin = clientCore.ItemsInfo.getItemIconUrl(this._buyInfo.buyItemID);
            }
            if (xls.get(xls.itemBag).has(this._buyInfo.buyItemID) && xls.get(xls.itemBag).get(this._buyInfo.buyItemID).event == 2 && xls.get(xls.itemBag).get(this._buyInfo.buyItemID).value > 0) {
                this.btnPreview.visible = true;
            }
            else {
                this.btnPreview.visible = false;
            }

            this.updateNum();
        }

        private calMaxCanBuyNum() {
            let haveCoin = clientCore.ItemsInfo.getItemNum(this._buyInfo.tokenID);
            let maxNum = this._buyInfo.stepNum * Math.floor(haveCoin / this._buyInfo.singlePrice);
            let max = this.getMaxNum();
            if (this._buyInfo.buyItemID == clientCore.MoneyManager.LEAF_MONEY_ID) {
                max = haveCoin || max;
                maxNum = maxNum || max;
            }
            else if (this._buyInfo.buyItemID == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
                maxNum = this._buyInfo.stepNum * haveCoin;
                maxNum = Math.min(maxNum, max);
            }
            else {
                max = Math.min(haveCoin, max);
                maxNum = Math.min(maxNum, max);
            }
            this._buyInfo.maxCanBuyNum = _.clamp(maxNum, this._buyInfo.stepNum, max);
            this._buyInfo.maxCanBuyNum = this.calMaxByLimit(this._buyInfo.maxCanBuyNum);
        }

        private onClose() {
            this._buyInfo.cancelFun?.call(this._buyInfo.caller);
            clientCore.DialogMgr.ins.close(this);
        }

        private onSure() {
            let needNum = parseInt(this.txtTotalPrice.text);
            //需要检查
            if (this._buyInfo.needCheck) {
                if (this._buyInfo.tokenID != clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID && Number(this.txtBuyNum.text) > this._buyInfo.maxCanBuyNum) {
                    alert.showSmall("超过购买上限");
                    return;
                }
                let haveNum = clientCore.ItemsInfo.getItemNum(this._buyInfo.tokenID);
                if (haveNum < needNum) {
                    if (this._buyInfo.tokenID == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) { //是灵豆就提示是否切换到储值
                        alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                    } else {
                        alert.showFWords('物品不足');
                    }
                    return;
                }
            }
            //神叶超过2000，弹提示 
            if (this._buyInfo.tokenID == clientCore.MoneyManager.LEAF_MONEY_ID && needNum >= 2000) {
                alert.showSmall(`是否确认消耗${needNum}神叶进行本次购买`, { callBack: { caller: this, funArr: [this.completeBuy] } });
                return;
            }

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickQuickBuySureBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.completeBuy();
        }

        private completeBuy() {
            this._buyInfo.sureFun?.call(this._buyInfo.caller, this._buyInfo.buyItemID, parseInt(this.txtBuyNum.text));
            clientCore.DialogMgr.ins.close(this);
        }

        private onChangeNum(change: number) {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickQuickBuyAddBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            let now = parseInt(this.txtBuyNum.text);
            let num = now + change * this._buyInfo.stepNum;
            let max = this.getMaxNum();
            this.txtBuyNum.text = _.clamp(num, this._buyInfo.minNum * this._buyInfo.stepNum, max).toString();
            this.showPrice();
            this.updateNum();
        }

        private updateNum(): void {
            let max = this.getMaxNum();
            let num: number = Number(this.txtBuyNum.text);
            this.mcAdd.disabled = num >= this._buyInfo.maxCanBuyNum;
            this.mcReduce.disabled = num <= this._buyInfo.minNum * this._buyInfo.stepNum;
        }

        // private changeMaxNum() {
        //     let max = this.getMaxNum();
        //     this.txtBuyNum.text = "" + max;
        //     this.showPrice();
        // }

        private showPrice() {
            let num = parseInt(this.txtBuyNum.text);
            if (this._buyInfo.buyItemID == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
                this.txtTotalPrice.changeText("" + num / this._buyInfo.stepNum);
            }
            else {
                this.txtTotalPrice.text = num * this._buyInfo.singlePrice + '';
            }
        }

        private buyMax() {
            let haveCoin = clientCore.ItemsInfo.getItemNum(this._buyInfo.tokenID);
            let maxNum = this._buyInfo.stepNum * Math.floor(haveCoin / this._buyInfo.singlePrice);
            let max = this.getMaxNum();
            if (this._buyInfo.buyItemID == clientCore.MoneyManager.LEAF_MONEY_ID) {
                max = haveCoin || max;
                maxNum = maxNum || max;
            }
            else if (this._buyInfo.buyItemID == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
                maxNum = this._buyInfo.stepNum * haveCoin;
                maxNum = Math.min(maxNum, max);
            }
            else {
                max = Math.min(haveCoin, max);
                maxNum = Math.min(maxNum, max);
            }
            // this.txtBuyNum.text = _.clamp(maxNum, this._buyInfo.stepNum, max).toString();
            let maxCanBuyNum = _.clamp(maxNum, this._buyInfo.stepNum, max);
            //如果去到了上限值 还要根据stepNum计算最终数量
            if (maxCanBuyNum == max) {
                maxCanBuyNum = max - max % this._buyInfo.stepNum;
            }
            //这里判断能拥有最大上限
            this._buyInfo.maxCanBuyNum = this.calMaxByLimit(maxCanBuyNum);
            this.txtBuyNum.text = "" + this._buyInfo.maxCanBuyNum;

            this.showPrice();
            this.updateNum();

        }

        private calMaxByLimit(curBuy: number): number {
            //这里闪耀变身的体力做特殊处理
            //既希望限购 又不能配表 服了
            let limitNum = this._buyInfo.buyItemID == 9900120 ? 100 : clientCore.ItemsInfo.getItemLimitNum(this._buyInfo.buyItemID);

            let haveItemNum = clientCore.ItemsInfo.getItemNum(this._buyInfo.buyItemID);
            let maxCanBuy = limitNum - haveItemNum;
            maxCanBuy = Math.ceil(maxCanBuy / this._buyInfo.stepNum) * this._buyInfo.stepNum;
            if (curBuy > maxCanBuy) {
                curBuy = _.clamp(this._buyInfo.maxCanBuyNum, this._buyInfo.stepNum, maxCanBuy);
            }
            return curBuy;
        }

        private onInputChange() {
            if (this.txtBuyNum.text != "") {
                if (parseInt(this.txtBuyNum.text) < 1) {
                    this.txtBuyNum.text = "";
                }
            }
        }

        private getMaxNum(): number {
            let max = 0;
            if (this._buyInfo.limitNum <= 0) {
                max = this._buyInfo.buyItemID == clientCore.MoneyManager.LEAF_MONEY_ID ? 999999 : 99;
            }
            else {
                max = this._buyInfo.limitNum > 99 ? 99 : this._buyInfo.limitNum;
            }
            return max * this._buyInfo.stepNum;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.mcAdd, Laya.Event.CLICK, this, this.onChangeNum, [1]);
            BC.addEvent(this, this.mcReduce, Laya.Event.CLICK, this, this.onChangeNum, [-1]);
            // BC.addEvent(this, this.mcMax, Laya.Event.CLICK, this, this.changeMaxNum);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.mcMax, Laya.Event.CLICK, this, this.buyMax);
            BC.addEvent(this, this.txtBuyNum, Laya.Event.INPUT, this, this.onInputChange);
            BC.addEvent(this, this.btnPreview, Laya.Event.CLICK, this, this.showDetailReward);
            BC.addEvent(this, this.txtBuyNum, Laya.Event.BLUR, this, this.onBlur);
            BC.addEvent(this, this.txtBuyNum, Laya.Event.FOCUS, this, this.onFocus);
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private showDetailReward() {
            if (!this._rewardDetail) {
                this._rewardDetail = new ui.alert.RewardDetailUI();
                this._rewardDetail.sideClose = true;
                this._rewardDetail.mouseEnabled = false;
                this._person = new clientCore.Person(clientCore.LocalInfo.sex);
                this._rewardDetail.mcBodyCon.addChild(this._person);
                this._person.scale(0.8, 0.8);
            }
            let suitID = xls.get(xls.itemBag).get(this._buyInfo.buyItemID).value;
            let clothIDsArr = clientCore.SuitsInfo.getSuitInfo(suitID).clothes;
            this._person.upByIdArr(clothIDsArr);
            clientCore.DialogMgr.ins.open(this._rewardDetail);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "quickBuy") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }
        private onFocus() {
            this.txtBuyNum.text = "";
        }
        private onBlur(): void {
            let cnt: number = 0;
            if (this.txtBuyNum.text != "") {
                cnt = Number(this.txtBuyNum.text);
            }
            if (cnt < 1) {
                cnt = 1;
                this.txtBuyNum.changeText(cnt.toString());
            }
            let rem: number = cnt % this._buyInfo.stepNum;
            if (rem != 0) {
                cnt += this._buyInfo.stepNum - rem;
                this.txtBuyNum.changeText(cnt.toString());
            }
            if (cnt > this._buyInfo.maxCanBuyNum) {
                cnt = this._buyInfo.maxCanBuyNum;
                this.txtBuyNum.changeText(cnt.toString());
                this.updateNum();
            }
            this.showPrice();
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}