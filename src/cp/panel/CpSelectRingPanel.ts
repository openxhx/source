namespace cp {
    export class CpSelectRingPanel extends ui.cp.panel.SelectRingPanelUI {
        private _selectId: number;
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.txtHtml.style.width = 1125
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            this.list.dataSource = xls.get(xls.cpRing).getValues();
            this.list.selectedIndex = 0;
            this._selectId = this.list.dataSource[0].id;
            this.btnSure.disabled = this._selectId == 0;
            this.boxScroll.visible = this.list.length > 6;
            this.showSelect();
        }

        private onListRender(cell: ui.cp.render.SelectRingRenderUI, idx: number) {
            let data = cell.dataSource as xls.cpRing;
            let xlsItem = xls.get(xls.itemBag).get(data.id)
            cell.imgSelect.visible = data.id == this._selectId;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            cell.imgHave.visible = clientCore.ItemsInfo.getItemNum(data.id) > 0;
            cell.txtEffect.text = data.attachDesc;
            if (xlsItem) {
                cell.listStar.repeatX = xlsItem.quality;
                cell.txtName.text = xlsItem.name;
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx) as xls.cpRing;
                if (data.id == this._selectId) {
                    this._selectId == 0;
                }
                else {
                    this._selectId = data.id;
                }
                this.list.startIndex = this.list.startIndex;
                this.showSelect();
            }
        }

        private showSelect() {
            this.btnSure.disabled = this._selectId == 0;
            this.imgRing.skin = clientCore.ItemsInfo.getItemIconUrl(this._selectId);
            this.imgEffect.visible = xls.get(xls.cpRing).get(this._selectId)?.notify == 1;
            this.imgLetter.skin = pathConfig.getCpLetterImg(this._selectId);
        }

        private onSure() {
            if (clientCore.ItemsInfo.getItemNum(this._selectId) > 0) {
                this.event(Laya.Event.START, this._selectId);
                clientCore.DialogMgr.ins.close(this);
            }
            else {
                alert.showSmall(`你还没有${clientCore.ItemsInfo.getItemName(this._selectId)},是否前往购买`, {
                    callBack: {
                        caller: this, funArr: [
                            this.gotoShop
                        ]
                    }
                })
            }
        }

        private gotoShop() {
            clientCore.DialogMgr.ins.close(this);
            clientCore.ModuleManager.open('cpShop.CpShopModule');
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
            this.event(Laya.Event.END);
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScrollBar.y = this.boxScroll.y + (this.boxScroll.height - this.imgScrollBar.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}