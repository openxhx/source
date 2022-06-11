namespace clientCore {
    /**
     * 材料不足
     */
    export class MaterialsTip extends ui.commonUI.MaterialTipUI {

        private _handler: Laya.Handler;

        constructor() {
            super();

            this.list.renderHandler = Laya.Handler.create(this, this.itemRender, null, false);
        }

        public show(materials: { id: number, cnt: number }[], handler: Laya.Handler): void {
            this._handler = handler;
            let len: number = materials.length;
            this.list.width = 152 * len + (len - 1) * 20;
            this.list.array = materials;
            let leafCnt: number = 0;
            _.forEach(materials, (element) => { leafCnt += element.cnt * xls.get(xls.materialBag).get(element.id).buy });
            this.txCnt.changeText(leafCnt + "");

            DialogMgr.ins.open(this);
        }

        public hide(): void {
            DialogMgr.ins.close(this);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            this._handler = null;
            super.destroy();
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: { id: number, cnt: number } = this.list.array[index];
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.id);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            item.num.value = util.StringUtils.parseNumFontValue(data.cnt);
            item.txtName.visible = true;
            item.txtName.changeText(clientCore.ItemsInfo.getItemName(data.id));
        }

        private onSure(): void {
            let need = parseInt(this.txCnt.text)
            let have = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            if (need > have) {
                alert.useLeaf(need, null);
            }
            else {
                this._handler?.run();
                this.hide();
            }
        }

        private static _ins: MaterialsTip;
        public static showTips(materials: { id: number, cnt: number }[], handler: Laya.Handler): void {
            this._ins = this._ins || new MaterialsTip();
            this._ins.show(materials, handler);
        }
    }
}