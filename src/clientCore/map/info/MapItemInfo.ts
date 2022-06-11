namespace clientCore {
    /**
     * 地图建筑，花种，装饰等信息
     */
    export class MapItemInfo {
        private static _uniqueGetTime: number = 10000;
        public static MAX_UNIQUE_GET_TIME: number = 100000000;
        public static FLOWER_MAX_STAGE: number = 4;
        public buildInfo: pb.IBuild;
        public id: number;
        public getTime: number;
        public name: string;
        public level: number;

        public putState: number;//摆放状态，0仓库  1地图
        public mapPosRow: number;
        public mapPosCol: number;
        public _oriBlockPosArr: xls.pair[];//原始占格子信息
        public _reverseBlockPosArr: xls.pair[];
        public canReverse: boolean;//能否翻转
        public isReverse: boolean = false;//是否翻转
        public _reverseOffserPos: xls.position;
        public _offsetPos: xls.position;//图片的便宜位置
        public putType: number;//建筑摆放位置类型  陆海空
        /**类型，1建筑  2种子   3装饰*/
        public type: number;

        public captions: string;//建筑说明
        public upgradeType: number = 0;//建设升级类型,对应建设升级表里面的类型
        public produceFormulaID: number = 0;//建筑对应的生产配方ID
        public changeLevelArr: number[];//建筑外观改变所需要的等级

        //生产相关 这些数据后台给
        public produceRestTime: number = 0;//生产完需要的时间
        public produceTotalNum: number = 0;
        public produceCompleteNum: number = 0;

        public produceOneNeedTime: number = 0;

        //managerBuildingFormula表里面数据
        public produceOutPutItemID: number;
        public produceNeedItemArr: xls.pair[];//生产当前产品所需要的物品

        public flowerGrowNum: number = 0;//花朵种植次数
        public flowerBeginTime: number = 0;//开始生产时间 浇水跟施肥完成才会开始
        public flowerWeedAppearStage: number = 0;//杂草出现阶段 2-4 依次 发芽 花苞 微开 盛开
        public flowerNeedWater: number = 0; // 需要浇水 1是 0否
        public flowerNeedFertilizer: number = 0; // 需要施肥 1是 0否
        public flowerCurStage: number = 1;//默认初始1级
        public flowerGrowMaxNum: number;
        // public flow
        public vipLevel: number = 0;
        public tecSpeed: number = 0;

        public donateNum: number;
        public lockState: number;//1 解锁

        constructor() {

        }
        public initItemInfo() {
            this.id = this.buildInfo.buildId;
            this.getTime = this.buildInfo.getTime;
            this.putState = this.buildInfo.whereIs;
            this.mapPosRow = this.buildInfo.pos.x;
            this.mapPosCol = this.buildInfo.pos.y;

            this.initExcelTableData();
            this.updateMapBuildOrSeedInfo();
        }

        public initExcelTableData() {
            //manageBuildingId表里面的数据，读取出来
            let tmpBuildInfo = xls.get(xls.manageBuildingId).get(this.id);
            this._oriBlockPosArr = tmpBuildInfo.blockPosArr;
            this.canReverse = tmpBuildInfo.reverseFlag == 1;
            this.initReverseBlockInfo();
            this._reverseOffserPos = tmpBuildInfo.reverseOffsetPos;
            this._offsetPos = tmpBuildInfo.offsetPos;
            this.name = tmpBuildInfo.name;
            this.putType = tmpBuildInfo.mapArea;
            this.type = tmpBuildInfo.type;
            this.captions = tmpBuildInfo.captions;
            this.upgradeType = tmpBuildInfo.buildingType;
            this.produceFormulaID = tmpBuildInfo.unlock1Formula;
            this.changeLevelArr = tmpBuildInfo.imageLevel;
            if (this.type < 3) {
                //managerBuildingFormula表里面数据
                let formulaInfo = xls.get(xls.manageBuildingFormula).get(this.produceFormulaID);
                this.produceOutPutItemID = formulaInfo.outputItem;
                this.produceNeedItemArr = formulaInfo.material;
            }
        }
        public get blockPosArr(): xls.pair[] {
            return this.isReverse ? this._reverseBlockPosArr : this._oriBlockPosArr;
        }
        public get offsetPos(): xls.position {
            return this.isReverse ? this._reverseOffserPos : this._offsetPos;
        }
        private initReverseBlockInfo() {
            this._reverseBlockPosArr = [];
            for (let i = 0; i < this._oriBlockPosArr.length; i++) {
                this._reverseBlockPosArr.push({ v1: this._oriBlockPosArr[i].v1, v2: -this._oriBlockPosArr[i].v2 });
            }
        }

        /**这个接口应该是前端自己定时更新用，可能是每秒更新一下 */
        public updateProduceInfo() {
            if (this.type == 1) {
                this.calProduceInfo();
            }
            else if (this.type == 2) {
                this.calFlowerInfo();
            }
        }
        /**
         * 这个接口再建筑状态改变的时候用,可能是后台更新的时候，前端一起更新
         * @param info 
         */
        public refreshItemInfo(info: pb.IBuild) {
            this.buildInfo = info;
            this.putState = this.buildInfo.whereIs;
            this.mapPosRow = this.buildInfo.pos.x;
            this.mapPosCol = this.buildInfo.pos.y;
            if (this.buildInfo.attrs.hAttrs) {
                this.isReverse = this.buildInfo.attrs.hAttrs.isReverse == 1;
            }
            else if (this.buildInfo.attrs.fAttrs) {
                this.isReverse = this.buildInfo.attrs.fAttrs.isReverse == 1;
            }
            this.updateMapBuildOrSeedInfo();
        }
        /**
         * 把最新的生产信息或者花朵成长信息更新到info里
         */
        private updateMapBuildOrSeedInfo() {
            //类型为1是小屋，小屋才有生产的这些属性
            if (this.type == 1) {
                this.produceTotalNum = this.buildInfo.attrs.hAttrs.total;
                this.produceOneNeedTime = this.buildInfo.attrs.hAttrs.oneTime;
                this.level = this.buildInfo.attrs.hAttrs.level;
                this.calProduceInfo();
            }
            else if (this.type == 2) {
                this.flowerGrowNum = this.buildInfo.attrs.sAttrs.exp;
                this.flowerBeginTime = this.buildInfo.attrs.sAttrs.beginTime;
                this.flowerWeedAppearStage = this.buildInfo.attrs.sAttrs.weedStages;
                this.flowerNeedWater = this.buildInfo.attrs.sAttrs.needWater;
                this.flowerNeedFertilizer = this.buildInfo.attrs.sAttrs.needFertillzer;
                this.flowerGrowMaxNum = FlowerGrowConf.getFlowerMaxGrowNum(this.id, this.flowerGrowNum);
                this.vipLevel = LocalInfo.parseVipInfoByExp(this.buildInfo.attrs.sAttrs.vipExp).lv;
                this.tecSpeed = this.buildInfo.attrs.sAttrs.subTree;
                this.calFlowerInfo();
            }
            else if (this.type == 5) {
                this.donateNum = this.buildInfo.attrs.fAttrs.donate;
                this.lockState = this.buildInfo.attrs.fAttrs.locked;
            }
            else if (this.type == 3) {
                this.isReverse = this.buildInfo.attrs.hAttrs.isReverse == 1;
            }
            else if (this.type == 6) {
                this.isReverse = this.buildInfo.attrs.fAttrs.isReverse == 1;
            }
        }
        /**
         * 花朵生长过程，效率提升的百分比，需要按阶段算，然后取下限
         */
        private calFlowerInfo() {
            if (this.flowerBeginTime > 0) {
                let timeInfo = this.calFlowerGrowTimeInfo();
                this.flowerCurStage = timeInfo.growStage;
            }
        }
        private getFlowerSpeedUpPersent(): number {
            let privilegeArr = xls.get(xls.vipLevel).get(this.vipLevel).privilege;
            for (let i = 0; i < privilegeArr.length; i++) {
                if (privilegeArr[i].v1 == 9) {
                    return privilegeArr[i].v2;
                }
            }
            return 0;
        }
        public getFlowerGrowTimeInfo(): { totalTime: number, restTime: number } {
            if (this.flowerBeginTime == 0) {
                return { totalTime: 0, restTime: 1000000000 };
            }
            let timeInfo = this.calFlowerGrowTimeInfo();
            return { totalTime: timeInfo.totalTime, restTime: timeInfo.restTime };
        }
        /**
         *  计算花朵的生长时间，以及花朵所处的生长阶段
         */
        private calFlowerGrowTimeInfo(): { totalTime: number, restTime: number, growStage: number } {
            let disTime = Math.floor(ServerManager.curServerTime - this.flowerBeginTime);
            let growTimeArr = xls.get(xls.flowerPlant).get(this.id).growUp;
            let speedUpPercent = FlowerGrowConf.getSpeedUpEfficiency(this.id, this.flowerGrowNum);
            let vipSpeedUp = 0;
            if (this.vipLevel > 0) {/**花宝特权带来的种植加速 */
                vipSpeedUp = this.getFlowerSpeedUpPersent();
            }
            let totalTime = 0;
            let curStage = 1;
            let tmpDisTime = disTime;
            for (let i = 0; i < growTimeArr.length; i++) {
                let stageUseTime = Math.floor(growTimeArr[i] * (1 - speedUpPercent / 100 - vipSpeedUp / 100 - this.tecSpeed / 100));
                // stageUseTime = Math.ceil(stageUseTime * (1-clientCore.ScienceTreeManager.ins.increment(7)/100)); //科技树影响的向上取整
                totalTime += stageUseTime;
                if (disTime >= stageUseTime) {
                    curStage++;
                    disTime -= stageUseTime;
                }
            }
            return { totalTime: totalTime, restTime: totalTime - tmpDisTime, growStage: curStage };
        }

        private calProduceInfo() {
            if (this.produceTotalNum > 0) {
                this.produceCompleteNum = Math.floor((ServerManager.curServerTime - this.buildInfo.attrs.hAttrs.beginTime) / this.produceOneNeedTime);
                if (this.produceCompleteNum > this.produceTotalNum) {
                    this.produceCompleteNum = this.produceTotalNum;
                }
                if (this.produceCompleteNum < this.produceTotalNum) {
                    this.produceRestTime = this.buildInfo.attrs.hAttrs.beginTime + this.produceTotalNum * this.produceOneNeedTime - ServerManager.curServerTime;
                    console.log("生产剩余时间：：：：：：：" + this.produceRestTime);
                }
                else {
                    this.produceRestTime = 0;
                }
            }
            else {
                this.produceCompleteNum = 0;
                this.produceRestTime = 0;
            }
        }

        public static createMapItemInfoByIBuild(IBuildInfo: pb.IBuild): MapItemInfo {
            let info = new MapItemInfo();
            info.buildInfo = IBuildInfo;
            info.initItemInfo();
            return info;
        }
        /**
         * 
         * @param id 针对装饰或者花朵，再背包里面，只有id跟num属性，但是摆放进去之后，为了统一的MapItemInfo
         */
        public static createMapItemInfoByID(id: number) {
            let info = new MapItemInfo();
            info.id = id;
            info.initExcelTableData();
            info.putState = 0;
            info.getTime = MapItemInfo.uniqueGetTime;
            return info;
        }

        public static get uniqueGetTime(): number {
            this._uniqueGetTime++;
            return this._uniqueGetTime;
        }

        /**
        * 得到当前正在生产的产品进度比例
        */
        public getCurrentRate(): number {
            let _t: number = (this.produceTotalNum - this.produceCompleteNum) * this.produceOneNeedTime - this.produceRestTime;
            return _t / this.produceOneNeedTime;
        }

        public createOptInfo(type: number): pb.mapItem {
            let changeInfo = new pb.mapItem();
            changeInfo.buildId = this.id;
            changeInfo.getTime = this.getTime;
            changeInfo.pos = { x: this.mapPosRow, y: this.mapPosCol };
            changeInfo.isReverse = this.isReverse ? 1 : 0;
            changeInfo.opt = type;//0是添加，1是移除，2移动，3浇水，4施肥，5除草，6收获（单个建筑）；
            return changeInfo;
        }
    }
}