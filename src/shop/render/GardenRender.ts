namespace shop {
    export class GardenRender extends ui.shop.render.gardenRenderUI {

        private _data: ShopItemData;

        constructor() {
            super();
            this.used.visible = false;
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
            for (let i = 0; i < 1; i++) {
                this["mcMoney_" + i].visible = false;

            }
            for (let i = 0; i < 1; i++) {
                this["mcMoney_" + i].visible = true;
                this["mcMoney_" + i]["mcMoneyImg"].skin = clientCore.ItemsInfo.getItemIconUrl(data.cost[i].v1);
                this["mcMoney_" + i]["mcMoneyImg"].scaleX = this["mcMoney_" + i]["mcMoneyImg"].scaleY = 0.4;
                this["mcMoney_" + i]["txtMoney"].text = data.cost[i].v2;

            }
            if (data.deadline == "") {
                this.time.visible = false;
            } else {
                let time: number = Date.parse(data.deadline?.replace(/\-/g, '/')) - Laya.timer.currTimer;
                time = Math.floor(time / 1000);
                let fir: number;
                let sec: number;
                fir = Math.floor(time / 3600);
                time -= 3600 * fir;
                sec = Math.floor(time / 60);
                this.timeText.text = fir + ":" + sec;
                this.time.visible = true;
            }

            this.numText.text = '已拥有' + clientCore.MapItemsInfoManager.instance.getAllDecorationNumByid(info.buildingId);
            this.mcDecImg.skin = pathConfig.getDecorationBigUI(data.itemId);
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