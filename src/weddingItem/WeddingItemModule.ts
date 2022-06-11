namespace weddingItem {

    /**
     * 奇趣道具使用面板
     * weddingItem.WeddingItemModule
     */
    export class WeddingItemModule extends ui.weddingItem.WeddingItemUIUI {
        private _layerMouseState: boolean[];
        init() {
            this.list.hScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse);
            this.list.array = _.filter(xls.get(xls.funnyProp).getValues(), o => clientCore.ItemsInfo.getItemNum(o.id) > 0);
            this.txtNo.visible = this.list.length == 0;
            clientCore.MaskManager.changeAlpha(0.4);
            this.boxUse.visible = false;
            this._layerMouseState = _.map(clientCore.MapManager.curMap['_layerArr'], (layer) => { return (layer as Laya.Sprite).mouseEnabled });
        }

        private listRender(item: ui.weddingItem.render.WeddingItemRenderUI) {
            let data: xls.funnyProp = item.dataSource;
            item.labName.text = clientCore.ItemsInfo.getItemName(data.id);
            item.labNum.text = clientCore.ItemsInfo.getItemNum(data.id).toString();
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            item.list.repeatX = clientCore.ItemsInfo.getItemQuality(data.id);
            item.imgTarget.visible = data.type == 2 || data.type == 3 || data.type == 4 || data.type == 5;
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = this.list.getItem(idx) as xls.funnyProp;
                if (info.type == 1) {
                    clientCore.FunnyToyManager.useFunnyToy(info.id);
                    this.destroy();
                }
                else {
                    this.enterAimingMode(info.id);
                }
            }
        }

        private enterAimingMode(itemId: number) {
            if (itemId == 3200007 && clientCore.MapInfo.type == 6) {
                alert.showFWords('当前场景无法使用该道具！');
                return;
            }
            this.imgUseIcon.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
            this.txtNum.text = clientCore.ItemsInfo.getItemNum(itemId).toString();
            clientCore.FunnyToyManager.setAimItemId(itemId);
            this.changeUIState();
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, () => {
                let num = clientCore.ItemsInfo.getItemNum(itemId);
                this.txtNum.text = num.toString();
                if (num == 0)
                    this.exitAimingMode();
            });
        }

        private exitAimingMode() {
            clientCore.FunnyToyManager.setAimItemId(0);
            this.changeUIState();
            BC.removeEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE);
        }

        private changeUIState() {
            let isAimMode = clientCore.FunnyToyManager.isAimingMode;
            this.boxUse.visible = isAimMode;
            this.boxList.visible = !isAimMode;
            this.list.refresh();
            this.mouseThrough = isAimMode;
            clientCore.LayerManager.uiLayer.visible = !isAimMode;
            clientCore.MaskManager['_maskLayer'].visible = !isAimMode;
            Laya.MouseManager.multiTouchEnabled = isAimMode;
            clientCore.LayerManager.joyLayer.mouseEnabled = clientCore.MapManager.peopleLayer.visible = clientCore.LayerManager.mapLayer.mouseEnabled = isAimMode;
            for (let i = 2; i < this._layerMouseState.length; i++) {
                let layer = clientCore.MapManager.curMap['_layerArr'][i];
                if (layer == clientCore.MapManager.curMap.peopleLayer)
                    continue;
                if (isAimMode) {
                    layer.mouseEnabled = false;
                }
                else {
                    layer.mouseEnabled = this._layerMouseState[i];
                }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.exitAimingMode);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.MaskManager.changeAlpha();
        }

        destroy() {
            super.destroy();
        }
    }
}