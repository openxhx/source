namespace samsungShop {
    /**
     * 单个商品基础数据
     */
    export class ShopData {
        public xlsData: xls.CommonShopData;
        public isLock: boolean = false;
        public isTimeLimit: boolean;
        public isNumLimit: boolean;
        public startTime: number = 0;
        public endTime: number = 0;
        public maxLimitNum: number = 0;
        public group: number;

        public tag: number;
        public id: number;
        constructor(data: xls.CommonShopData) {
            this.xlsData = data;
            this.tag = data.tag;
            this.id = data.id;
            this.parseData();
        }
        parseData() {
            let len: number = this.xlsData.openRequire.length;
            let buildLv = clientCore.FamilyMgr.ins.getBuildLevel(499997);
            let userLv = clientCore.LocalInfo.userLv;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = this.xlsData.openRequire[i];
                if (element.v1 == 1) { //建筑
                    if (element.v2 > buildLv) {/**0需要换成建筑等级 */
                        this.isLock = true;
                        break;
                    }
                }
                if (element.v1 == 2 && element.v2 > userLv) { //人物
                    this.isLock = true;
                }
            }

            this.isTimeLimit = this.xlsData.timeLimit != "";
            if (this.isTimeLimit) {
                let strArr = this.xlsData.timeLimit.split(";");
                // this.startTime = new Date(strArr[0]).getTime()/1000;
                this.startTime = util.TimeUtil.formatTimeStrToSec(strArr[0]);
                // this.endTime = new Date(strArr[1]).getTime()/1000;
                this.endTime = util.TimeUtil.formatTimeStrToSec(strArr[1]);
            }

            this.isNumLimit = this.xlsData.limitation.v1 > 0;
            this.maxLimitNum = this.xlsData.limitation.v2;
            this.group = this.xlsData.unitNum;
        }
    }
}