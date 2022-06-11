namespace timeAmbulatory {
    export class TimeLetterPanel extends ui.timeAmbulatory.panel.TimeLetterPanelUI {
        private readonly suitId: number = 2110258;
        private config: xls.medalChallenge[];
        private _model: TimeAmbulatoryModel;
        private _control: TimeAmbulatoryControl;
        private _itemArr: ui.timeAmbulatory.render.LetterProgressItemUI[];
        private onAddEvent: boolean = false;
        private _buyPanel: LetterBuyPanel;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as TimeAmbulatoryModel;
            this._control = clientCore.CManager.getControl(sign) as TimeAmbulatoryControl;
            this.addEventListeners();
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.config = _.filter(xls.get(xls.medalChallenge).getValues(), (o) => { return o.eventType == 112 });
            this.panel.vScrollBarSkin = "";
            this._buyPanel = new LetterBuyPanel(sign);
        }
        public onShow() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开光阴之信面板');
            this.setUI();
            if (this._model.letterRed == 0) {
                this._model.letterRed = 1;
                clientCore.MedalManager.setMedal([{ id: MedalConst.TIME_LETTER_FIRST, value: 1 }]);
                EventManager.event("TIME_REFRESH_TAB");
            }
        }

        private setUI() {
            this.txtCurActive.text = "当前:" + this._model.activeValue.toString();
            this.btnActive.mouseEnabled = this._model.medalBuyStatus == 0;
            this.btnActive.fontSkin = this._model.medalBuyStatus == 1 ? "timeAmbulatory/l_p_yjh.png" : "timeAmbulatory/l_p_jhxz.png";
            this.btnActive.fontX = this._model.medalBuyStatus == 1 ? 30 : 17;
            let max = this.config[this.config.length - 1].cost;
            let maxLenth = (this.config.length - 1) * 123;
            this.list.height = this.config.length * 123;
            this.boxActive.height = this.lineBg.height = maxLenth;
            this.line.height = this._model.activeValue / max * maxLenth;
            this.list.array = this.config;
            let idx = -1;
            if (!this._itemArr) this._itemArr = [];
            for (let i: number = 0; i < this.config.length; i++) {
                if (!this._itemArr[i]) {
                    this._itemArr[i] = new ui.timeAmbulatory.render.LetterProgressItemUI();
                    this.boxActive.addChild(this._itemArr[i]);
                    this._itemArr[i].labCount.text = this.config[i].cost.toString();
                    if(this.config[i].id == 22){
                        this._itemArr[i].pos(37.5, maxLenth, true);
                    }else{
                        this._itemArr[i].pos(37.5, this.config[i].cost / max * (maxLenth - 123), true);
                    }
                }
                this._itemArr[i].imgBg.gray = this.config[i].cost > this._model.activeValue;
                let got = util.getBit(this._model.activeRewardStatus, i + 1) == 1 && util.getBit(this._model.activeVIPRewardStatus, i + 1) == 1;
                if (idx == -1 && !got) idx = i;
            }
            idx = _.min([idx, this.config.length - 5]);
            this.panel.vScrollBar.value = idx * 123;
        }

        private listRender(item: ui.timeAmbulatory.render.LetterItemUI, index: number) {
            let data: xls.medalChallenge = item.dataSource;
            item.imgDi.skin = data.id == 22 ? "unpack/timeAmbulatory/di_3.png" : "unpack/timeAmbulatory/di.png";
            item.imgGotFree.visible = util.getBit(this._model.activeRewardStatus, index + 1) == 1;
            item.imgGotCost.visible = util.getBit(this._model.activeVIPRewardStatus, index + 1) == 1;
            item.imgGotExtra.visible = util.getBit(this._model.activeExtraRewardStatus, index + 1) == 1;
            item.imgGot.visible = item.imgGotFree.visible && item.imgGotCost.visible && item.imgGotExtra.visible;
            item.btnGet.visible = !item.imgGot.visible;
            item.btnGet.fontX = item.imgGotFree.visible ? 16 : 40;
            item.btnGet.fontSkin = item.imgGotFree.visible ? "timeAmbulatory/l_p_jxlq.png" : "timeAmbulatory/l_p_get.png";
            item.btnGet.disabled = this._model.activeValue < data.cost || (item.imgGotFree.visible && this._model.medalBuyStatus == 0);
            let rewardCost: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleCredit : data.maleCredit;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [index]);
            item.list.repeatX = rewardCost.length;
            item.list.array = rewardCost;
            let rewardFree: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleFree : data.maleFree;
            clientCore.GlobalConfig.setRewardUI(item.freeReward, { id: rewardFree[0].v1, cnt: rewardFree[0].v2, showName: false });
            let rewardExtra: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleExtra : data.maleExtra;
            clientCore.GlobalConfig.setRewardUI(item.extraReward, { id: rewardExtra[0].v1, cnt: rewardExtra[0].v2, showName: false });
            BC.addEvent(this, item.freeReward, Laya.Event.CLICK, this, this.showRewardInfo, [item.freeReward, rewardFree[0].v1]);
            BC.addEvent(this, item.extraReward, Laya.Event.CLICK, this, this.showRewardInfo, [item.extraReward, rewardExtra[0].v1]);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [index]);
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.medalChallenge = this.config[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.femaleCredit : config.maleCredit)[index];
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
            if (this._model.medalBuyStatus == 1) {
                this._model.activeVIPRewardStatus = util.setBit(this._model.activeVIPRewardStatus, idx + 1, 1);
                this._model.activeExtraRewardStatus = util.setBit(this._model.activeExtraRewardStatus, idx + 1, 1);
            }
            this.list.refresh();
            await util.RedPoint.reqRedPointRefresh(22401);
            EventManager.event("TIME_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }

        /**前往每日任务 */
        private gotoDailyTask() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '点击立即前往按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("task.TaskModule", 1);
        }

        /**激活勋章 */
        private activeMedal() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '点击激活勋章按钮');
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**帮助说明 */
        private showRule() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '点击光阴之信活动说明按钮');
            alert.showRuleByID(1104);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.gotoDailyTask);
            BC.addEvent(this, this.btnActive, Laya.Event.CLICK, this, this.activeMedal);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            EventManager.on("TIME_MEDAL_ACTIVE", this, this.setUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("TIME_MEDAL_ACTIVE", this, this.setUI);
        }

        public destroy() {
            super.destroy();
            if (this._itemArr) {
                for (let i: number = 0; i < this._itemArr.length; i++) {
                    this._itemArr[i].destroy();
                }
            }
            this.removeEventListeners();
            this.config = this._itemArr = this._model = this._control = null;
        }
    }
}