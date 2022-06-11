namespace backpack {
    /**
     *  仓库模块2.0
     */
    export class BackpackModule extends ui.backpack.BackpackModuleUI {
        /**
         * backpack.BackpackModule
         */
        /** 道具面板*/
        private _goodsPanel: panel.GoodsPanel;
        /** 售出面板*/
        private _sellPanel: panel.SellPanel;
        /** 升级面板*/
        private _upgradePanel: panel.UpgradePanel;
        /**扩建券不足面板 */
        private _noTicketPanel: panel.NoTicketDialog;

        constructor() { super(); }


        public init(): void {
            this.addPreLoad(xls.load(xls.materialBag));
            this.addPreLoad(xls.load(xls.manageBuildingFormula));
            this.addPreLoad(xls.load(xls.manageBuildingId));

            this.panel.vScrollBarSkin = "";
            this.panel.vScrollBar.elasticBackTime = 200;
            this.panel.vScrollBar.elasticDistance = 300;
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnUpgrade, Laya.Event.CLICK, this, this.onUpgrade);
            BC.addEvent(this, EventManager, globalEvent.BACKPACK_GOODS_CLICK, this, this.onGoodsClick);
            BC.addEvent(this, EventManager, globalEvent.BACKPACK_UPGRADE, this, this.updateNum);
            BC.addEvent(this, EventManager, globalEvent.MATERIAL_CHANGE, this, this.updateView);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onUI);

        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public initOver(): void {
            // 初始化道具显示面板
            this._goodsPanel = new panel.GoodsPanel();
            this._goodsPanel.init(this.panel, 6, 22, 20);
            this.updateView();
        }

        public popupOver(): void {
            clientCore.UIManager.showCoinBox();
        }

        public destroy(): void {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
            this._goodsPanel.dispose();
            this._sellPanel && this._sellPanel.destroy();
            this._noTicketPanel && this._noTicketPanel.destroy();
            this._upgradePanel = this._sellPanel = this._goodsPanel = this._noTicketPanel = null;
        }

        private updateView(): void {
            if (!this._goodsPanel)
                return;
            this._goodsPanel.clear();
            let items: clientCore.MaterialBagInfo[] = clientCore.MaterialBagManager.getAllItems();
            this._goodsPanel.generate(_.filter(items, (element: clientCore.MaterialBagInfo) => {
                return element.goodsInfo.itemNum > 0 && element.xlsInfo.show == 0;
            }));
            this.updateNum();
            this.updateBar();
            this.mcEmpty.visible = items.length < 1;
        }

        private updateNum(): void {
            let _items: clientCore.MaterialBagInfo[] = clientCore.MaterialBagManager.getAllItems();
            let _count: number = 0;
            _.forEach(_items, (element: clientCore.MaterialBagInfo) => {
                if (element.xlsInfo.show == 0) _count += element.goodsInfo.itemNum;
            })
            this.txNum.changeText("容量" + _count + "/" + clientCore.LocalInfo.pkgSize);
            // 检查是否满级
            let isFull: boolean = clientCore.LocalInfo.pkgSize >= 15990;
            this.btnUpgrade.visible = !isFull && clientCore.LocalInfo.userLv >= 8;
            this.txFull.visible = isFull;
        }

        /**
         * 更新滑条
         */
        private updateBar(): void {
            let scrollBar: Laya.ScrollBar = this.panel.vScrollBar;
            this.boxBar.visible = scrollBar.max != 0;
            if (this.boxBar.visible) {
                BC.addEvent(this, scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            } else {
                BC.removeEvent(this, scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            }
        }

        private onScrollChange(): void {
            let scrollBar: Laya.ScrollBar = this.panel.vScrollBar;
            if (scrollBar.max == 0) {
                return;
            }
            this.bar.y = _.clamp(scrollBar.value / scrollBar.max, 0, 1) * 287;
        }

        /**
         * 道具点击事件
         * @param id 
         */
        private onGoodsClick(data: clientCore.MaterialBagInfo): void {
            this._sellPanel = this._sellPanel || new panel.SellPanel();
            this._sellPanel.parent && this._sellPanel.removeSelf();
            if (this._sellPanel.id != data.goodsInfo.itemID) {
                this._sellPanel.setData(data);
                this._sellPanel.pos(this.mouseX, this.mouseY + 22);
                this.addChild(this._sellPanel);
            } else {
                this._sellPanel.setData();
            }
        }

        private onUI(e: Laya.Event): void {
            if (e.target instanceof component.HuaButton || e.target instanceof panel.SellPanel) return;
            this._sellPanel && this._sellPanel.parent && this._sellPanel.hide();
        }

        private onUpgrade(): void {
            if (clientCore.ItemsInfo.getItemNum(1511002) == 0) {
                this._noTicketPanel = this._noTicketPanel || new panel.NoTicketDialog();
                this._noTicketPanel.show();
            }
            else {
                this._upgradePanel = this._upgradePanel || new panel.UpgradePanel();
                this._upgradePanel.show();
            }
        }

    }
}