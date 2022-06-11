namespace countdownBlessing {
    export class ClockPanel extends ui.countdownBlessing.panel.ClockPanelUI {
        constructor() {
            super();
            this.sideClose = true;
        }
        public showInfo() {
        }

        buy() {
            alert.alertQuickBuy(9900117, 1, true, Laya.Handler.create(this, (reward) => {
                alert.showReward(reward);
                EventManager.event("BLESSING_FREASH_COIN");
            }));
        }

        jump() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("task.TaskModule", 1);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.boxGift, Laya.Event.CLICK, this, this.jump);
            BC.addEvent(this, this.boxLeaf, Laya.Event.CLICK, this, this.buy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}