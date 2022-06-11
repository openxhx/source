namespace shop {
    export class BuySuccPanel extends ui.shop.panel.BuySuccPanelUI {
        private _itemId: number;
        constructor() {
            super();
            this.addEventListeners();
        }
        init() {

        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "shopBuySuccPanelShow") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }
        show(id: number) {
            this._itemId = id;
            let type = Math.floor(id / 100000);
            this.mcRewardImg.scale(1, 1);
            if (type == 3) {
                this.mcRewardImg.skin = clientCore.ItemsInfo.getItemUIUrl(id);
            }
            else if (type == 20) {
                //这里是种子ID，需要转换成花的ID
                this.mcRewardImg.skin = pathConfig.getSeedIconPath(clientCore.SeedFlowerRelateConf.getRelateID(id));
            }
            else if (type == 4) {
                this.mcRewardImg.skin = pathConfig.getBuildingPath(id);
            }

        }
        addEventListeners() {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onBackClick);
            BC.addEvent(this, this.btnPut, Laya.Event.CLICK, this, this.onPutClick);
        }
        onPutClick() {
            if (!clientCore.MapInfo.isSelfHome) {
                alert.showSmall("在自己的家园才能种植哦！");
                return;
            }
            this.destroy();
            let type = Math.floor(this._itemId / 100000);
            var info: clientCore.MapItemInfo;
            let showType = 0;
            if (type == 4) {
                info = clientCore.MapItemsInfoManager.instance.getBuildingInfoByID(this._itemId);
                showType = 0;
            }
            else if (type == 20) {
                info = clientCore.MapItemInfo.createMapItemInfoByID(clientCore.SeedFlowerRelateConf.getRelateID(this._itemId));
                showType = 1;
            }
            else if (type == 3) {
                info = clientCore.MapItemInfo.createMapItemInfoByID(this._itemId);
                showType = 2;
            }
            clientCore.MapEditorManager.getInstance().showUI(showType, 'produce');
            clientCore.MapEditorManager.getInstance().showOperateMapItem(info);
            clientCore.DialogMgr.ins.close(this);
            this.event("close_by_put_click");

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickShopPutBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        onBackClick() {
            clientCore.DialogMgr.ins.close(this);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}