namespace sellStore {
    export class SuitPanel implements ISellStorePanel {
        private _mainUI: ui.sellStore.panel.SuitPanelUI;
        private _parent: SellStoreModule;
        private _tab: number;
        private _tabControl: SellTabControl;
        init(parent: SellStoreModule) {
            this._mainUI = new ui.sellStore.panel.SuitPanelUI();
            this._parent = parent;
            this._parent.addChild(this._mainUI);
            this._mainUI.list.hScrollBarSkin = '';
            this._mainUI.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this._mainUI.list.mouseHandler = new Laya.Handler(this, this.onListSelect);
            let hash = this.createTab();
            this._tabControl = new SellTabControl(this._mainUI.boxTabCon, hash, TAB_SUITS[0], UI_NAME_DIC, new Laya.Handler(this, this.onTabClick));
            //suit的type和服装的type有些值是一样的,导致SellStoreConst.ts中getSuffixImg有点问题，这里强行处理下tab的后缀图片
            this._tab = TAB_SUITS[0];
            this.showList();
            EventManager.on(SellStoreEvent.EV_NEED_REFRESH_LIST, this, this.showList);
        }

        private createTab() {
            let hash = new util.HashMap<number[] | number>()
            for (const key of TAB_SUITS) {
                hash.add(key, key);
            }
            return hash;
        }

        private showList() {
            this._mainUI.list.dataSource = SellStoreModel.instance.getSuitByTag(this._tab);
        }

        private onTabClick(idx: number) {
            this._tab = idx;
            this.showList();
        }

        private onListRender(cell: ui.sellStore.render.SuitRenderUI, idx: number) {
            let info = cell.dataSource as (xls.clothStore & ISuitExInfo);
            cell.img.skin = pathConfig.getSuitImg(info.clothId, clientCore.LocalInfo.sex);
            cell.txtName.text = info.name;
            cell.imgHave.visible = info.have;
            cell.imgTime.visible = info.onTimeSell;
            //目前只有2种代币
            for (let i = 0; i < 2; i++) {
                this.setPriceUI(i, info, cell);
            }
        }

        /**
        * 设定clothrender
        * @param idx：第几种代币
        */
        private setPriceUI(idx: number, data: xls.clothStore, ui: ui.sellStore.render.SuitRenderUI) {
            if (data.cost.length > idx) {
                ui['txtOriPrice_' + idx].visible = true;
                let oriPrice = data.cost[idx].v2;
                let disscountPrice = SellStoreModel.instance.calcuFinalPriceById(data.clothId)[idx].v2;
                let haveDisscount = oriPrice != disscountPrice;
                ui['txtOriPrice_' + idx].text = oriPrice.toString();
                ui['txtPrice_' + idx].text = disscountPrice.toString();
                ui['imgDiscount_' + idx].visible = ui['txtOriPrice_' + idx].visible = haveDisscount;
            }
            else {
                ui['txtOriPrice_' + idx].visible = false;
                ui['imgDiscount_' + idx].visible = false;
                ui['txtPrice_' + idx].text = '0';
            }
        }

        private onListSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnCheck') {
                SellStoreModel.instance.selectSuit = this._mainUI.list.getItem(idx).clothId;
                EventManager.event(SellStoreEvent.EV_DETAIL_PANEL, true);
            }
        }

        show(d: any) {
            this._parent.addChild(this._mainUI);
        }

        hide() {
            this._parent.removeChild(this._mainUI);
        }

        destory() {
            EventManager.off(SellStoreEvent.EV_NEED_REFRESH_LIST, this, this.showList);
        }
    }
}