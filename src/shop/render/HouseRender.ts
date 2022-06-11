namespace shop {
    export class HouseRender extends ui.shop.render.houseRenderUI {

        private _data: ShopItemData;

        constructor() {
            super();
            this.boxLock.visible = false;
        }

        public set dataSource(data: ShopItemData) {
            if (data) {
                this._data = data;
                let infoList: xls.manageBuildingId[] = xls.get(xls.manageBuildingId).getValues();
                for (let i: number = 0; i < infoList.length; i++) {
                    if (infoList[i].buildingId == data.itemId) {
                        this.refresh(infoList[i], data);
                        break;
                    }
                }
            }
        }

        public get id() {
            if (this._data) {
                return this._data.id;;
            }
        }

        private refresh(info: xls.manageBuildingId, data: ShopItemData) {
            this.nameText.text = info.name;
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
            for (let i = 0; i < 1; i++) {
                this["mcMoney_" + i].visible = true;
                this["mcMoney_" + i]["mcMoneyImg"].skin = clientCore.ItemsInfo.getItemIconUrl(data.cost[i].v1);
                this["mcMoney_" + i]["mcMoneyImg"].scaleX = this["mcMoney_" + i]["mcMoneyImg"].scaleY = 0.4;
                this["mcMoney_" + i]["txtMoney"].text = data.cost[i].v2;

            }
            this.conditionText.text = data.conditionText;
            this.mcHouseImg.skin = pathConfig.getBuildingPath(data.itemId, 1);
            this.mcHouseImg.scaleX = this.mcHouseImg.scaleY = 0.56;
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

            // this.mcHaveState.visible = clientCore.MapItemsInfoManager.instance.checkHasSomeById(info.buildingId);
        }

    }
}