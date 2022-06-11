namespace halloween {
    export class HalloweenModule extends ui.halloween.HalloweenModuleUI {
        private suitId: number = 2100254;
        private buyId: number = 2315;

        private _rewardPanel: HalloweenRewardPanel;
        constructor() {
            super();
        }

        init() {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.godTree));
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年10月30日活动', '【付费】糖果万圣节', '打开糖果万圣节活动面板');
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.setUI();
        }

        private setUI() {
            let isGot = clientCore.SuitsInfo.getSuitInfo(this.suitId).allGet;
            this.btnBuyAll.disabled = this.btnBuyOne.disabled = isGot;
        }

        private _loading: boolean = false;
        /**购买单个 */
        private buyOne() {
            if (this._loading) return; //等待中
            let num = 30;
            let itemNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (itemNum < num) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall(`确定花费${num}灵豆购买南瓜糖果送给库库鲁吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 203, times: 1 })).then((data: pb.sc_common_activity_draw) => {
                            let itemInfo = parseReward(data.item[0]);
                            if (!this._rewardPanel) this._rewardPanel = new HalloweenRewardPanel();
                            this._rewardPanel.show(itemInfo.reward.id);
                            this.visible = false;
                            this._rewardPanel.once(Laya.Event.CLOSE, this, () => {
                                this.visible = true;
                            })
                            this.setUI();
                            this._loading = false;
                        }).catch(() => {
                            this._loading = false;
                        })
                    }]
                }
            })
        }

        /**购买全套 */
        private buyAll() {
            if (this._loading) return; //等待中
            let data = xls.get(xls.eventExchange).get(this.buyId);
            let has = clientCore.ItemsInfo.getItemNum(data.cost[0].v1);
            let cost = data.cost[0].v2;
            if (cost > has) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall(`确定花费${cost}${clientCore.ItemsInfo.getItemName(data.cost[0].v1)}购买多彩南瓜糖果送给库库鲁吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_exchange({ exchangeId: this.buyId, activityId: 91 })).then(async (data: pb.sc_common_exchange) => {
                            let arr: pb.IItem[] = [];
                            for (let j: number = 0; j < data.item.length; j++) {
                                if (data.item[j].id == this.suitId) {
                                    let cloths = clientCore.SuitsInfo.getSuitInfo(this.suitId).clothes;
                                    for (let i: number = 0; i < cloths.length; i++) {
                                        let item = new pb.Item();
                                        item.id = cloths[i];
                                        item.cnt = 1;
                                        arr.push(item);
                                    }
                                } else {
                                    arr.push(data.item[j]);
                                }
                            }
                            alert.showReward(arr);
                            this.setUI();
                            this._loading = false;
                        }).catch(() => {
                            this._loading = false;
                        })
                    }]
                }
            })
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1102);
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }

        /**糖果信息 */
        private onCandyClick(idx: number) {
            let candys = [9900094, 9900095];
            clientCore.ToolTip.showTips(this["imgCandy" + idx], { id: candys[idx - 1] });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuyOne, Laya.Event.CLICK, this, this.buyOne);
            BC.addEvent(this, this.btnBuyAll, Laya.Event.CLICK, this, this.buyAll);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.imgCandy1, Laya.Event.CLICK, this, this.onCandyClick, [1]);
            BC.addEvent(this, this.imgCandy2, Laya.Event.CLICK, this, this.onCandyClick, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._rewardPanel?.destroy();
            this._rewardPanel = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}