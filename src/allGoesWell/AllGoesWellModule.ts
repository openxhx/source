namespace allGoesWell {
    export const ON_POINT_CHANGE: string = "ON_POINT_CHANGE";
    /**
     * 顺心如意
     * allGoesWell.AllGoesWellModule
     */
    export class AllGoesWellModule extends ui.allGoesWell.AllGoesWellModuleUI {
        private model: AllGoesWellModel;
        private control: AllGoesWellControl;
        /**奖励面板 */
        private rewardPanel: RewardPanel;
        /**制作面板 */
        private makePanel: MakePanel;
        /**摆放面板 */
        private setPanel: SetPanel;
        init() {
            this.sign = clientCore.CManager.regSign(new AllGoesWellModel(), new AllGoesWellControl());
            this.model = clientCore.CManager.getModel(this.sign) as AllGoesWellModel;
            this.control = clientCore.CManager.getControl(this.sign) as AllGoesWellControl;
            this.addPreLoad(xls.load(xls.collocationActivity));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(this.control.getEventInfo());
            this.addPreLoad(this.control.getBoxInfo());
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','打开主活动面板');
            clientCore.UIManager.setMoneyIds([this.model.coin, clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.onPointChange(this.model.point);
        }

        /**打开奖励面板 */
        private openRewardPanel() {
            if (!this.rewardPanel) this.rewardPanel = new RewardPanel();
            this.rewardPanel.show(this.model.point);
        }

        /**打开制作面板 */
        private openMakePanel() {
            if (!this.makePanel) this.makePanel = new MakePanel();
            this.makePanel.show();
        }

        /**打开礼盒面板 */
        private openSetPanel() {
            if (this.model.curCnt > 0) {
                alert.showFWords("当前礼盒还没吃完~");
                return;
            }
            if (!this.setPanel) this.setPanel = new SetPanel();
            this.setPanel.sign = this.sign;
            this.setPanel.show();
        }

        /**获得邀请 */
        private async getInvitation() {
            let uid = await this.control.getInvitation();
            if (!uid) {
                alert.showFWords("当前没有可拜访礼盒~");
                return;
            }
            clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','在活动界面打开吃元宵面板');
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeModuleByName("allGoesWell");
            clientCore.ModuleManager.open("eatTangyuan.EatTangyuanModule", uid, { openWhenClose: "allGoesWell.AllGoesWellModule" });
        }

        private onPointChange(curPoint: number) {
            this.labPoint.text = "" + curPoint;
            this.labCount.text = this.model.curCnt + "/9";
        }

        /**帮助说明 */
        private openHelp() {
            alert.showRuleByID(1236);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.openMakePanel);
            BC.addEvent(this, this.btnSet, Laya.Event.CLICK, this, this.openSetPanel);
            BC.addEvent(this, this.btnEat, Laya.Event.CLICK, this, this.getInvitation);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openRewardPanel);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.openHelp);
            EventManager.on(ON_POINT_CHANGE, this, this.onPointChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(ON_POINT_CHANGE, this, this.onPointChange);
        }

        destroy() {
            this.makePanel?.clean();
            this.rewardPanel?.destroy();
            this.setPanel?.clean();
            clientCore.UIManager.releaseCoinBox();
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
    }
}