namespace operaSide {
    export class OperaPlotPanel extends ui.operaSide.panel.OperaPlotPanelUI {
        private _config: xls.dramaMap;

        show(config: xls.dramaMap) {
            clientCore.DialogMgr.ins.open(this);
            this._config = config;
            this.txtContent.text = config.storyName.split('/')[clientCore.OperaManager.instance.side - 1];
            this.txtCost.text = '消耗：' + config.firstCost[0].v2.toString();
        }

        private onOpen() {
            if (clientCore.ItemsInfo.getItemNum(this._config.firstCost[0].v1) < this._config.firstCost[0].v2) {
                alert.showFWords('道具不足');
                return;
            }
            this.event(Laya.Event.COMPLETE, 'yes');
            clientCore.DialogMgr.ins.close(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
            this.event(Laya.Event.COMPLETE, 'no');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOpen, Laya.Event.CLICK, this, this.onOpen);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._config = null;
        }
    }
}