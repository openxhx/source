namespace cp {
    export class CpChangeRingPanel extends ui.cp.panel.ChangeRingPanelUI {
        private _selectId: number;
        private _ringSk: clientCore.Bone;
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            this.list.dataSource = xls.get(xls.cpRing).getValues();
            this.list.selectedIndex = 0;
            this._selectId = this.list.dataSource[0].id;
            this.btnSure.disabled = this._selectId == clientCore.CpManager.instance.currRingId;
            this.imgScrollBar.visible = this.list.length > 6;
            this.showEffcet();
        }

        private onListRender(cell: ui.cp.render.ChangeRingRenderUI, idx: number) {
            let data = cell.dataSource as xls.cpRing;
            let xlsItem = xls.get(xls.itemBag).get(data.id)
            cell.imgSelect.visible = data.id == this._selectId;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            cell.imgUseing.visible = clientCore.CpManager.instance.currRingId == xlsItem.itemId;
            cell.imgUse.visible = clientCore.ItemsInfo.getItemNum(data.id) > 0;
            cell.txtEffect.text = data.attachDesc;
            cell.imgWeddingRing.visible = data.id == clientCore.CpManager.instance.cpInfo.toolId;
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
                this.showEffcet();
                this.list.startIndex = this.list.startIndex;
                this.btnSure.disabled = this._selectId == clientCore.CpManager.instance.currRingId;
            }
        }

        private showEffcet() {
            if (clientCore.CpManager.checkHaveRingEffect(this._selectId)) {
                this.txtNo.visible = false;
                this._ringSk?.dispose();
                this._ringSk = clientCore.BoneMgr.ins.play(pathConfig.getCpRingSk(this._selectId), 0, true, this);
                this._ringSk.pos(this.txtNo.x, this.txtNo.y);
            }
            else {
                this.txtNo.visible = true;
                this._ringSk?.dispose();
            }
        }

        private onSure() {
            if (clientCore.ItemsInfo.getItemNum(this._selectId) > 0) {
                clientCore.CpManager.instance.changeRing(this._selectId).then(() => {
                    this.event(Laya.Event.CHANGED, this._selectId);
                    this.list.startIndex = this.list.startIndex;
                })
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
            this._ringSk?.dispose();
        }
    }
}