namespace operaDrama {
    export class OperaWaitPanel extends ui.operaDrama.panel.OperaWaitPanelUI {

        show() {
            Laya.timer.loop(500, this, this.onTimer);
            this.onTimer();
        }

        private onTimer() {
            let time = clientCore.OperaManager.timeToOperaStart();
            let timeArr = util.StringUtils.getDateStr2(time).split(':');
            for (let i = 0; i < 3; i++) {
                this['txt_' + i].value = timeArr[i];
            }
            if (time == 0) {
                Laya.timer.clear(this, this.onTimer);
            }
        }

        destroy() {
            Laya.timer.clear(this, this.onTimer);
            super.destroy();
        }
    }
}