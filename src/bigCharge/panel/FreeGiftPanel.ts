namespace bigCharge {
    export class FreeGiftPanel extends ui.bigCharge.panel.FreeGiftPanelUI {
        private readonly suitId: number = 2100311;
        private reward: xls.rechargeActivity[];

        private _engryCnt: number;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.addEventListeners();
        }

        show() {
            clientCore.Logger.sendLog('2021年7月2日活动', '【付费】暑假大充', '打开夏日回馈面板');
            this.reward = _.filter(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 9 });
            this.setUI();
            this.visible = true;
        }

        hide() {
            this.removeSelf();
        }

        private setUI() {
            this._engryCnt = BigChargeModel.instance.costAllCnt;
            this.labCur.text = "当前:" + this._engryCnt;
            this.reward = this.bubbleSort(this.reward);
            this.list.array = this.reward;
        }
        private bubbleSort(arr: Array<xls.rechargeActivity>) {
            let temp: xls.rechargeActivity;
            let tag = true
            for (let j = 0; tag === true; j++) {
                tag = false;
                for (let i = 0; i < arr.length - 1; i++) {
                    let reward = clientCore.LocalInfo.sex == 1 ? arr[i].rewardFamale[0].v1 : arr[i].rewardMale[0].v1;
                    let reward1 = clientCore.LocalInfo.sex == 1 ? arr[i + 1].rewardFamale[0].v1 : arr[i + 1].rewardMale[0].v1;
                    if (clientCore.ItemsInfo.getItemNum(reward) > clientCore.ItemsInfo.getItemNum(reward1)) {
                        temp = arr[i];
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            return arr;
        }
        private listRender(item: ui.bigCharge.render.FreeGiftItemUI) {
            let data: xls.rechargeActivity = item.dataSource;
            let _index = this.reward.indexOf(data);
            let reward = clientCore.LocalInfo.sex == 1 ? data.rewardFamale : data.rewardMale;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [_index]);
            item.list.repeatX = reward.length;
            item.list.array = reward;
            item.boxCondition.visible = data.cost > this._engryCnt;
            item.imgGet.visible = clientCore.ItemsInfo.checkHaveItem(reward[1].v1);
            item.btnGet.visible = data.cost <= this._engryCnt && !item.imgGet.visible;
            if (item.boxCondition.visible) item.labNum.text = "" + (data.cost - this._engryCnt);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [_index]);
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.rechargeActivity = this.reward[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale)[index];
                if (reward) {
                    let item = _.find(this.list.cells, (o) => { return o.dataSource == config });
                    clientCore.ToolTip.showTips((item as any).list.cells[index], { id: reward.v1 });
                    return;
                };
            }
        }

        private setReward(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        /**领取赠品 */
        private getReward(idx: number) {
            net.sendAndWait(new pb.cs_summer_recharge_get_pay_reward({ stage: 1, index: this.reward[idx].packageID })).then(async (msg: pb.sc_summer_recharge_get_pay_reward) => {
                alert.showReward(msg.items);
                this.list.refresh();
                // await util.RedPoint.reqRedPointRefresh(26201);
                // EventManager.event("SUMMER_DREAM_REFRESH_TAB");
            })
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            let per = (496 - 28);
            this.imgPro.y = per * scroll.value / scroll.max;
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1194);
        }

        /**打开夏日抽奖 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.coinDraw);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            BC.removeEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this.removeEventListeners();
            this.reward = null;
        }

    }
}