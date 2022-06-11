namespace family.order {
    /**
     * 家族订单
     */
    export class FamilyOrder extends ui.familyOrder.FamilyOrderUI {

        private _array: number[];

        constructor() {
            super();
            this.list.itemRender = OrderItem;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
        }

        show(): void {
            !clientCore.FamilyMgr.ins.orderMap && this.addPreLoad(FamilySCommand.ins.getOrders());
            this._array = [];
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            this._array = null;
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, EventManager, FamilyConstant.UPDATE_ORDER, this, this.updateView);
            BC.addEvent(this, EventManager, globalEvent.SYN_FAMILY_ORDER, this, this.refresh);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            EventManager.event("close_family_module");
        }

        initOver(): void {
            this.updateView();
        }

        private refresh(): void {
            alert.showFWords("订单刷新^_^");
            this.updateView();
        }

        private updateView(): void {
            let xlsData: xls.family = xls.get(xls.family).get(1);
            let ins: clientCore.FamilyMgr = clientCore.FamilyMgr.ins;
            this.txCount.changeText(Math.max(xlsData.orderNum - ins.finishCut, 0) + "");
            this.list.array = ins.orderMap.getValues();
            this.txFinish.visible = this.list.array.length <= 0;
        }

        private listRender(item: OrderItem, index: number): void {
            let info: pb.IfmlOrder = this.list.array[index];
            item.setInfo(info);
            Laya.Tween.clearAll(item);
            if (this._array.indexOf(info.gettime) == -1) { //在缓存中未存在 则添加特效
                this._array.push(info.gettime);
                item.scale(1, 1);
                Laya.Tween.from(item, { scaleX: 0, scaleY: 0 }, 400, Laya.Ease.backInOut);
            }
        }
    }
}