namespace ranch {
    export class RanchGamePanel extends ui.ranch.panel.RanchGameUI {
        private gameTimes: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        public setGameTimes(times: number) {
            this.gameTimes = times;
            this.labTimes.text = `剩余挑战次数:${3 - times}/3`;
            this.btnStart.disabled = times >= 3;
            this.imgUp.gray = clientCore.FlowerPetInfo.petType < 1;
        }

        /**跳转小游戏 */
        private goGame() {
            clientCore.Logger.sendLog('2021年5月14日活动', '【游戏】奶牛工坊', '进入游戏');
            clientCore.ToolTip.gotoMod(265);
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1154);
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.goGame);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.closeClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}