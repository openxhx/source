namespace timeAmbulatory {
    export class TimeCostPanel extends ui.timeAmbulatory.panel.TimeAnniversaryPanelUI {
        private readonly suitId: number = 2110251;
        private _model: TimeAmbulatoryModel;
        private _control: TimeAmbulatoryControl;
        private reward: xls.rechargeActivity[];

        private _engryInfo: pb.sc_taobao_festival_get_energy_cnt;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as TimeAmbulatoryModel;
            this._control = clientCore.CManager.getControl(sign) as TimeAmbulatoryControl;
            this.suit1.visible = clientCore.LocalInfo.sex == 1;
            this.suit2.visible = clientCore.LocalInfo.sex == 2;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.addEventListeners();
        }

        public onShow() {
            // clientCore.Logger.sendLog('2020年11月6日活动', '【付费】淘乐节·银杏誓约', '打开秋影长庚面板');
            this.reward = _.filter(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 9 });
            this.setUI();
            this.visible = true;
        }

        private async setUI() {
            this._engryInfo = await this._control.getEnergyInfo();
            this.labCur.text = "当前:" + this._engryInfo.energyNum;
            this.reward = this.bubbleSort(this.reward);
            this.list.array = this.reward;
        }
        private bubbleSort(arr: Array<xls.rechargeActivity>) {
            let temp: xls.rechargeActivity;
            let tag = true
            for (let j = 0; tag === true; j++) {
                tag = false;
                for (let i = 0; i < arr.length - 1; i++) {
                    if (util.getBit(this._model.costRewardStatus, (arr[i].packageID)) > util.getBit(this._model.costRewardStatus, (arr[i + 1].packageID))) {
                        temp = arr[i]
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            return arr;
        }
        private listRender(item: ui.timeAmbulatory.render.CostRewardItemUI) {
            let data: xls.rechargeActivity = item.dataSource;
            let _index = this.reward.indexOf(data);
            let reward = clientCore.LocalInfo.sex == 1 ? data.rewardFamale : data.rewardMale;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [_index]);
            item.list.repeatX = reward.length;
            item.list.array = reward;
            item.boxCondition.visible = data.cost > this._engryInfo.energyNum;
            item.btnGet.visible = data.cost <= this._engryInfo.energyNum && util.getBit(this._model.costRewardStatus, data.packageID) == 0;
            item.imgGot.visible = util.getBit(this._model.costRewardStatus, data.packageID) == 1;
            if (item.boxCondition.visible) item.labCnt.text = "" + (data.cost - this._engryInfo.energyNum);
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

        public hide() {
            this.visible = false;
        }

        /**领奖 */
        private async getReward(idx: number) {
            let msg = await this._control.getReward(2, this.reward[idx].packageID);
            alert.showReward(msg.item);
            this._model.costRewardStatus = util.setBit(this._model.costRewardStatus, this.reward[idx].packageID, 1);
            this.list.refresh();
            await util.RedPoint.reqRedPointRefresh(22403);
            EventManager.event("TIME_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        /**关闭 */
        private onClose() {
            this.visible = false;
            EventManager.event("TIME_GIFT_CLOSE_CHILD");
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            let per = (522 - 28);
            this.imgProgress.y = per * scroll.value / scroll.max;
        }


        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            BC.removeEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this.removeEventListeners();
            this.reward = this._model = this._control = null;
        }
    }
}