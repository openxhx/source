namespace paddingImage {
    export class PaddingRulePanel extends ui.paddingImage.panel.PaddingRulePanelUI {

        private goTask() {
            clientCore.Logger.sendLog('2022年4月29日活动', '【主活动】蘑菇总动员', '点击前往日常任务');
            this.closeSelf();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('task.TaskModule', 1);
        }

        private closeSelf() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGoTask, Laya.Event.CLICK, this, this.goTask);
            BC.addEvent(this, this.imgClose, Laya.Event.CLICK, this, this.closeSelf);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}