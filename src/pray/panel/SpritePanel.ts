namespace pray.panel {
    /**
     * 花精灵王信息面板
     */
    export class SpritePanel extends ui.pray.panel.SpriteInfoUI {
        constructor() { super(); }
        private goModId: number;
        show(id: number): void {
            clientCore.DialogMgr.ins.open(this);
            this.updateView(id);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }
        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private updateView(id: number): void {
            let info: xls.itemBag = xls.get(xls.itemBag).get(id);
            if (!info) {
                alert.showFWords("不存在花精灵ID：" + id);
                this.hide();
                return;
            }
            let getWay = info.channelType[0];
            if (getWay.indexOf('.') > -1) {
                this.txGet.text = getWay.split('.')[0];
            }
            this.txName.changeText(info.name);
            this.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
        }

        private onGet(): void {
            this.hide();
            clientCore.ModuleManager.closeModuleByName("pray", "spirittree.SpirittreeModule");
        }
    }
}