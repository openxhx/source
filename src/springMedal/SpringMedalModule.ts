namespace springMedal {
    /**
     * 春日勋章、尖叫勋章、芙蓉勋章、中秋勋章、感恩勋章、仙踪勋章、冰雪勋章
     * 2021.7.16
     * springMedal.SpringMedalModule
     */
    export class SpringMedalModule extends ui.springMedal.SpringMedalModuleUI {
        private readonly suitId: number = 2100369;
        private giftArr:number[] = [4005838 , 4005839]
        private config: xls.medalChallenge[];
        private _model: SpringMedalModel;
        private _control: SpringMedalControl;
        private _itemArr: ui.springMedal.render.SpringMedalProgressUI[];
        private _rewardArr: ui.springMedal.render.SpringMedalItemUI[];
        private _buyPanel: MedalBuyPanel;
        private _buyActivePanel: ActiveBuyPanel;
        private curShowType: number = 0;
        private _isAdult: Boolean = false;

        constructor() {
            super();
        }

        init() {
            this.sign = clientCore.CManager.regSign(new SpringMedalModel(), new SpringMedalControl());
            this._model = clientCore.CManager.getModel(this.sign) as SpringMedalModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpringMedalControl;
            this.addPreLoad(this._control.getInfo());
            this.addPreLoad(xls.load(xls.medalChallenge));
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.panel.vScrollBarSkin = "";
            this._isAdult = clientCore.LocalInfo.age >= 18;
            this.tipIcon.skin = this._isAdult ? "springMedal/tipTween1.png" : "springMedal/tipTween0.png";
            this.gift.skin = `springMedal/gift${clientCore.LocalInfo.sex}.png`
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【付费】迷梦勋章', '打开迷情勋章面板');
            this._buyPanel = new MedalBuyPanel(this.sign);
            this._buyActivePanel = new ActiveBuyPanel(this.sign);
            this.config = _.filter(xls.get(xls.medalChallenge).getValues(), (o) => { return o.eventType == 239 });
            this.initUI();
        }

        private initUI() {
            this.labCur.text = "当前活跃值:" + this._model.activeValue;
            this.labBtn.text = this._model.medalBuyStatus == 0 ? '激活勋章' : '购买活跃度';
            if (this._model.medalBuyStatus == 30) {
                this.imgMedal.skin = "springMedal/medal_s.png";
            } else {
                this.imgMedal.skin = "springMedal/medal_b.png";
            }
            let max = this._isAdult ? this.config[this.config.length - 1].adultCost : this.config[this.config.length - 1].teenagerCost;
            let maxLenth = (this.config.length / 2 - 1) * 110;
            this.boxReward.height = this.config.length / 2 * 110;
            this.boxActive.height = this.lineBg.height = maxLenth;
            this.line.height = this._model.activeValue / max * maxLenth;
            let idx = -1;
            if (!this._itemArr) this._itemArr = [];
            if (!this._rewardArr) this._rewardArr = [];
            for (let i: number = 0; i < this.config.length / 2; i++) {
                //进度条
                let cost = this._isAdult ? this.config[i].adultCost : this.config[i].teenagerCost;
                if (!this._itemArr[i]) {
                    this._itemArr[i] = new ui.springMedal.render.SpringMedalProgressUI();
                    this.boxActive.addChild(this._itemArr[i]);
                    this._itemArr[i].labCount.text = cost.toString();
                    this._itemArr[i].pos(37.5, cost / max * maxLenth, true);
                }
                this._itemArr[i].imgBg.skin = this._model.activeValue >= cost ? "springMedal/active1.png" : "springMedal/active2.png";
                let got = util.getBit(this._model.activeRewardStatus, i + 1) == 1 && util.getBit(this._model.activeVIPRewardStatus, i + 1) == 1;
                if (idx == -1 && !got) idx = i;
                //奖励展示
                if (!this._rewardArr[i]) {
                    this._rewardArr[i] = new ui.springMedal.render.SpringMedalItemUI();
                    this.boxReward.addChildAt(this._rewardArr[i], 0);
                    this._rewardArr[i].pos(0, i * 110, true);
                }
                if (i == this.config.length / 2 - 1) this._model.maxActiveValue = cost;
            }
            this.btnBuy.visible = this._model.medalBuyStatus == 0 || this._model.activeValue < this._model.maxActiveValue;
            if (this._model.medalBuyStatus != 0 && this._isAdult == false) {
                this.btnBuy.visible = false;
            }
            this.setRewardType(this._model.medalBuyStatus, true);
            idx = _.min([idx, this.config.length / 2 - 5]);
            this.panel.vScrollBar.value = idx * 110;
            //this.imgChild.visible = !this._isAdult;
        }

        private setRewardType(type: number, force: boolean = false) {
            if (this._model.medalBuyStatus > 0 && !force) return;
            if (this.curShowType == type && !force) return;
            if (type == 0) type = 128;
            this.curShowType = type;
            this.btn30.skin = type == 30 ? 'springMedal/di_xuanzhong.png' : 'springMedal/di_weixuanzhong.png';
            this.btn128.skin = type == 128 ? 'springMedal/di_xuanzhong.png' : 'springMedal/di_weixuanzhong.png';
            for (let i: number = 0; i < this.config.length / 2; i++) {
                this.listRender(i);
            }
        }

        private updateUI() {
            this.labBtn.text = '购买活跃度';
            this.btnBuy.visible = this._model.medalBuyStatus == 0 || this._model.activeValue < this._model.maxActiveValue;
            if (this._model.medalBuyStatus != 0 && this._isAdult == false) {
                this.btnBuy.visible = false;
            }
            if (this._model.medalBuyStatus == 30) this.imgMedal.skin = "springMedal/medal_s.png";
            else this.imgMedal.skin = "springMedal/medal_b.png";
            this.labCur.text = "当前活跃值:" + this._model.activeValue.toString();
            let max = this._isAdult ? this.config[this.config.length - 1].adultCost : this.config[this.config.length - 1].teenagerCost;
            let maxLenth = (this.config.length / 2 - 1) * 110;
            this.line.height = this._model.activeValue / max * maxLenth;
            let medalChange = this.curShowType != this._model.medalBuyStatus;
            if (medalChange) {
                this.setRewardType(this._model.medalBuyStatus, true);
            }
            for (let i: number = 0; i < this.config.length / 2; i++) {
                let cost = this._isAdult ? this.config[i].adultCost : this.config[i].teenagerCost;
                this._itemArr[i].imgBg.skin = this._model.activeValue >= cost ? "springMedal/active1.png" : "springMedal/active2.png";
                if (!medalChange) this.updateReward(i);
            }
        }

        private listRender(index: number) {
            let item = this._rewardArr[index];
            this.updateReward(index);
            let rewardCost: xls.pair[];
            let data: xls.medalChallenge;
            if (this.curShowType == 30) {
                data = this.config[index];
            } else {
                data = this.config[index + this.config.length / 2];
            }
            rewardCost = clientCore.LocalInfo.sex == 1 ? data.femaleCredit : data.maleCredit;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [index]);
            item.list.repeatX = rewardCost.length;
            item.list.array = rewardCost;
            let rewardFree: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleFree : data.maleFree;
            clientCore.GlobalConfig.setRewardUI(item.freeReward, { id: rewardFree[0].v1, cnt: rewardFree[0].v2, showName: false });
            BC.addEvent(this, item.freeReward, Laya.Event.CLICK, this, this.showRewardInfo, [item.freeReward, rewardFree[0].v1]);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [index]);
        }

        private updateReward(index: number) {
            let item = this._rewardArr[index];
            let data: xls.medalChallenge = this.config[index];
            let cost = this._isAdult ? data.adultCost : data.teenagerCost;
            item.imgGotFree.visible = util.getBit(this._model.activeRewardStatus, index + 1) == 1;
            item.imgGotCost.visible = util.getBit(this._model.activeVIPRewardStatus, index + 1) == 1 && this._model.medalBuyStatus == this.curShowType;
            item.imgGot.visible = item.imgGotFree.visible && item.imgGotCost.visible;
            item.btnGet.visible = !item.imgGot.visible;
            item.labBtn.text = item.imgGotFree.visible ? "继续领取" : "领取奖励";
            item.btnGet.disabled = this._model.activeValue < cost || (item.imgGotFree.visible && this._model.medalBuyStatus != this.curShowType);
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.medalChallenge = this.config[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.femaleCredit : config.maleCredit)[index];
                if (reward) {
                    let item = this._rewardArr[idx];
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
            let msg = await this._control.getReward(this.config[idx].id);
            alert.showReward(msg.item);
            this._model.activeRewardStatus = util.setBit(this._model.activeRewardStatus, idx + 1, 1);
            if (this._model.medalBuyStatus > 0) {
                this._model.activeVIPRewardStatus = util.setBit(this._model.activeVIPRewardStatus, idx + 1, 1);
            }
            this.updateReward(idx);
            await util.RedPoint.reqRedPointRefresh(22401);
        }

        /**试穿套装 */
        private trySuit(i:number) {
            if(i==0){
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
            }else{
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.giftArr[clientCore.LocalInfo.sex-1]);
            }
        }

        /**前往每日任务 */
        private gotoDailyTask() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【付费】迷梦勋章', '点击立即前往');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("task.TaskModule", 1);
        }

        /**激活勋章 */
        private activeMedal() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【付费】迷梦勋章', '点击激活勋章');
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**帮助说明 */
        private showRule() {
            if (this._isAdult) {
                alert.showRuleByID(1104);
            } else {
                alert.showRuleByID(1209);
            }
        }

        /**购买活跃值 */
        private buyActive() {
            if (!this._isAdult) {
                alert.showFWords("未成年不可购买活跃度~");
                return;
            }
            //clientCore.Logger.sendLog('2021年7月16日活动', '【付费】芙蓉勋章', '点击购买活跃值按钮');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this._buyActivePanel);
        }

        /**点击购买 */
        private onBuyClick() {
            if (this.labBtn.text == '激活勋章') {
                this.activeMedal();
            } else {
                this.buyActive();
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.trySuit , [0]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.trySuit) , [1];
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.gotoDailyTask);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuyClick);
            BC.addEvent(this, this.btn30, Laya.Event.CLICK, this, this.setRewardType, [30, false]);
            BC.addEvent(this, this.btn128, Laya.Event.CLICK, this, this.setRewardType, [128, false]);
            EventManager.on("SPRING_MEDAL_ACTIVE", this, this.updateUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("SPRING_MEDAL_ACTIVE", this, this.updateUI);
        }

        public destroy() {
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
            if (this._itemArr) {
                for (let i: number = 0; i < this._itemArr.length; i++) {
                    this._itemArr[i].destroy();
                }
            }
            if (this._rewardArr) {
                for (let i: number = 0; i < this._rewardArr.length; i++) {
                    this._rewardArr[i].destroy();
                }
            }
            this._buyPanel.destroy();
            this._buyActivePanel.destroy();
            this._buyActivePanel = this._buyPanel = this._rewardArr = this.config = this._itemArr = this._model = this._control = null;
        }
    }
}