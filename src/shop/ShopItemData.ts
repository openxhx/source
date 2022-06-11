namespace shop {
    export class ShopItemData {

        private _config: xls.shop;

        constructor(config: xls.shop, data?: any) {
            this._config = config;
        }

        public get itemId(): number {
            return this._config.itemId;
        }

        public get cost(): xls.pair[] {
            return this._config.sell;
        }

        public get deadline(): string {
            return '';
        }

        public get id(): number {
            return this._config.id;
        }

        public get unlockInfo() {
            return this._config.unlockConditions;
        }

        public get conditionText(): string {
            let returnStr: string = "";
            if (this._config.unlockConditions.length) {
                for (let i: number = 0; i < this._config.unlockConditions.length; i++) {
                    if (i > 0) {
                        returnStr += "且";
                    }
                    switch (this._config.unlockConditions[i].v1) {
                        case 0:
                            returnStr += "等级高于" + this._config.unlockConditions[i].v2;
                            break;
                        case 1:
                            // let config: adventure.ChapterBaseDB = new adventure.ChapterBaseDB(xls.get(xls.chapterBase));
                            // let data: xls.chapterBase = config.getChapterById(this._config.unlockConditions[i].v2);
                            // returnStr += "完成" + data.name;
                            break;
                        case 2:
                            returnStr += "精灵神树等级高于" + this._config.unlockConditions[i].v2;
                            break;
                    }
                }
            } else {
                returnStr = "无限制条件";
            }
            return returnStr;
        }
    }
}