namespace jumpGame {
    /**
     * 家族规则
     */
    export class JumpRulePanel extends ui.jumpGame.panel.JumpRulelPanelUI {
        constructor() {
            super();
        }
        popupOver() {
            this.rulePanel.vScrollBarSkin = "";
            this.rulePanel.vScrollBar.on(Laya.Event.CHANGE, this, this.change);
        }
        change() {
            let scrollBar = this.rulePanel.vScrollBar;
            this.imgBar.y = 339 * (scrollBar.value / scrollBar.max);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClosePanel);
        }
        onClosePanel() {
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(): void {
            this.rulePanel.off(Laya.Event.CHANGE, this, this.change);
            super.destroy();
        }
    }
}