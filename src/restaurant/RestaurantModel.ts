namespace restaurant {
    export class RestaurantModel implements clientCore.BaseModel {
        /**餐厅代币id */
        public coinId: number = 9900066;
        /**当前餐厅积分 */
        public curPoint: number;
        /**当前上架食物 */
        public curFood: pb.IDinerFoodPos[];
        /**餐厅等级 */
        public curLevel: number;
        /**解锁食谱数 */
        public curCreatNum: number;
        /**制作总数 */
        public curMakeNum: number;
        /**餐厅主题 */
        public curSkin: number;
        /**已拥有主题 */
        public haveSkin: number[];
        /**清洁度 */
        public cleanPoint: number;
        /**今日普通宣传次数 */
        public curShareCntN: number;
        /**今日高级宣传次数 */
        public curShareCntH: number;
        /**普通宣传结束时间 */
        public shareEndTimeN: number;
        /**高级宣传结束时间 */
        public shareEndTimeH: number;
        /////////////////////////////////////////////
        /**已拥有的npc */
        // public haveNpcId: number[];
        /**等候cd的npc */
        public onWaitNpc: { id: number, end: number }[];
        /**可入场npc */
        public canUseNpc: number[];
        /////////////////////////////////////////////
        /**当前清洁度cd */
        public curCleanCd: number = 0;
        /**当前宣传cd */
        private curShareCd: number = 0;
        /**当前入场cd */
        public curInCd: number = 0;
        /**入场未入座的顾客数量 */
        public inNoSeatNum: number = 0;
        /**正在吃的菜所属位置 */
        public onEatPos: number[];


        /**获取当前已拥有的所有npc */
        public getMyNpc() {
            // this.haveNpcId = [];
            this.canUseNpc = [];
            this.onWaitNpc = [];
            for (let i = 1410001; i <= 1410016; i++) {
                // if (clientCore.RoleManager.instance.getRoleById(i)) {
                //     this.haveNpcId.push(i);
                //     this.canUseNpc.push(i);
                // }
                this.canUseNpc.push(i);
            }
        }

        /**获取预备入场的npc 返回的是npcid*/
        public getNextNpc(): number {
            if (this.canUseNpc.length > 0) {
                let idx = Math.floor(Math.random() * this.canUseNpc.length);
                let npc = this.canUseNpc.splice(idx, 1)[0];
                return npc;
            }
            return 0;
        }

        /**清洁度发生变化 */
        public onCleanPointChange() {
            let temp = this.getCleanCd();
            if (temp != this.curCleanCd) {
                if (this.curInCd > 0) {
                    this.curInCd = this.curInCd - this.curCleanCd + temp;
                    if (this.curInCd < 1) this.curInCd = 1;
                }
                this.curCleanCd = temp;
                EventManager.event("FREASH_GARBAGE");
            }
        }

        /**获取清洁度cd */
        public getCleanCd() {
            let xlsClean: xls.triple[] = xls.get(xls.diningBase)?.get(1).clean;
            if (!xlsClean) return 0;
            let cleanT = _.last(xlsClean).v3;
            for (let i: number = 0; i < xlsClean.length - 1; i++) {
                if (this.cleanPoint <= xlsClean[i].v1 && this.cleanPoint > xlsClean[i + 1].v1) {
                    cleanT = xlsClean[i].v3;
                    break;
                }
            }
            return cleanT;
        }

        /**宣传状态发生变化 */
        public onShareChange() {
            let temp = this.getShareCd();
            if (temp != this.curShareCd) {
                if (this.curInCd > 0) {
                    this.curInCd = this.curInCd + this.curShareCd - temp;
                    if (this.curInCd < 1) this.curInCd = 1;
                }
                this.curShareCd = temp;
            }
        }

        /**获取宣传cd */
        private getShareCd() {
            let config: xls.diningBase = xls.get(xls.diningBase).get(1);
            let shareT: number = 0;
            if (this.shareEndTimeN > clientCore.ServerManager.curServerTime) {
                let xlsShare = config.commonAdvertise;
                shareT = Number(xlsShare.split("/")[3]);
            } else if (this.shareEndTimeH > clientCore.ServerManager.curServerTime) {
                let xlsShare = config.advancedAdvertise;
                shareT = Number(xlsShare.split("/")[3]);
            }
            return shareT;
        }

        /**计算进场cd */
        public setInCd() {
            let baseT: number = xls.get(xls.diningBase).get(1).npcRefreshTime;
            this.curInCd = baseT - this.curShareCd + this.curCleanCd;
        }

        /**皮肤资源路径 */
        private get skinUrl(): string {
            return "res/restaurantSkin/";
        }

        /**检查升级条件是否满足 */
        public checkCanLevelUp() {
            let xlsData = xls.get(xls.diningLevelUp);
            let cur = xlsData.get(this.curLevel);
            if (xlsData.has(cur.level + 1)) {
                let next = xlsData.get(cur.level + 1);
                if (this.curPoint < cur.upgradIntegral) return false;
                if (this.curCreatNum < cur.upgradMenu) return false;
                if (this.curMakeNum < cur.upgradDishes) return false;
                for (let i: number = 0; i < cur.upgradCost.length; i++) {
                    let have = clientCore.ItemsInfo.getItemNum(cur.upgradCost[i].v1);
                    if (have < cur.upgradCost[i].v2) return false;
                }
            } else {
                return false;
            }
            return true;
        }
        dispose() {
            this.curFood = this.haveSkin = this.onWaitNpc = this.canUseNpc = this.onEatPos = null;
        }
    }
}