namespace schoolTime {
    /**
     * 毕业旧时光
     * 2021.6.25
     * schoolTime.SchoolTimeModule
     */
    export class SchoolTimeModule extends ui.schoolTime.SchoolTimeModuleUI {
        private _model: SchoolTimeModel;
        private _control: SchoolTimeControl;
        private buyPanel: BuyPanel;
        private quizPanel: QuizPanel;
        private rewardPanel: RewardPanel;
        private taskPanel: TaskPanel;

        private waiting: boolean;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new SchoolTimeModel(), new SchoolTimeControl());
            this._control = clientCore.CManager.getControl(this.sign) as SchoolTimeControl;
            this._model = clientCore.CManager.getModel(this.sign) as SchoolTimeModel;
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(xls.load(xls.miniAnswer));
            this.addPreLoad(this._control.getInfo());
            clientCore.TaskManager.getAllTaskInfo();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.labName.text = clientCore.LocalInfo.userInfo.nick;
            this.labUid.text = "" + clientCore.LocalInfo.userInfo.uid;
            this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '打开主活动面板');
            this.setSignInfo();
            this.setCoinInfo();
        }

        private setSignInfo() {
            for (let i = 1; i <= 3; i++) {
                this["imgHeart" + i].skin = i <= this._model.singDays ? "schoolTime/love1.png" : "schoolTime/love0.png";
            }
            this.btnSign.visible = this._model.singDays < 3 && this._model.isSign == 0;
            let reward = clientCore.LocalInfo.sex == 1 ? 114997 : 115006;
            this.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward);
            this.labTip.visible = !this.imgGot.visible;
        }

        private onStudy(idx: number) {
            if (!this._model.checkDayChange()) return;
            switch (idx) {
                case 1://打开园艺面板
                case 2://打开手工面板
                    if (idx == 1) clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击园艺GO按钮');
                    if (idx == 2) clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击手工GO按钮');
                    if (!this.taskPanel) this.taskPanel = new TaskPanel(this.sign);
                    this.taskPanel.setType(idx);
                    clientCore.DialogMgr.ins.open(this.taskPanel, false);
                    break;
                case 3://前往魔法小游戏,参数9
                case 4://前往射击小游戏,参数10
                    if (idx == 3) clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击魔法GO按钮');
                    if (idx == 4) clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击弓术GO按钮');
                    let param = "" + (idx + 6);
                    clientCore.ToolTip.gotoMod(176, param);
                    break;
                case 5://打开答题面板
                    if (this._model.quizCnt >= 5) {
                        alert.showFWords('今日答题已完成');
                        return;
                    }
                    clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击通识GO按钮');
                    if (!this.quizPanel) this.quizPanel = new QuizPanel(this.sign);
                    clientCore.DialogMgr.ins.open(this.quizPanel);
                    break;
                case 6://打开购买面板
                    if (this._model.allCoin >= 500) {
                        alert.showFWords('学分已全部修完');
                        return;
                    }
                    clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击记忆面包GO按钮');
                    if (!this.buyPanel) this.buyPanel = new BuyPanel(this.sign);
                    clientCore.DialogMgr.ins.open(this.buyPanel, false);
                    break;
            }
        }

        /**展示分数 */
        private setCoinInfo() {
            this._model.allCoin = 0;
            let reward = clientCore.LocalInfo.sex == 1 ? [133829, 133830, 133833, 133834, 133832, 133831] : [133837, 133838, 133841, 133842, 133840, 133839];
            for (let i: number = 1; i <= 5; i++) {
                this._model.allCoin += clientCore.ItemsInfo.getItemNum(this._model.baseCoinId + i);
                this["imgOver" + i].visible = clientCore.ItemsInfo.checkHaveItem(reward[i - 1]);
                this.updateCoin(i);
            }
            this.imgOver6.visible = clientCore.ItemsInfo.checkHaveItem(reward[5]);
            this.btnOver6.visible = this._model.allCoin >= 500 && !this.imgOver6.visible;
        }

        private updateCoin(idx: number) {
            let cnt = clientCore.ItemsInfo.getItemNum(this._model.baseCoinId + idx);
            this["btnGo" + idx].visible = this["progress" + idx].visible = cnt < 100;
            this["btnOver" + idx].visible = cnt == 100 && !this["imgOver" + idx].visible;
            if (cnt < 100) {
                this["progress" + idx].labPro.text = cnt + "/100";
                this["progress" + idx].imgMask.width = cnt / 100 * 138;
            }
            this.btnGo6.visible = this._model.allCoin < 500;
            this.labAll.text = this._model.allCoin + "/500";
            this.btnOver6.visible = this._model.allCoin >= 500 && !this.imgOver6.visible;
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(this._model.ruleId);
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._model.suitId);
        }

        /**签到 */
        private async signLogin() {
            clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击签到按钮');
            let msg = await this._control.daySign();
            this._model.isSign = 1;
            this.btnSign.visible = false;
            this._model.singDays = msg.signday;
            this['imgHeart' + msg.signday].skin = "schoolTime/love1.png";
            if (msg.signday == 3) {
                alert.showReward(msg.item);
                this.imgGot.visible = true;
            }
        }

        /**结业 */
        private async studyOver(idx: number) {
            if (this.waiting) return;
            if (idx == 6) clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击毕业按钮');
            this.waiting = true;
            net.sendAndWait(new pb.cs_get_finish_school_graduation_reward({ id: idx - 1 })).then((msg: pb.sc_get_finish_school_graduation_reward) => {
                alert.showReward(msg.item);
                this["btnOver" + idx].visible = false;
                this["imgOver" + idx].visible = true;
                util.RedPoint.reqRedPointRefresh(27900 + idx);
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }

        /**打开奖励面板 */
        private openRewardPanel() {
            clientCore.Logger.sendLog('2021年6月25日活动', '【主活动】毕业旧时光', '点击毕业好礼按钮');
            if (!this.rewardPanel) this.rewardPanel = new RewardPanel();
            clientCore.DialogMgr.ins.open(this.rewardPanel, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnSign, Laya.Event.CLICK, this, this.signLogin);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.openRewardPanel);
            for (let i = 1; i <= 6; i++) {
                BC.addEvent(this, this["btnGo" + i], Laya.Event.CLICK, this, this.onStudy, [i]);
                BC.addEvent(this, this["btnOver" + i], Laya.Event.CLICK, this, this.studyOver, [i]);
            }
            EventManager.on("SCHOOL_TIME_SET_COIN", this, this.updateCoin);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("SCHOOL_TIME_SET_COIN", this, this.updateCoin);
        }

        destroy() {
            super.destroy();
            this.buyPanel?.destroy();
            this.quizPanel?.destroy();
            this.rewardPanel?.destroy();
            this.taskPanel?.destroy();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = this.buyPanel = this.quizPanel = this.rewardPanel = this.taskPanel = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}