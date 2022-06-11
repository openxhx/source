

namespace familyTailor.item {

    export class TailorItem extends ui.familyTailor.item.TailorItemUI {

        private _colorFilters: Laya.ColorFilter;
        /** 是否开启*/
        public isOpen: boolean;

        constructor() {
            super();

            this._colorFilters = new Laya.ColorFilter();
            this._colorFilters.adjustContrast(-100);
        }

        getIsOpen(array: data.ClothData[]) {
            let info = array[0]
            if (!info || !info.xlsData)
                return false;
            let isOpen = info.type == ShopType.TAILOR ? this.checkTailorOpen(info.xlsData.openRequire) : this.checkTempleOpen(info.xlsData.openRequire);
            return isOpen;
        }

        public setInfo(array: data.ClothData[], index: number): void {
            let info: data.ClothData = array[0];
            if (!info || !info.xlsData)
                return;
            let clothInfo: clientCore.ClothInfo = clientCore.ClothData.getCloth(info.xlsData.clothId);
            this.txCloth.visible = false;
            this.isOpen = info.type == ShopType.TAILOR ? this.checkTailorOpen(info.xlsData.openRequire) : this.checkTempleOpen(info.xlsData.openRequire);
            this.ico.skin = pathConfig.getSuitImg(clothInfo.suitId, clientCore.LocalInfo.sex);
            this.txLock.visible = this.imgLock.visible = !this.isOpen;
            let needShow: boolean = this.isOpen || (index - FamilyTailorModel.ins.unLockIndex) <= 2;
            this.txName.text = needShow ? info.xlsData.name : "？？？";
            this.txName.x = needShow ? 243 : 250;
            this.ico.filters = needShow ? [] : [this._colorFilters];

            let len: number = array.length;
            let count: number = this.getCompleteCount(array);
            this.txProgress.changeText(count + "/" + len);
            this.imgBar.width = 216 * count / len;
            this.boxProess.visible = this.isOpen && count < len;
            this.imgSuc.visible = this.isOpen && count >= len;
            if (this.imgSuc.visible) {
                this.imgSuc.skin = info.type == ShopType.TAILOR ? "familyTailor/wancheng.png" : "familyTailor/yy.png";
            }
            this.imgRed.visible = this.isOpen && _.findIndex(array, (o) => {
                return o.checkCanMake()
            }) > -1;
        }


        /** 检查服装圣殿*/
        private checkTempleOpen(openRequire: xls.pair[]): boolean {
            let len: number = openRequire.length;
            let isOpen: boolean = true;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = openRequire[i];
                if (element.v1 == 2) {
                    let rtn = clientCore.SuitsInfo.getSuitInfo(element.v2);
                    this.txCloth.visible = !rtn.allGet;
                    isOpen = isOpen && rtn.allGet;
                }
                else if (element.v1 == 1) {
                    this.txLock.changeText(`角色达到${element.v2}级后解锁`);
                    let playerLv: number = clientCore.LocalInfo.userLv;
                    isOpen = isOpen && playerLv >= element.v2;
                }
                else if (element.v1 == 3) {
                    this.txLock.changeText(`花灵餐厅${element.v2}级解锁`);
                    isOpen = isOpen && element.v2 <= FamilyTailorModel.ins.restaurantLevel;
                } else if (element.v1 == 4) {
                    if (element.v2 == 10) element.v2 = 11;
                    let name = xls.get(xls.shineTripChapter).get(element.v2)?.name;
                    if (element.v2 == 10 || element.v2 == 11) {
                        name = "感恩夜盛宴";
                    }
                    this.txLock.changeText(`需要通过${name}`);
                    isOpen = isOpen && FamilyTailorModel.ins.checkTwinkleFinish(element.v2);
                }
            }
            return isOpen;
        }

        /** 检查裁缝小铺*/
        private checkTailorOpen(openRequire: xls.pair[]): boolean {
            let lv: number = FamilyTailorModel.ins.tailorLevel;
            let len: number = openRequire.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = openRequire[i];
                if (element.v1 == 1 && element.v2 > lv) {
                    this.txLock.changeText(`裁缝小铺${element.v2}级解锁`);
                    return false;
                }
                if (element.v1 == 2 && element.v2 > clientCore.LocalInfo.userLv) {
                    this.txLock.changeText(`角色达到${element.v2}级后解锁`)
                    return false;
                }
            }
            return true;
        }

        private getCompleteCount(array: data.ClothData[]): number {
            let count: number = 0;
            _.forEach(array, (element: data.ClothData) => {
                clientCore.LocalInfo.checkHaveCloth(element.xlsData.clothId) && count++;
            })
            return count;
        }
    }
}