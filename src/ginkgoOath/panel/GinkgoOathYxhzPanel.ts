namespace ginkgoOath {
    export class GinkgoOathYxhzPanel extends ui.ginkgoOath.panel.GinkgoOathYxhzPanelUI {
        private readonly suitId: number = 2100253;
        private config: xls.medalChallenge[];
        private _model: GinkgoOathModel;
        private _control: GinkgoOathControl;
        private _itemArr: ui.ginkgoOath.render.YxhzProgressItemUI[];
        private onAddEvent: boolean = false;
        private _buyPanel: YxhzBuyPanel;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as GinkgoOathModel;
            this._control = clientCore.CManager.getControl(sign) as GinkgoOathControl;
            this.addEventListeners();
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.config = _.filter(xls.get(xls.medalChallenge).getValues(), (o) => { return o.eventType == 92 });
            this.panel.vScrollBarSkin = "";
            this._buyPanel = new YxhzBuyPanel(sign);
        }
        public onShow() {
            clientCore.Logger.sendLog('2020年11月6日活动', '【付费】淘乐节·银杏誓约', '打开银杏徽章面板');
            this.setUI();
        }

        private setUI() {
            this.txtCurActive.text = "当前:" + this._model.activeValue.toString();
            this.btnActive.mouseEnabled = this._model.medalBuyStatus == 0;
            this.btnActive.fontSkin = this._model.medalBuyStatus == 1 ? "ginkgoOath/l_p_yjh.png" : "ginkgoOath/l_p_jhxz.png";
            this.btnActive.fontX = this._model.medalBuyStatus == 1 ? 30 : 17;
            let max = this.config[this.config.length - 1].cost;
            let maxLenth = (this.config.length - 1) * 123;
            this.list.height = this.config.length * 123;
            this.boxActive.height = this.lineBg.height = maxLenth;
            this.line.height = this._model.activeValue / max * maxLenth;
            this.list.array = this.config;
            let idx = 0;
            if (!this._itemArr) this._itemArr = [];
            for (let i: number = 0; i < this.config.length; i++) {
                if (!this._itemArr[i]) {
                    this._itemArr[i] = new ui.ginkgoOath.render.YxhzProgressItemUI();
                    this.boxActive.addChild(this._itemArr[i]);
                    this._itemArr[i].pos(37.5, this.config[i].cost / max * maxLenth, true);
                    this._itemArr[i].labCount.text = this.config[i].cost.toString();
                }
                this._itemArr[i].imgBg.gray = this.config[i].cost > this._model.activeValue;
                let got = util.getBit(this._model.activeRewardStatus, i + 1) == 1 && util.getBit(this._model.activeVIPRewardStatus, i + 1) == 1;
                if (idx == 0 && !got) idx = i;
            }
            idx = _.min([idx, this.config.length - 5]);
            this.panel.vScrollBar.value = idx * 123;
        }

        private listRender(item: ui.ginkgoOath.render.YxhzItemUI, index: number) {
            let data: xls.medalChallenge = item.dataSource;
            item.imgGotFree.visible = util.getBit(this._model.activeRewardStatus, index + 1) == 1;
            item.imgGotCost.visible = util.getBit(this._model.activeVIPRewardStatus, index + 1) == 1;
            item.imgGot.visible = item.imgGotFree.visible && item.imgGotCost.visible;
            item.btnGet.visible = !item.imgGot.visible;
            item.btnGet.fontX = item.imgGotFree.visible ? 16 : 40;
            item.btnGet.fontSkin = item.imgGotFree.visible ? "ginkgoOath/l_p_jxlq.png" : "ginkgoOath/l_p_get.png";
            item.btnGet.disabled = this._model.activeValue < data.cost || (item.imgGotFree.visible && this._model.medalBuyStatus == 0);
            let rewardCost: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleCredit : data.maleCredit;
            clientCore.GlobalConfig.setRewardUI(item.costReward1, { id: rewardCost[0].v1, cnt: rewardCost[0].v2, showName: false, lock: this._model.medalBuyStatus == 0 });
            clientCore.GlobalConfig.setRewardUI(item.costReward2, { id: rewardCost[1].v1, cnt: rewardCost[1].v2, showName: false, lock: this._model.medalBuyStatus == 0 });
            if (!this.onAddEvent) {
                let rewardFree: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleFree : data.maleFree;
                clientCore.GlobalConfig.setRewardUI(item.freeReward, { id: rewardFree[0].v1, cnt: rewardFree[0].v2, showName: false });
                BC.addEvent(this, item.freeReward, Laya.Event.CLICK, this, this.showRewardInfo, [item.freeReward, rewardFree[0].v1]);
                BC.addEvent(this, item.costReward1, Laya.Event.CLICK, this, this.showRewardInfo, [item.costReward1, rewardCost[0].v1]);
                BC.addEvent(this, item.costReward2, Laya.Event.CLICK, this, this.showRewardInfo, [item.costReward2, rewardCost[1].v1]);
                BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [index]);
            }
            if (index == this.config.length - 1) {
                this.onAddEvent = true;
            }
        }

        private showRewardInfo(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        public hide() {
            this.visible = false;
        }

        /**领奖 */
        private async getReward(idx: number) {
            let msg = await this._control.getReward(1, this.config[idx].id);
            alert.showReward(msg.item);
            this._model.activeRewardStatus = util.setBit(this._model.activeRewardStatus, idx + 1, 1);
            if (this._model.medalBuyStatus == 1) this._model.activeVIPRewardStatus = util.setBit(this._model.activeVIPRewardStatus, idx + 1, 1);
            this.list.refresh();
            await util.RedPoint.reqRedPointRefresh(19302);
            EventManager.event("GINKGOOATH_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }

        /**前往每日任务 */
        private gotoDailyTask() {
            clientCore.Logger.sendLog('2020年11月6日活动', '【付费】淘乐节·银杏誓约', '点击银杏徽章立即前往按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("task.TaskModule", 1);
        }

        /**激活勋章 */
        private activeMedal() {
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1104);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.gotoDailyTask);
            BC.addEvent(this, this.btnActive, Laya.Event.CLICK, this, this.activeMedal);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            EventManager.on("GINKGOOATH_MEDAL_ACTIVE", this, this.setUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("GINKGOOATH_MEDAL_ACTIVE", this, this.setUI);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._model = this._control = null;
        }
    }
}