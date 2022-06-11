namespace summerDream {
    export class ActGiftPanel extends ui.summerDream.panel.SDActGift1UI implements BasePanel {
        private readonly suitId: number = 2110366;
        private _control: SummerDreamControl;
        private reward: xls.rechargeActivity[];

        private _engryCnt: number;
        private _rewardFlag: number;
        constructor(sign: number) {
            super();
            this._control = clientCore.CManager.getControl(sign) as SummerDreamControl;
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.addEventListeners();
        }

        show() {
            clientCore.Logger.sendLog('2021年4月30日活动', '【付费】夏夜如梦', '打开休闲一夏面板');
            this.reward = _.filter(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 9 });
            this.setUI();
            this.visible = true;
        }

        hide() {
            this.visible = false;
        }

        private closeClick() {
            EventManager.event("SUMMER_DREAM_CLOSE_ACTIVITY");
            this.hide();
        }

        private async setUI() {
            let engryInfo = await this._control.getEnergyInfo();
            this._engryCnt = engryInfo.costCnt;
            this._rewardFlag = engryInfo.rewardFlag;
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
                    if (util.getBit(this._rewardFlag, (arr[i].packageID)) > util.getBit(this._rewardFlag, (arr[i + 1].packageID))) {
                        temp = arr[i]
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            return arr;
        }
        private listRender(item: ui.summerDream.item.ActGiftItemUI) {
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
            item.btnGet.visible = data.cost <= this._engryCnt && util.getBit(this._rewardFlag, data.packageID) == 0;
            item.imgGet.visible = util.getBit(this._rewardFlag, data.packageID) == 1;
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

        /**领奖 */
        private async getReward(idx: number) {
            let msg = await this._control.getReward(this.reward[idx].packageID);
            alert.showReward(msg.items);
            this._rewardFlag = util.setBit(this._rewardFlag, this.reward[idx].packageID, 1);
            this.list.refresh();
            await util.RedPoint.reqRedPointRefresh(26201);
            EventManager.event("SUMMER_DREAM_REFRESH_TAB");
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
            alert.showRuleByID(1163);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            BC.removeEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this.removeEventListeners();
            this.reward = this._control = null;
        }

    }
}