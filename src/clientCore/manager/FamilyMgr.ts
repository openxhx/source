namespace clientCore {
    /**
     * 家族管理者
     */
    export class FamilyMgr {
        /** 家族ID*/
        public familyId: string;
        /** 玩家的家族信息*/
        public svrMsg: pb.IfmlBaseInfo;
        /** 订单集合*/
        public orderMap: util.HashMap<pb.IfmlOrder>;
        /** 完成订单数*/
        public finishCut: number;
        /** 基础建筑ID*/
        private _baseBuildIds: number[];
        /** 基础建筑数据*/
        public baseBuilds: pb.IBuild[] = [];
        /** 生命之树等级*/
        public treeLv: number = 0;
        /** 基础捐献次数*/
        public baseDonateCnt: number = 0;

        /** 家族排行榜信息*/
        public rankMsg: pb.sc_get_family_liveness_rank_monthly;
        public rankTime: number;

        constructor() { }

        public setup(familyId: string): void {
            this.familyId = familyId;
            net.listen(pb.sc_notify_family_build_change, this, this.onBuildNotify);
            net.listen(pb.sc_family_order_notify, this, this.onSynOrder);
            net.listen(pb.sc_family_base_info_notify, this, this.onBadgeChangeNotify);

        }

        private onBadgeChangeNotify(data: pb.sc_family_base_info_notify) {
            if (!this.checkInFamily()) {
                console.log("没有在家族，怎么推家族信息过来了？");
                return;
            }
            this.svrMsg = data.fmlInfo;
            //数据同步到个人信息里面
            LocalInfo.srvUserInfo.badgeType = data.fmlInfo.badgeType;
            LocalInfo.srvUserInfo.badgeBase = data.fmlInfo.badgeBase;
            EventManager.event(globalEvent.FAMILY_BADGE_CHANGE);
        }

        /** 家族建筑更新通知*/
        private onBuildNotify(msg: pb.sc_notify_family_build_change): void {
            _.forEach(msg.builds, (element: pb.IBuild) => {
                this.calcuTreeLv(element);
                let len: number = this.baseBuilds.length;
                for (let i: number = 0; i < len; i++) {
                    if (this.baseBuilds[i].buildId == element.buildId) {
                        let donateCnt: number = element.attrs.fAttrs.donate - this.baseBuilds[i].attrs.fAttrs.donate;
                        // donateCnt > 0 && alert.showFWords("获得: 建筑经验x" + donateCnt + " 家族贡献x" + this.getDonateGear(donateCnt));
                        this.baseBuilds[i] = null;
                        this.baseBuilds[i] = element;
                    }
                }
            })
            EventManager.event(globalEvent.UPDATE_FAMILY_BUILD, msg);
        }

        private getDonateGear(exp: number): number {
            let xlsData: xls.family = xls.get(xls.family).get(1);
            let costs: xls.pair[] = [xlsData.genGain, xlsData.advGain, xlsData.specialGain];;
            for (let i: number = 0; i < 3; i++) {
                let element: xls.pair = costs[i];
                if (element.v2 == exp) {
                    return element.v1;
                }
            }
        }

        public getFamilyBuildLv(): number {
            for (let i = 0; i < this.baseBuilds.length; i++) {
                if (this.baseBuilds[i].buildId == 499997) {
                    return this.baseBuilds[i].attrs.hAttrs.level;
                }
            }
            return 0;
        }

        /** 打开家族系统*/
        public openFamily(): void {
            if (this.checkInFamily()) {
                net.sendAndWait(new pb.cs_get_family_base_info({ fmlId: this.familyId })).then((msg: pb.sc_get_family_base_info) => {
                    this.svrMsg = msg.fmlInfo;
                    this.familyId = this.svrMsg ? this.svrMsg.fmlId : "";
                    this.checkInFamily() ? this.enterFamily() : ModuleManager.open("familyAc.FamilyAcModule");
                    LocalInfo.srvUserInfo.badgeType = msg.fmlInfo.badgeType;
                    LocalInfo.srvUserInfo.badgeBase = msg.fmlInfo.badgeBase;
                    EventManager.event(globalEvent.FAMILY_BADGE_CHANGE);
                })
            } else {
                ModuleManager.open("familyAc.FamilyAcModule");
            }
        }

        /** 进入家族*/
        private enterFamily(): void {
            // 查找家族基础建筑
            if (!this._baseBuildIds) {
                this._baseBuildIds = [];
                let values: xls.manageBuildingId[] = xls.get(xls.manageBuildingId).getValues();
                _.forEach(values, (element: xls.manageBuildingId) => {
                    element && element.type == 5 && this._baseBuildIds.push(element.buildingId);
                })
            }
            MapManager.enterFamily(this.familyId, 2);
        }

        /** 初始化基础建筑数据*/
        public initBuilds(builds: pb.IBuild[]): void {
            if (this.baseBuilds) {
                this.baseBuilds.length = 0;
                this.baseBuilds = null;
            }
            this.baseBuilds = [];
            _.forEach(builds, (element: pb.IBuild) => {
                if (element && this._baseBuildIds.indexOf(element.buildId) != -1) {
                    this.calcuTreeLv(element);
                    this.baseBuilds.push(element);
                }
            })
        }

        /** 计算生命之树等级*/
        public calcuTreeLv(build: pb.IBuild): void {
            if (build.buildId == 499995) {
                this.treeLv = this.calculateBuildLv(499995, build.attrs.fAttrs.donate);
            }
        }

        /** 离开家族*/
        public leaveFamily(): void {
            util.RedPoint.reqRedPointRefresh(801);
            if (MapInfo.isSelfFamily || MapInfo.isSelfFamilyParty) {
                clientCore.DialogMgr.ins.closeAllDialog();
                clientCore.ModuleManager.closeModuleByName("family");
                clientCore.MapManager.enterHome(clientCore.LocalInfo.uid); //回到家园
            }
            clientCore.FamilyMgr.ins.familyId = "";
            clientCore.FamilyMgr.ins.svrMsg = null;
            clientCore.FamilyMgr.ins.rankMsg = null;
            this.cleanOrders();
            LocalInfo.srvUserInfo.badgeType = 0;
            LocalInfo.srvUserInfo.badgeBase = 0;
            EventManager.event(globalEvent.FAMILY_BADGE_CHANGE);
        }

        /** 检查是否加入了家族*/
        public checkInFamily() {
            return this.familyId != "";
        }

        private onSynOrder(msg: pb.sc_family_order_notify): void {
            this.cleanOrders();
            this.initOrders(msg);
            EventManager.event(globalEvent.SYN_FAMILY_ORDER);
        }

        public initOrders(msg: pb.sc_get_family_order_info | pb.sc_family_order_notify): void {
            this.orderMap = new util.HashMap<pb.IfmlOrder>();
            this.finishCut = msg.finishCnt;
            _.forEach(msg.order, (element: pb.fmlOrder) => {
                this.orderMap.add(element.gettime, element);
            })
        }

        /**
         * 移除一个订单
         * @param getTime 
         */
        public deleteOrder(getTime: number): void {
            this.finishCut++;
            this.orderMap.remove(getTime);
        }

        /** 移除所有订单*/
        public cleanOrders(): void {
            if (!this.orderMap) return;
            this.orderMap.clear();
            this.orderMap = null;
        }


        /**
         * 获得某个职位是否拥有某个功能的权限
         * @param post 
         * @param capacity 
         */
        public checkLimit(post: number, authority: string): boolean {
            let xlsData: xls.familyPosition = xls.get(xls.familyPosition).get(post);
            return xlsData[authority] == 1;
        }

        /**
         * 计算建筑等级
         * @param buildId 
         * @param exp 
         */
        public calculateBuildLv(buildId: number, exp: number): number {
            let xlsBuild: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(buildId);
            let array: xls.manageBuildingUpdate[] = clientCore.BuildingUpgradeConf.getUpgradeInfos(xlsBuild.buildingType);
            let len: number = array.length;
            let element: xls.manageBuildingUpdate;
            for (let i: number = 0; i < len; i++) {
                element = array[i];
                if (exp < element.item[0].v2) { //经验小于当前等级升级所需经验
                    break;
                }
            }

            if (element) {
                if (buildId != 499995 && element.level > this.treeLv) { //其他建筑等级不超过家族
                    return this.treeLv;
                }
                return element.level;
            }
            return 0;
        }
        public getFamilyLevel(): number {
            for (let i = 0; i < this.baseBuilds.length; i++) {
                if (this.baseBuilds[i].buildId == 499995) {
                    return this.calculateBuildLv(this.baseBuilds[i].buildId, this.baseBuilds[i].attrs.fAttrs.donate);
                }
            }
            return 1;
        }
        public getBuildLevel(buildId: number): number {
            for (let i = 0; i < this.baseBuilds.length; i++) {
                if (this.baseBuilds[i].buildId == buildId) {
                    return this.calculateBuildLv(buildId, this.baseBuilds[i].attrs.fAttrs.donate);
                }
            }
            return buildId == 499995 ? 1 : 0;
        }

        /** 总捐献次数*/
        // public get maxDonateNum(): number {
        //     let max: number = xls.get(xls.family).get(1).donateNum; //基础值
        //     let vipLv: number = clientCore.LocalInfo.vipLv;
        //     if (vipLv != 0) {
        //         let xlsData: xls.vipLevel = xls.get(xls.vipLevel).get(vipLv);
        //         _.forEach(xlsData.privilege, (element: xls.pair) => {
        //             if (element.v1 == 7) { // 7-增加家族捐献次数上限
        //                 max += element.v2;
        //             }
        //         })
        //     }
        //     return max;
        // }

        /** 检查是否可以捐献*/
        public checkDonate(): boolean {
            return this.svrMsg.donateVipCnt + this.svrMsg.donateBaseCnt > this.svrMsg.donatedCnt;
        }

        private static _ins: FamilyMgr;
        public static get ins(): FamilyMgr {
            return this._ins || (this._ins = new FamilyMgr());
        }
    }
}