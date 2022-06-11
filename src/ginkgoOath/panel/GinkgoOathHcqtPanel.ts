namespace ginkgoOath {
    export class GinkgoOathHcqtPanel extends ui.ginkgoOath.panel.GinkgoOathHcqtPanelUI {
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _suitPanel: DrawSuitShopPanel;
        private readonly drawCoinId: number = 1511012;
        private _oneCost: number;
        constructor() {
            super();
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.imgCloth.skin = `unpack/ginkgoOath/suit_hcqt_${clientCore.LocalInfo.sex}.png`;
            this.addEventListeners();
        }

        public onShow() {
            clientCore.Logger.sendLog('2020年11月27日活动', '【付费】淘乐节·银杏誓约', '打开寒蝉秋潭活动面板');
            clientCore.UIManager.setMoneyIds([this.drawCoinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this._oneCost = xls.get(xls.giftSell).get(8).oneLottery[0].v2;
            this.txTen.text = "" + this._oneCost * 10;
            this.txOne.text = "" + this._oneCost;
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**奖励总览 */
        private async preReward(type: number) {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", type);
            // clientCore.Logger.sendLog('2020年11月27日活动', '【付费】淘乐节·银杏誓约', '点击奖励总览按钮');
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.drawCoinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 13);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(this.drawCoinId);
            let cost = num * this._oneCost;
            if (itemNum < cost) {
                alert.showSmall("淘乐球不足，是否要购买？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            alert.alertQuickBuy(this.drawCoinId, cost - itemNum, true);
                        }]
                    }
                })
                return;
            }
            this._loading = true;
            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 8, times: num })).then((data: pb.sc_common_activity_draw) => {
                if (num == 1) {
                    this.getOne(data.item[0]);
                }
                else {
                    this.getAll(data.item);
                }
            }).catch(() => {
                this._loading = false;
            })
        }
        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            }
            else {
                clientCore.DialogMgr.ins.open(this._onePanel, false);
                this._onePanel.showReward(rwdInfo);
            }
            this._loading = false;
        }

        private getAll(treeInfos: pb.IdrawReward[]) {
            clientCore.DialogMgr.ins.open(this._tenPanel, false);
            this._tenPanel.showReward(treeInfos, this, this.waitOnePanelClose);
            this._loading = false;
        }

        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._onePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }
        //#endregion

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1110);
        }

        /**打开商店 */
        private openShop(type: 1 | 2) {
            if (!this._suitPanel) this._suitPanel = new DrawSuitShopPanel();
            this._suitPanel.show(type);
            clientCore.DialogMgr.ins.open(this._suitPanel, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnShowRewardDetail, Laya.Event.CLICK, this, this.preReward, [8]);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.openShop, [1]);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.openShop, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
            this._onePanel?.destroy();
            this._tenPanel?.destroy();
            this._suitPanel?.destroy();
            this._onePanel = this._tenPanel = this._suitPanel = null;
        }
    }
}