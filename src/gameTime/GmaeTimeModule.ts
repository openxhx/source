namespace gameTime {
    /**
     * 六一游园
     * gameTime.GameTimeModule
     * 2021.5.28
     */
    export class GameTimeModule extends ui.gameTime.GameTimeModuleUI {

        private readonly SUIT_ID: number = 2110385;
        private readonly MONEY_ID: number = 9900171;

        private _info: pb.sc_park_time_panel;
        private _buyPanel: GameTimeBuyPanel;
        init() {
            this.imgReward.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.LocalInfo.sex == 1 ? 135700 : 135709);
            this.addPreLoad(net.sendAndWait(new pb.cs_park_time_panel()).then((data: pb.sc_park_time_panel) => {
                this._info = data;
            }))
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventExchange));
            clientCore.UIManager.setMoneyIds([this.MONEY_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GAME_TIME_FIRST, value: 1 }]);
            this.initView();
            this.updateView();
            this.setDrawInfo();
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '打开活动面板');
        }

        private initView() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            let limit = clientCore.FlowerPetInfo.petType >= 1 ? 40 : 30;
            this.labGot.text = this._info.getItemCnt + "/" + limit;
            this.labTime.text = util.TimeUtil.getEventShowStr(xls.get(xls.eventControl).get(153).eventTimeShow);
        }

        private updateView() {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.SUIT_ID);
            this.labSuit.text = suitInfo.hasCnt + "/" + suitInfo.clothes.length;
        }

        private setDrawInfo() {
            this.labCall.text = this._info.drawTimes + "/50";
            this.btnGet.visible = this._info.drawTimes >= 50 && this._info.getRewardFlag == 0;
            this.boxGet.visible = this._info.getRewardFlag == 0;
            this.imgGot.visible = this._info.getRewardFlag == 1;
        }

        /**奖励总览 */
        private async preReward() {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 240);
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '打开奖励预览弹窗');
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.MONEY_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**购买礼包 */
        private onToBuy() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '打开购买奖券弹窗');
            this._buyPanel = this._buyPanel || new GameTimeBuyPanel();
            this._buyPanel.show(this._info.hasBuy);
        }

        private onTry() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '点击套装试穿');
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.SUIT_ID);
        }

        private onGetClick() {
            if (this._loading) return; //等待中
            this._loading = true;
            net.sendAndWait(new pb.cs_park_time_get_extra_reward()).then((msg: pb.sc_park_time_get_extra_reward) => {
                alert.showReward(msg.items);
                this._info.getRewardFlag = 1;
                this.boxGet.visible = false;
                this.imgGot.visible = true;
                this._loading = false;
                util.RedPoint.reqRedPointRefresh(23001);
            }).catch(() => {
                this._loading = false;
            })
        }

        /**帮助说明 */
        private onRule() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '点击规则说明');
            alert.showRuleByID(1126);
        }

        /**跳转游乐园 */
        private goGamePark() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '点击前往游乐园');
            clientCore.ToolTip.gotoMod(176);
        }
        private _loading: boolean = false;
        private _lastTime: number = 0;
        /**抽奖 */
        private callClick(num: number) {
            if (this._loading) return; //等待中
            if (!clientCore.GuideMainManager.instance.isGuideAction) {/**非新手情况，判断物品是否足够 */
                let itemNum = clientCore.ItemsInfo.getItemNum(this.MONEY_ID);
                if (itemNum < num) {
                    // alert.alertQuickBuy(9900128, num - itemNum, true);
                    alert.showFWords(clientCore.ItemsInfo.getItemName(this.MONEY_ID) + "不足~");
                    return;
                }
            }
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 240, times: num })).then((data: pb.sc_common_activity_draw) => {
                    let arr: xls.pair[] = [];
                    for (let i: number = 0; i < data.item.length; i++) {
                        let reward = parseReward(data.item[i]).reward
                        arr.push({ v1: reward.id, v2: reward.num });
                    }
                    alert.showReward(arr);
                    this._info.drawTimes += data.times;
                    this.setDrawInfo();
                    this.updateView();
                    this._loading = false;
                    util.RedPoint.reqRedPointRefresh(23002);
                }).catch(() => {
                    this._loading = false;
                })
            }
        }

        private onRewardClick() {
            clientCore.ToolTip.showTips(this.imgReward, { id: clientCore.LocalInfo.sex == 1 ? 135700 : 135709});
        }

        private openPreview() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【活跃活动】六一游园会', '打开每日礼盒弹窗');
            clientCore.ModuleManager.open('dailyReward.DailyRewardModule');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goGamePark);
            BC.addEvent(this, this.btnCall1, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCall5, Laya.Event.CLICK, this, this.callClick, [5]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onToBuy);
            BC.addEvent(this, this.btnAll, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGetClick);
            BC.addEvent(this, this.imgReward, Laya.Event.CLICK, this, this.onRewardClick);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.openPreview);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
            this._buyPanel?.destroy();
        }
    }
}