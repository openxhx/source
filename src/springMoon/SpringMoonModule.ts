namespace springMoon {
    /**
     * 仲春之月
     * 2021.4.2
     * springMoon.SpringMoonModule
     */
    export class SpringMoonModule extends ui.springMoon.SpringMoonModuleUI {
        private exchangePanel: ExchangePanel;
        private makePanel: MakeKitePanel;
        private submitPanel: SubmitPanel;

        private submitCnt: number;
        private gameCnt: number;
        private isReward: boolean;

        private loginTimes: number;
        private curStep: number;
        private curType: number;
        private curColor: number;

        private storyFlag: number;
        init() {
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(net.sendAndWait(new pb.cs_mid_feastial_get_info()).then((msg: pb.sc_mid_feastial_get_info) => {
                this.submitCnt = msg.todaySumbitNum;
                this.isReward = msg.todaySumbitRewardFlag == 1;
                this.gameCnt = msg.todayGameTimes;
                this.loginTimes = msg.activeTimes;
                this.curStep = msg.step;
                this.curType = msg.type;
                this.curColor = msg.colorType;
            }));
            this.addPreLoad(this.getBuyMedal());
        }

        /**获取勋章情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal([MedalConst.SPRING_MOON_OPEN]);
            this.storyFlag = totalInfo[0].value;
            return Promise.resolve();
        }

        /**播放剧情 */
        private onRecall() {
            // clientCore.Logger.sendLog('2020年5月29日活动', '【主活动】与摩卡的一天', '点击剧情回顾')
            clientCore.AnimateMovieManager.showAnimateMovie(80515, null, null);
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '打开活动面板');
            if (this.storyFlag == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalConst.SPRING_MOON_OPEN, value: 1 }]);
                this.onRecall();
            }
            this.makePanel = new MakeKitePanel();
            this.exchangePanel = new ExchangePanel();
            this.submitPanel = new SubmitPanel();
            this.submitPanel.submitCnt = this.submitCnt;
            this.submitPanel.isReward = this.isReward;
            this.makePanel.initView(this.loginTimes, this.curStep, this.curType, this.curColor);
            this.labGameCnt.text = "" + (3 - this.gameCnt);
        }

        /**制作纸鸢 */
        private makeKite() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '点击绘纸鸢前往');
            this.makePanel.show();
        }

        /**兑换奖励 */
        private exchangeRwd() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '点击换奖励前往');
            this.exchangePanel.show();
        }

        /**小游戏 */
        private playGame() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '点击竖鸡蛋前往');
            if (this.gameCnt >= 3) {
                alert.showFWords("明天再来~");
                return;
            }
            this.destroy();
            clientCore.ModuleManager.open("gameKeepEgg.GameKeepEggModule");
        }

        /**提交材料 */
        private submitMtr() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '点击攒柳枝前往');
            this.submitPanel.show();
        }

        /**帮助说明 */
        private showRule() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '点击活动规则按钮');
            alert.showRuleByID(1146);
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110305);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submitMtr);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.exchangeRwd);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.playGame);
            BC.addEvent(this, this.btnDrawKite, Laya.Event.CLICK, this, this.makeKite);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '点击关闭按钮');
            this.makePanel = this.exchangePanel = this.submitPanel = null;
            super.destroy();
        }
    }
}