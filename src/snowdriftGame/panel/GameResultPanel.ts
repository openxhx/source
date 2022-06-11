namespace snowdriftGame {
    /**
     * 结算面板
     */
    export class GameResultPanel extends ui.snowdriftGame.panel.GameResultPanelUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        public setResult(result: number, cur: number, max: number) {
            this.imgResult.skin = `snowdriftGame/result${result}.png`;
            this.labCur.text = cur.toString();
            if (max < cur) {
                this.imgNewLevel.visible = true;
                this.labMax.text = cur.toString();
            } else {
                this.imgNewLevel.visible = false;
                this.labMax.text = max.toString();
            }
        }

        public setReward(item: pb.IItem) {
            clientCore.GlobalConfig.setRewardUI(this.rewardItem, { id: 9900278, cnt: item ? item.cnt : 0, showName: false });
        }

        /**退出游戏 */
        private quitGame() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("happinessFlavour.HappinessFlavourModule", "2");
        }

        /**重新开始 */
        private playGame() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("snowdriftGame.FindBattlePanel");
        }

        /**展示奖励 */
        private showTip() {
            clientCore.ToolTip.showTips(this.rewardItem, { id: 9900278 });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.quitGame);
            BC.addEvent(this, this.btnPlay, Laya.Event.CLICK, this, this.playGame);
            BC.addEvent(this, this.rewardItem, Laya.Event.CLICK, this, this.showTip);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}