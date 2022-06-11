namespace catchBattle {
    export class GameReadyPanel extends ui.catchBattle.panel.GameReadyPanelUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        initOver() {
            net.sendAndWait(new pb.cs_pvp_match_user({ flag: 1 }));
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.cancelSearch);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            this.ani1.play(0, true);
        }

        //取消匹配
        private cancelSearch() {
            net.send(new pb.cs_pvp_match_user({ flag: 0 }));
            this.ani1.stop();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
        }

        private showRule() {
            alert.showRuleByID(1239);
        }

        /**请求机器人 */
        private requestBot() {
            net.send(new pb.cs_pvp_game_match_robot());
        }

        destroy() {
            super.destroy();
            this.ani1.stop();
            // Laya.timer.clear(this, this.requestBot);
        }
    }
}