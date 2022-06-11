namespace playground {
    /**
     * 成就
     */
    export class AchievementPanel extends ui.playground.panel.AchievementPanelUI {
        sideClose: boolean = true;
        constructor() { super(); }
        show(type: number): void {
            for (let i: number = 1; i <= 4; i++) { this['box_' + i].visible = type == i; }
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
    }
}