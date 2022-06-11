namespace ginkgoOath {
    export class GinkgoOathQycgPanel extends ui.ginkgoOath.panel.GinkgoOathQycgPanelUI {
        private readonly suitId: number = 2110170;
        private _model: GinkgoOathModel;
        private _control: GinkgoOathControl;
        private reward: xls.rechargeActivity[];

        private _engryInfo: pb.sc_taobao_festival_get_energy_cnt;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as GinkgoOathModel;
            this._control = clientCore.CManager.getControl(sign) as GinkgoOathControl;
            this.addEventListeners();
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
        }

        public onShow() {
            clientCore.Logger.sendLog('2020年11月6日活动', '【付费】淘乐节·银杏誓约', '打开秋影长庚面板');
            this.reward = _.filter(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 8 });
            this.setUI();
        }

        private async setUI() {
            this._engryInfo = await this._control.getEnergyInfo();
            this.labCur.text = this._engryInfo.energyNum.toString();
            this.reward = this.bubbleSort(this.reward);
            this.list.array = this.reward;
        }
        private bubbleSort(arr: Array<xls.rechargeActivity>) {
            let temp: xls.rechargeActivity;
            let tag = true
            for (let j = 0; tag === true; j++) {
                tag = false;
                for (let i = 0; i < arr.length - 1; i++) {
                    if (util.getBit(this._model.costRewardStatus, arr[i].packageID) > util.getBit(this._model.costRewardStatus, arr[i + 1].packageID)) {
                        temp = arr[i]
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            return arr;
        }
        private listRender(item: ui.anniversary.render.HzlyItemUI) {
            let data: xls.rechargeActivity = item.dataSource;
            let _index = this.reward.indexOf(data);
            let reward = clientCore.LocalInfo.sex == 1 ? data.rewardFamale : data.rewardMale;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [_index]);
            item.list.repeatX = reward.length;
            item.list.array = reward;
            item.labTip.visible = item.btnGet.disabled = data.cost > this._engryInfo.energyNum;
            item.btnGet.visible = util.getBit(this._model.costRewardStatus, data.packageID) == 0;
            item.imgGot.visible = !item.btnGet.visible;
            if (item.labTip.visible) item.labTip.text = `再获得${data.cost - this._engryInfo.energyNum}能量即可领取`;
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
            await util.RedPoint.reqRedPointRefresh(19303);
            EventManager.event("GINKGOOATH_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this.reward = this._model = this._control = null;
        }
    }
}