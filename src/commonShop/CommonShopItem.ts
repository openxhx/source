

namespace commonShop {
    /**
     * 商品单元
     */
    export class CommonShopItem extends ui.commonShop.CommonShopItemUI {

        /** 商品配表数据*/
        private _singleData: CommonSingleData;
        /** 好吧 这是货架*/
        private _frame: Laya.Image;
        constructor() { super(); }

        public setInfo(info: CommonSingleData): void {
            this._singleData = info;
            if (this._singleData.isLock) {
                this.showLockMessage();
            }
            this.iSellout.visible = false;
            let path: string = clientCore.ItemsInfo.getItemIconUrl(this._singleData.xlsData.cost.v1);
            this.iDiscountPrice.skin = this.iPrice.skin = path;

            this.handlerInfo();

            let needLevel = info.xlsData.privilege;
            this.imgFairyLevel.visible = needLevel > 0;
            if (needLevel > 0) {
                this.imgFairyLevel.skin = "commonShop/fairyLevel_" + needLevel + ".png";
            }
        }

        /** 处理信息*/
        private handlerInfo(): void {
            this.iDiscountPrice.visible = this.boxOpen.visible = !this._singleData.isLock;
            this.iLock.visible = this._singleData.isLock;
            this.txPrice.y = 170;
            this.iPrice.y = 183;
            if (this._singleData.isLock) {
                this.ico.skin = "commonShop/spy.png";
                this.txPrice.changeText("???");
            } else {
                let itemId = this._singleData.xlsData.itemId;
                this.ico.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
                this.iQuality.skin = `commonShop/quality_${clientCore.ItemsInfo.getItemQuality(itemId)}.png`;
                this.txName.changeText(clientCore.ItemsInfo.getItemName(itemId));
                this.writeDiscount();
                this.writeLimit();
            }
        }

        /** 检查商品是否锁定了*/
        private showLockMessage() {
            let len: number = this._singleData.xlsData.openRequire.length;
            let desc: string = "";
            let buildLv = clientCore.FamilyMgr.ins.getBuildLevel(499997);
            let userLv = clientCore.LocalInfo.userLv;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = this._singleData.xlsData.openRequire[i];
                if (element.v1 == 1) { //建筑
                    if (element.v2 >= buildLv) {
                        desc = `商店${element.v2}级上架`;
                        break;
                    }
                }
                if (element.v1 == 2 && element.v2 > userLv) { //人物
                    desc = `玩家${element.v2}级上架`;
                }
            }
            let isLock: boolean = desc != "";
            this.iLock.visible = isLock;
            this.txName.changeText(desc);
        }

        /** 写入折扣*/
        private writeDiscount(): void {
            let hasDiscount: boolean = this._singleData.xlsData.vipDiscount < 1;
            let array: Laya.Sprite[] = [this.iDiscountBG, this.txDiscount, this.iDiscountPrice, this.imgLine, this.txDiscountPrice];
            _.forEach(array, (element: Laya.Sprite) => {
                element && (element.visible = hasDiscount);
            })
            let price: number = this._singleData.xlsData.cost.v2;
            this.txPrice.changeText(Math.floor(price * this._singleData.xlsData.vipDiscount) + "");
            this.txDiscount.changeText(this._singleData.xlsData.vipDiscount * 10 + "");
            if (hasDiscount) {
                this.txDiscountPrice.changeText(price + "");
                this.txPrice.y = 185;
                this.iPrice.y = 198;
            }
        }

        private writeLimit(): void {
            this.iTime.visible = this._singleData.isTimeLimit;
            this.txBG.visible = this.txDesc.visible = this._singleData.isTimeLimit;
            this._singleData.isTimeLimit && this.setTime();
        }
        /**显示限时的剩余时间 */
        public setTime(): void {
            let serverTime: number = clientCore.ServerManager.curServerTime;
            let disTime = this._singleData.endTime - serverTime;
            if (disTime >= 0) {
                let restDay = Math.floor(disTime / 86400);
                if (restDay < 1) {
                    this.txDesc.changeText(util.StringUtils.getDateStr(disTime, ":"));
                }
                else {
                    this.txDesc.changeText("剩余：" + restDay + "天");
                }
            }
        }

        /**
         * 设置限购信息
         * @param count 
         */
        public setLimit(count: number): void {
            if (!this._singleData.isNumLimit) {
                this.iSellout.visible = false;
                return;
            }
            this.iSellout.visible = this._singleData.maxLimitNum <= count;
        }

        public get singleData(): CommonSingleData {
            return this._singleData;
        }

        public showFrame(show: boolean): void {
            if (show) {
                if (!this._frame) {
                    this._frame = new Laya.Image("commonShop/row.png");
                    this._frame.y = 91;
                }
                if (!this._frame.parent) {
                    this.addChildAt(this._frame, 0);
                }
            } else {
                this._frame && this.removeSelf();
            }
        }
    }
}