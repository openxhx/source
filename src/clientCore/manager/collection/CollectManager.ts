namespace clientCore {
    /**收藏系统子面板类型 */
    export enum CO_TYPE {
        /**徽章 */
        BADGE = 1,
        /**服装 */
        CLOTH = 2,
        /**角色 */
        ROLE = 3,
        /**藏品 */
        COLLECT = 4,
        /**CG */
        CG = 5,
        /**家园 */
        GARDEN = 6,
        /**大纪事 */
        EVENT = 7,
        /**散件 */
        SANJAIN = 8
    }

    /**收藏信息管理 */
    export class CollectManager {
        private static _instance: CollectManager;
        private _infoHash: util.HashMap<boolean>;//加载过信息的记录
        //收集进度字典
        private _collectProgressHash: util.HashMap<number>; //上次领取的收集进度奖励ID（对应collectReward表）
        //角色
        private _role: CoRoleInfo[];
        //大事记
        private _event: CoBigEventInfo[];
        private _weekRecord: pb.IReportInfo[];
        //徽章
        private _badgeHash: util.HashMap<CoBadgeInfo>;//勋章信息
        //服装是否已经领过奖励
        private _clothHaveGetReward: util.HashMap<boolean>;

        constructor() {
            this._infoHash = new util.HashMap();
            this._badgeHash = new util.HashMap();
            this._collectProgressHash = new util.HashMap();
            this._clothHaveGetReward = new util.HashMap();
        }

        static get instance() {
            this._instance = this._instance || new CollectManager();
            return this._instance;
        }

        /**从后台加载数据,如果加载过不会再次加载(表也会在这里加载) */
        async reqInfo(infoType: CO_TYPE) {
            //badge特殊处理
            if (this._infoHash.has(infoType) && infoType != CO_TYPE.BADGE) {
                return Promise.resolve();
            }
            switch (infoType) {
                case CO_TYPE.ROLE:
                    await Promise.all([xls.load(xls.collectCharactercg)]);
                    await net.sendAndWait(new pb.cs_get_role_filed_status()).then((d) => {
                        this.onCoRoleInfoBack(d);
                    });
                    break;
                case CO_TYPE.EVENT:
                    await Promise.all([xls.load(xls.collectChronicle), xls.load(xls.collectWeekly)]);
                    await net.sendAndWait(new pb.cs_get_chronicle_info()).then((d: pb.sc_get_chronicle_info) => {
                        this._event = _.map(d.chronicleInfo, (srv) => {
                            return new CoBigEventInfo(srv);
                        });
                    });
                    await net.sendAndWait(new pb.cs_get_weekly_report()).then((d: pb.sc_get_weekly_report) => {
                        this._weekRecord = d.weeklyReport;
                    })
                    break;
                case CO_TYPE.BADGE:
                    await Promise.all([xls.load(xls.collectAchievement), xls.load(xls.collectReward)]);
                    let haveReqInfo = this._infoHash.has(CO_TYPE.BADGE);
                    await net.sendAndWait(new pb.cs_get_all_badge_collections_info({ flag: haveReqInfo ? 1 : 0 })).then((d: pb.sc_get_all_badge_collections_info) => {
                        for (const data of d.badgeList) {
                            if (xls.get(xls.collectAchievement).has(data.badgeId))
                                this._badgeHash.add(data.badgeId, new CoBadgeInfo(data));
                        }
                        this._collectProgressHash.add(infoType, d.rewardId);
                    })
                    break;
                case CO_TYPE.CLOTH:
                    await xls.load(xls.collectSuits);
                    await net.sendAndWait(new pb.cs_get_collect_suit_reward_status()).then((data: pb.sc_get_collect_suit_reward_status) => {
                        // console.log(data.status);
                        let arr = xls.get(xls.collectSuits).getValues();
                        for (let i = 0; i < arr.length; i++) {
                            this._clothHaveGetReward.add(arr[i].suitsId, data.status.charAt(i) == '1');
                        }
                    });
                    break;
                case CO_TYPE.SANJAIN:
                    await xls.load(xls.collectItem);
                    break;
                default:
                    break;
            }
            this._infoHash.add(infoType, true);
        }

        /**按id获取收藏中角色的信息 */
        getCoRoleInfoById(id: number) {
            return this._role[id - 1];
        }
        /**获取所有收藏中角色的信息 */
        getCoRoleInfos() {
            return this._role;
        }

        /**获取对应类型的事件信息 */
        getCoEventInfoByType(type: CO_TYPE) {
            return _.filter(this._event, (e) => { return e.xlsInfo.chronicleType == type });
        }

        /**获取周报 */
        getWeekRecord() {
            return this._weekRecord;
        }

        /**按类型获取徽章列表
         * @param type 传0代表所有类型 
         */
        getBadgeListBytype(type: number) {
            let arr = this._badgeHash.getValues().filter((o) => { return o.type == type || type == 0 });
            arr = _.filter(arr, (o) => { return o.xlsData.achievementId != 7 && o.xlsData.achievementId != 8 })
            return arr.sort((a, b) => {
                return this.sortLv(b) - this.sortLv(a);
            })
        }

        private sortLv(info: CoBadgeInfo) {
            let rank = 0;
            if (info.nowHaveReward)
                rank = 1000;
            if (info.isComplete)
                rank = -1000;
            rank += info.xlsData.achievementId;
            return rank
        }

        /**领取勋章奖励 */
        async getBadgeReward(id: number) {
            return net.sendAndWait(new pb.cs_get_badge_collections_reward({ badgeId: id })).then((data: pb.sc_get_badge_collections_reward) => {
                let rwds = GoodsInfo.createArray(data.rewardInfo);
                alert.showReward(rwds, '获得奖励');
                this._badgeHash.add(data.badgeInfo.badgeId, new CoBadgeInfo(data.badgeInfo));
                let redArr = [703, 702, 701];
                let type = this._badgeHash.get(id).type
                util.RedPoint.reqRedPointRefresh(redArr[type - 1]);
            })
        }

        /**各面板通用的 获取收集进度奖励
         * 领奖后请调用 getCollectProgress 更新进度信息
         */
        getCollectProgressReward(type: CO_TYPE) {
            return net.sendAndWait(new pb.cs_get_achievement_collections_reward({ type: type })).then((data: pb.sc_get_achievement_collections_reward) => {
                let rwds = GoodsInfo.createArray(data.rewardInfo);
                alert.showReward(rwds, '获得奖励');
                this._collectProgressHash.add(type, data.rewardId);
                util.RedPoint.reqRedPointRefresh(705);
            });
        }

        /**按类型获取收集进度 */
        getCollectProgress(type: CO_TYPE) {
            let rtn = { now: 0, total: 0, haveRwd: false };
            if (this._collectProgressHash.has(type)) {
                let sameTypeXlsArr = xls.get(xls.collectReward).getValues().filter((o) => { return o.rewardType == type });
                let lastRwdID = this._collectProgressHash.get(type);
                let lastRwdIdx = _.findIndex(sameTypeXlsArr, { 'rewardId': lastRwdID });
                let nextRwdIdx = _.clamp(lastRwdIdx + 1, 0, sameTypeXlsArr.length - 1);
                switch (type) {
                    case CO_TYPE.BADGE:
                        //徽章计算方式 (当前所有徽章累积获得的点数)
                        rtn.now = _.reduce(this._badgeHash.getValues(), (prev, curr, idx) => { return prev + curr.totalGetPoint }, 0);
                        rtn.total = sameTypeXlsArr[nextRwdIdx].rewardMax;
                        break;

                    default:
                        break;
                }
            }
            rtn.now = Math.min(rtn.now, rtn.total);
            rtn.haveRwd = rtn.now >= rtn.total && rtn.total != 0;
            return rtn;
        }

        /** 获取角色图鉴奖励 */
        async getCoRoleReward(id: number) {
            return net.sendAndWait(new pb.cs_get_role_filed_reward({ filedId: id })).then((data: pb.sc_get_role_filed_reward) => {
                let role = RoleManager.instance.getRoleById(data.roleid);
                if (role) {
                    role.srvData.achvAttrs = data.achvAttrs;
                }
                this.getCoRoleInfoById(id).rewarded = true;
                util.RedPoint.reqRedPointRefresh(704);
                return Promise.resolve(data);
            })
        }

        private onCoRoleInfoBack(data: pb.sc_get_role_filed_status) {
            this._role = [];
            let xmls = xls.get(xls.collectCharactercg).getValues();
            for (let i = 0; i < xmls.length; i++) {
                let xml = xmls[i];
                let info = new CoRoleInfo(xml);
                info.rewarded = data.status.charAt(i) == '1';
                this._role.push(info);
            }
        }

        /**
         * 判断套装是否已经领取过
         * @param suitsId 
         */
        getClothGetedReward(suitsId: number) {
            return this._clothHaveGetReward.get(suitsId);
        }

        /**领取套装奖励 */
        async getClothReward(suitsId: number[]) {
            await net.sendAndWait(new pb.cs_get_collect_suit_reward({ suitIdList: suitsId })).then((data: pb.sc_get_collect_suit_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                for (let i: number = 0; i < suitsId.length; i++) {
                    this._clothHaveGetReward.add(suitsId[i], true);
                }
                util.RedPoint.reqRedPointRefresh(706);
            })
            return Promise.resolve();
        }
    }
}