namespace family.order {
    /**
     * 神叶完成订单
     */
    export class ReplePanel extends ui.familyOrder.ReplePanelUI {

        private _getTime: number;
        private _cost: number;

        constructor() {
            super();
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
        }

        show(getTime: number, array: { id: number, num: number }[]): void {
            clientCore.DialogMgr.ins.open(this);
            this._getTime = getTime;
            this.list.width = 69 + (array.length - 1) * 89;
            this.list.array = array;
            this._cost = 0;
            _.forEach(array, (element: { id: number, num: number }) => {
                this._cost += xls.get(xls.materialBag).get(element.id).buy * element.num;
            })
            this.txCost.changeText("x" + this._cost);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnCom, Laya.Event.CLICK, this, this.goComplete);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private listRender(item: Laya.Box, index: number): void {
            let info: { id: number, num: number } = this.list.array[index];
            this.node(item, "ico").skin = clientCore.ItemsInfo.getItemIconUrl(info.id);
            this.node(item, "num").changeText(info.num + "");
            this.node(item, "name").changeText(clientCore.ItemsInfo.getItemName(info.id));
        }

        private node(parent: Laya.Box, name: string): any {
            return parent.getChildByName(name);
        }

        /** 前往完成*/
        private goComplete(): void {
            alert.useLeaf(this._cost, Laya.Handler.create(this, () => {
                FamilySCommand.ins.leafOrder(this._getTime);
                this.hide();
            }))
        }
    }
}