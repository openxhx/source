namespace saveFaery {
    /**
     * 拯救小花仙
     * saveFaery.SaveFaeryModule
     */
    export class SaveFaeryModule extends ui.saveFaery.SaveFaeryModuleUI {
        /**当前积分 */
        private curPoint: number;
        /**已战斗次数 */
        private fightCnt: number;
        /**奖励领取位 */
        private rewardFlag: number;
        /**奖励面板 */
        private rewardPanel: RewardPanel;
        private coin: number = 9900297;

        init() {
            this.addPreLoad(xls.load(xls.collocationActivity));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_save_hua_info()).then((msg: pb.sc_save_hua_info) => {
                this.curPoint = msg.courage;
                this.fightCnt = msg.gameTime;
                this.rewardFlag = msg.flag;
            }));

        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年1月21日活动','【主活动】解救小花仙','打开主活动面板');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.HEALTH_ID, this.coin]);
            clientCore.UIManager.showCoinBox();
            this.labCur.text = " " + this.curPoint;
            // this.labTimes.text = (20 - this.fightCnt) + "/20";
            this.labTimes.text = "";
        }

        /**跳转地图打小怪 */
        private jumpMap() {
            clientCore.Logger.sendLog('2022年1月21日活动','【主活动】解救小花仙','点击第一个GO');
            let targetMap = 17;
            let curTime = clientCore.ServerManager.curServerTime;
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-1-28 00:00:00")) {
                targetMap = 14;
            } else if (curTime < util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")) {
                targetMap = 15;
            }
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.MapManager.enterWorldMap(targetMap);
        }

        /**打开奖励面板 */
        private openReward() {
            clientCore.Logger.sendLog('2022年1月21日活动','【主活动】解救小花仙','点击第二个GO');
            if (!this.rewardPanel) {
                this.rewardPanel = new RewardPanel();
                this.rewardPanel.rewardFlag = this.rewardFlag;
            }
            this.rewardPanel.show(this.curPoint);
        }

        /**前往订单 */
        private goOrder() {
            clientCore.Logger.sendLog('2022年1月21日活动','【主活动】解救小花仙','点击第三个GO');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("orderSystem.OrderSystemModule");
        }

        /**前往排行榜 */
        private goRank() {
            clientCore.Logger.sendLog('2022年1月21日活动','【主活动】解救小花仙','点击排行榜');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("onePanda.OnePandaRankModule");
        }

        /**跳转温泉 */
        private goOnsen() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("onsenRyokan.OnsenRyokanModule");
        }

        /**跳转布老虎 */
        private goTiger() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("tigerMagic.TigerMagicModule");
        }

        /**跨天检查奖励时段 */
        private onOverDay() {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime == util.TimeUtil.formatTimeStrToSec("2022-1-28 00:00:00") || curTime == util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")) {
                alert.showFWords("积分刷新，请重新打开活动");
                clientCore.DialogMgr.ins.closeAllDialog();
                clientCore.ModuleManager.closeAllOpenModule();
            }
        }

        //帮助说明
        private showHelp() {
            alert.showRuleByID(1234);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.jumpMap);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openReward);
            BC.addEvent(this, this.btnOrder, Laya.Event.CLICK, this, this.goOrder);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.goRank);
            BC.addEvent(this, this.btnOnsen, Laya.Event.CLICK, this, this.goOnsen);
            BC.addEvent(this, this.btnTiger, Laya.Event.CLICK, this, this.goTiger);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showHelp);
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        destroy() {
            super.destroy();
            this.rewardPanel?.destroy();
            this.rewardPanel = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}