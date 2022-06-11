namespace moonCake {
    export class GetFruitsPanel extends ui.moonCake.panel.GetFruitsPanelUI {
        constructor() {
            super();
        }

        public show(value: number, count: number) {
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '打开收集月桂果实面板');
            this.labCount.text = "今日剩余:" + (3 - count) + "/3";
            this.btnPlay.disabled = count >= 3;
            this.imgMask.width = value / 90000 * 550;
            clientCore.DialogMgr.ins.open(this);
            let hotPoint = [20000, 50000, 90000];
            for (let i = 0; i < hotPoint.length; i++) {
                this['imgHua' + (i + 1)].x = hotPoint[i] / _.last(hotPoint) * 550;
            }
        }

        private toPlay() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '收集月桂果实弹出框点击“去游玩”按钮');
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("catchFruitsGame.CatchFruitsGameModule");
        }

        private toWatch() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '收集月桂果实弹出框点击“去观看”按钮');
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ToolTip.gotoMod(168);
        }

        private showRule() {
            alert.showRuleByID(1078);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnPlay, Laya.Event.CLICK, this, this.toPlay);
            BC.addEvent(this, this.btnWatch, Laya.Event.CLICK, this, this.toWatch);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}