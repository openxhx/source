
namespace family {
    /**
     * 家族模块
     */
    export class FamilyModule extends ui.family.FamilyModuleUI {
        /** 家族信息面板*/
        private _infoPanel: panel.FamlyInfoPanel;
        /** 家族订单*/
        private _orderPanel: order.FamilyOrder;

        constructor() { super(); }

        init(d: any): void {
            super.init(d);
            this.mouseThrough = true;
            this.addPreLoad(xls.load(xls.familyLimit));
        }
        addEventListeners(): void {
            BC.addEvent(this, EventManager, "close_family_module", this, this.closeByEvent);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private closeByEvent(e: Laya.Event) {
            this._orderPanel = null;
            this._infoPanel = null;
            this.closeMod();
        }
        popupOver() {
            if (this._data.panel == "info") {
                this.openFamilyInfo(this._data.type);
            }
            else if (this._data.panel == "order") {
                this.openOrder();
            }
        }

        /** 打开家族信息*/
        private openFamilyInfo(type: number): void {
            this._infoPanel = this._infoPanel || new panel.FamlyInfoPanel();
            this._infoPanel.show(type);
        }

        /** 打开订单 */
        private async openOrder(): Promise<void> {
            if (!this._orderPanel) {
                await Promise.all([res.load("atlas/familyOrder.atlas"), xls.load(xls.familyOrder)]); //预加载资源 未释放 TODO
                this._orderPanel = new order.FamilyOrder();
            }
            this._orderPanel.show();
        }

        destroy() {
            super.destroy();
            if (this._orderPanel)
                clientCore.DialogMgr.ins.close(this._orderPanel)
            if (this._infoPanel)
                clientCore.DialogMgr.ins.close(this._infoPanel);
        }
    }
}