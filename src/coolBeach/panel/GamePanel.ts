namespace coolBeach {
    export class GameRulePanel extends ui.coolBeach.panel.GamePanelUI {
        private judgePanel: JudgePanel;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
        }

        public initUI() {
            this.labCurTimes.text = '' + CoolBeachModel.instance.allJudgeCnt;
            let reward = clientCore.LocalInfo.sex == 1 ? 141123 : 141133;
            this.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward);
        }

        /**领取奖励 */
        private getReward() {
            if (this.imgGot.visible) return;
            this.boxReward.mouseEnabled = false;
            net.sendAndWait(new pb.cs_cool_beach_show_reward({ flag: 3, type: 0 })).then((msg: pb.sc_cool_beach_show_reward) => {
                alert.showReward(msg.item);
                this.imgGot.visible = true;
            }).catch(() => {
                this.boxReward.mouseEnabled = true;
            });
        }

        /**开始游戏 */
        private beginJudge() {
            if (clientCore.CoolBeachImageManager.instance.images.length < 2) {
                alert.showFWords("当前参赛形象不足~");
                return;
            }
            if (CoolBeachModel.instance.judgeTimes == 10 && CoolBeachModel.instance.isGetJudgeBox == 1) {
                alert.showFWords('今日已完成，明天再来~');
                return;
            }
            if (!this.judgePanel) this.judgePanel = new JudgePanel();
            this.judgePanel.initUI();
            clientCore.DialogMgr.ins.open(this.judgePanel, false);
            BC.addOnceEvent(this, this.judgePanel, Laya.Event.CLOSE, this, this.initUI);
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.boxReward, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.beginJudge);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}