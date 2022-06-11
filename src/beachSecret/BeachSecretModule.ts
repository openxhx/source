namespace beachSecret {
    /**
     * 沙滩里的秘密
     * beachSecret.BeachSecretModule
     */
    export class BeachSecretModule extends ui.beachSecret.BeachSecretModuleUI {
        private _buyStageID: number = 1100016;
        private _needStageID: number = 1100015;
        private _suitID: number = 2100201;
        private _stagePrice: number = 120;
        private _clothPrice: number = 360;
        constructor() {
            super();
        }
        init() {
            this.imgCloth_1.visible = clientCore.LocalInfo.sex == 1;
            this.imgCloth_2.visible = clientCore.LocalInfo.sex == 2;

            this.fontClothPrice.value = "" + this._clothPrice;
            this.fontStagePrice.value = "" + this._stagePrice;
            this.showStageInfo();
            this.showClothInfo();
            this.imgClothCoin.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
        }

        private showStageInfo() {
            if (clientCore.ItemsInfo.getItemNum(this._buyStageID) > 0) {
                this.boxStageBuy.visible = false;
                this.imgGetStage.visible = true;
                this.btnGo.visible = false;
            }
            else {
                this.imgGetStage.visible = false;
                if (clientCore.ItemsInfo.getItemNum(this._needStageID)) {
                    this.imgCoin.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.LEAF_MONEY_ID);
                    this.btnGo.visible = false;
                }
                else {
                    this.imgCoin.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
                    this.btnGo.visible = true;
                }
            }
        }
        private showClothInfo(){
            let getFlag = clientCore.SuitsInfo.getSuitInfo(this._suitID).allGet;
            this.boxClothBuy.visible = !getFlag;
            this.imgGetCloth.visible = getFlag;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.tryCloth);
            BC.addEvent(this, this.boxStageBuy, Laya.Event.CLICK, this, this.buyStage);
            BC.addEvent(this, this.boxClothBuy, Laya.Event.CLICK, this, this.buyCloth);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.openMainActivity);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
        }
        private showRule() {
            alert.showRuleByID(1027);
            // clientCore.Logger.sendLog('2020年6月24日活动', '【付费】青鸟之舟', '点击活动说明按钮');
        }
        private openMainActivity() {
            clientCore.ToolTip.gotoMod(113);
        }
        private buyStage() {
            let txt = `是否消耗${this._stagePrice}${clientCore.ItemsInfo.getItemNum(this._needStageID) > 0 ? "神叶" : "灵豆"}购买度假沙滩舞台`;
            alert.showSmall(txt, {
                callBack: { caller: this, funArr: [this.sureBuyStage] },
                btnType: alert.Btn_Type.SURE_AND_CANCLE,
                needMask: true,
                clickMaskClose: true,
                needClose: true,
            });
        }
        private sureBuyStage() {
            let needItemID = clientCore.ItemsInfo.getItemNum(this._needStageID) > 0 ? clientCore.MoneyManager.LEAF_MONEY_ID : clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID;
            let haveNum = clientCore.MoneyManager.getNumById(needItemID);
            if (needItemID == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                if (haveNum < this._stagePrice) {
                    alert.showSmall("灵豆数量不足，是否立即充值？", {
                        callBack: { caller: this, funArr: [() => { clientCore.ToolTip.gotoMod(50) }] },
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: true,
                    });
                    return;
                }
                //灵豆买
                this.sendBuyStageCmd();
            }
            else {
                if (haveNum < this._stagePrice) {
                    alert.showSmall("神叶数量不足，是否立即充值？", {
                        callBack: { caller: this, funArr: [() => { alert.alertQuickBuy(clientCore.MoneyManager.LEAF_MONEY_ID, this._stagePrice - haveNum, true); }] },
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: true,
                    });
                    return;
                }
                //神叶买
                this.sendBuyStageCmd();
            }
        }
        private sendBuyStageCmd(){
            net.sendAndWait(new pb.cs_branch_story_buy_suit_and_bg({type:2})).then((data:pb.sc_branch_story_buy_suit_and_bg)=>{
                alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                this.showStageInfo();
            });
        }
        private buyCloth() {
            alert.showSmall(`是否消耗${this._clothPrice}灵豆购买夏日泡泡海套装？`, {
                callBack: { caller: this, funArr: [this.sureBuyCloth] },
                btnType: alert.Btn_Type.SURE_AND_CANCLE,
                needMask: true,
                clickMaskClose: true,
                needClose: true,
            });
        }
        private sureBuyCloth() {
            let spiritBeanNum = clientCore.MoneyManager.getNumById(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (spiritBeanNum < this._clothPrice) {
                alert.showSmall("灵豆数量不足，是否立即充值？", {
                    callBack: { caller: this, funArr: [() => { clientCore.ToolTip.gotoMod(50) }] },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true,
                    needClose: true,
                });
                return;
            }
            net.sendAndWait(new pb.cs_branch_story_buy_suit_and_bg({type:1})).then((data:pb.sc_branch_story_buy_suit_and_bg)=>{
                alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                this.showClothInfo();
            });
        }
        private tryCloth() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._suitID);
        }
        destroy() {
            super.destroy();
        }
    }
}