namespace clientCore {
    /**
     * 这个类存储的建筑升级表manageBuildingUpdate的信息，这个信息在excel表里，但是这个表的唯一标识key是没有用的
     * 所有不能通过唯一标识的key来获取信息，这个类用来整理表里面信息，方便其他地方调用
     */
    export class BuildingUpgradeConf {
        public static buildingUpgradeInfoHashMap: util.HashMap<xls.manageBuildingUpdate[]>;
        public static initBuildUpgradeInfo() {
            this.buildingUpgradeInfoHashMap = new util.HashMap();
            let allGradeInfo = xls.get(xls.manageBuildingUpdate).getValues();
            for (let info of allGradeInfo) {
                if (!this.buildingUpgradeInfoHashMap.has(info.buildingTypeId)) {
                    this.buildingUpgradeInfoHashMap.add(info.buildingTypeId, []);
                }
                this.buildingUpgradeInfoHashMap.get(info.buildingTypeId).push(info);
            }
            console.log("建筑升级表数据初始化完成！");
        }

        public static getCurUpgradeInfoByTypeAndLevel(type: number, level: number) {
            return this.buildingUpgradeInfoHashMap.get(type)[level - 1];
        }
        /**
         * 如果已经满级，这查询下一级信息会越界，这个判断代码里面去判断
         * @param type 
         * @param level 
         */
        public static getNextUpgradeInfoByTypeAndLevel(type: number, level: number) {
            return this.buildingUpgradeInfoHashMap.get(type)[level];
        }

        /**
         * 得到某种建筑的最大等级
         * @param type 建筑类型
         */
        public static getMaxLevel(type: number): number {
            return this.buildingUpgradeInfoHashMap.get(type).length;
        }

        /**
         * 获取某个建筑的所有升级信息
         * @param type 
         */
        public static getUpgradeInfos(type: number): xls.manageBuildingUpdate[] {
            return this.buildingUpgradeInfoHashMap.get(type);
        }

        public static getGodTreeInfo(type: number): xls.manageBuildingUpdate {
            let infoArr = this.buildingUpgradeInfoHashMap.get(type);
            if (LocalInfo.treeLv > infoArr.length) {
                return infoArr[infoArr.length - 1];
            }
            else {
                return infoArr[LocalInfo.treeLv - 1];
            }
        }
    }
}