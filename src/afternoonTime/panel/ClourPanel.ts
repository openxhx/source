namespace afternoonTime {
    /**
     * 11.19
     * 主活动感恩午后时光
     * afternoonTime.ClourPanel
     */
    export class ClourPanel extends ui.afternoonTime.panel.ClourPanelUI {
        constructor() {
            super();
            this.sideClose = true;
        }
        popupOver() {
            clientCore.UIManager.setMoneyIds([9900264, clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }
        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goToGame);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showHelp);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        //帮助说明
        private showHelp() {
            alert.showRuleByID(1218);
        }
        /**参加小游戏 */
        private goToGame() {
            let date = new Date(clientCore.ServerManager.curServerTime * 1000);
            if (date.getHours() < 6) {
                alert.showFWords("不在活动时间内~");
                return;
            }
            let haveBean = clientCore.ItemsInfo.getItemNum(9900001);
            if (haveBean < 2000) {
                alert.showFWords("仙豆不足~");
                return;
            }
            this.destroy();
            clientCore.UIManager.releaseCoinBox();
            clientCore.ModuleManager.open("colourBattleGame.FindBattlePanel");
        }
    }
}