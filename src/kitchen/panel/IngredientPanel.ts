namespace kitchen {
    export class IngredientPanel extends ui.kitchen.panel.IngredientPanelUI {
        public _curIngredient: number[];
        private _canUseIngredient: number[];
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listSelect);
        }

        init() {
            this._curIngredient = [];
            this._canUseIngredient = [];
            this.list.hScrollBarSkin = "";
        }

        show() {
            let xlsCofig = xls.get(xls.diningBase).get(1).addProbability;
            let today = new Date(clientCore.ServerManager.curServerTime * 1000).getDay();
            if (today == 0) today = 6;
            else today--;
            this._canUseIngredient = [];
            for (let i: number = 1; i <= 3; i++) {
                this._canUseIngredient.push(xlsCofig[today]["v" + i]);
                this["target" + i].skin = clientCore.ItemsInfo.getItemIconUrl(xlsCofig[today]["v" + i]);
                this["target" + i].dataSource = xlsCofig[today]["v" + i];
            }
            for (let j: number = 1; j < 4; j++) {
                if (!this._curIngredient[j - 1]) {
                    this["item" + j].skin = "";
                    this["bg" + j].skin = "kitchen/imgAdd1.png";
                } else {
                    this["item" + j].skin = clientCore.ItemsInfo.getItemIconUrl(this._curIngredient[j - 1]);
                    this["bg" + j].skin = "kitchen/bg_ingredient.png";
                }
            }
            this._canUseIngredient.sort((a: number, b: number) => { return clientCore.ItemsInfo.getItemNum(b) - clientCore.ItemsInfo.getItemNum(a) });
            this.list.array = this._canUseIngredient;
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.kitchen.render.KitchenMaterialRenderUI) {
            let id = item.dataSource;
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.num.value = clientCore.ItemsInfo.getItemNum(id).toString();
            item.imgYes.visible = this._curIngredient?.includes(id);
        }

        private listSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = this.list.getCell(index).dataSource;
                if (clientCore.ItemsInfo.getItemNum(id) == 0) {
                    clientCore.ToolTip.showTips(this.list.getCell(index), { id: id });
                } else {
                    this.addIngredient(this.list.getCell(index).dataSource);
                }
            }
        }

        /**添加研制的辅料 */
        private addIngredient(id: number) {
            if (clientCore.ItemsInfo.getItemNum(id) == 0) {
                alert.showFWords("当前背包中没有该种食材");
                return;
            }
            if (!this._curIngredient) this._curIngredient = [];
            let idx = this._curIngredient.indexOf(id);
            if (idx >= 0) {
                this.onIconClick(idx + 1);
                return;
            }
            if (this._canUseIngredient.indexOf(id) < 0) {
                alert.showFWords("今天不需要该材料~");
                return;
            }
            let pos = this._curIngredient.indexOf(0);
            if (pos < 0) pos = this._curIngredient.length;
            if (pos >= 3) return;
            this._curIngredient[pos] = id;
            this["item" + (pos + 1)].skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this["bg" + (pos + 1)].skin = "kitchen/bg_ingredient.png";
            this.list.refresh();
        }

        private onIconClick(idx: number) {
            if (!this._curIngredient || !this._curIngredient[idx - 1]) {
                alert.showFWords("请点击列表中的材料进行添加~");
                return;
            }
            /**取消添加的辅料 */
            this._curIngredient[idx - 1] = 0;
            this["item" + idx].skin = "";
            this["bg" + idx].skin = "kitchen/imgAdd1.png";
            this.list.refresh();
        }

        private showTargetInfo(idx: number) {
            clientCore.ToolTip.showTips(this["target" + idx], { id: this["target" + idx].dataSource });
        }

        public onCreatBack() {
            this._curIngredient = [];
            for (let j: number = 1; j < 4; j++) {
                this["item" + j].skin = "";
                this["bg" + j].skin = "kitchen/imgAdd1.png";
            }
        }

        private closeClick() {
            EventManager.event("CHECK_INGREDIENT");
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            for (let i: number = 1; i < 4; i++) {
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.onIconClick, [i]);
            }
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["target" + i], Laya.Event.CLICK, this, this.showTargetInfo, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}