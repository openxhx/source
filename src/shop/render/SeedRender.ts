namespace shop {
    export class SeedRender extends ui.shop.render.seedRenderUI {

        private _data: ShopItemData;

        constructor() {
            super();
            this.mcPutState.visible = false;
            this.boxLock.visible = false;
        }

        public set dataSource(data: ShopItemData) {
            if (data) {
                this._data = data;
                let flowerID = clientCore.SeedFlowerRelateConf.getRelateID(data.itemId);
                let buildInfo: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(flowerID);
                if (buildInfo) {
                    this.refresh(buildInfo, data);
                } else {
                    console.log("shop表里面配的生产单位的ID在manageBuildingId表中不存在，ID为：" + data.itemId);
                }

            }
        }

        public get id() {
            if (this._data) {
                return this._data.id;;
            }
        }

        private refresh(info: xls.manageBuildingId, data: ShopItemData) {
            this.nameText.text = xls.get(xls.itemBag).get(data.itemId).name;
            switch (info.mapArea) {
                case 1:
                    this.typeText.text = "地面";
                    break
                case 2:
                    this.typeText.text = "水域";
                    break;
                case 3:
                    this.typeText.text = "空中";
                    break;
            }
            for (let i = 0; i < 1; i++) {
                this["mcMoney_" + i].visible = false;
            }
            for (let i = 0; i < data.cost.length; i++) {
                this["mcMoney_" + i].visible = true;
                this["mcMoney_" + i]["mcMoneyImg"].skin = clientCore.ItemsInfo.getItemIconUrl(data.cost[i].v1);
                this["mcMoney_" + i]["mcMoneyImg"].scaleX = this["mcMoney_" + i]["mcMoneyImg"].scaleY = 0.4;
                this["mcMoney_" + i]["txtMoney"].text = data.cost[i].v2;

            }
            this.conditionText.text = data.conditionText;
            this.mcSeedImage.skin = pathConfig.getSeedIconPath(info.buildingId);
            let unlock = ShopDB.parseUnlockInfo(data.unlockInfo[0]);
            if (unlock.length == 0) {
                this.boxLock.visible = false;
                this.boxMain.gray = false;
            }
            else {
                this.txtNum.text = unlock;
                this.boxLock.visible = true;
                this.boxMain.gray = true;
            }
        }

    }
}