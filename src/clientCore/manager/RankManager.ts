namespace clientCore {
    /**
     * 排行榜管理者
     */
    export class RankManager {

        constructor() { }

        /**
         * 获取服务器的排名信息
         * @param rankId 
         */
        public getSrvRank(rankId: number, start: number = 0, end: number = 49): Promise<RankInfo[]> {
            return new Promise((suc, fail) => {
                let data = (rankId == 3 || rankId == 36) ? pb.cs_get_family_rank_info : pb.cs_get_rank_info;
                net.sendAndWait(new data({ rankId: rankId, start: start, end: end, flag: 1 })).then((msg) => {
                    let array: RankInfo[] = [];
                    _.forEach(msg.rankInfo, (element: pb.RankInfo | pb.FamilyRankInfo) => { array.push(RankInfo.create(element, element.rankId)); })
                    suc(array);
                }).catch(() => {
                    fail();
                })
            })
        }

        /**
         * 获取某个角色的排行榜信息
         * @param rankId 
         * @param userId 
         */
        public getUserRank(rankId: number, userId: number): Promise<RankInfo> {
            return new Promise((suc, fail) => {
                let data = (rankId == 3 || rankId == 36) ? pb.cs_get_user_family_ranking_info : pb.cs_get_user_ranking_info;
                net.sendAndWait(new data({ rankId: rankId, uid: userId, flag: 1 })).then((msg) => {
                    suc(RankInfo.create(msg.rankInfo, rankId));
                }).catch(() => {
                    fail();
                })
            })
        }

        /**
         * 检查活动 因为说是同时开始同时结束 检查一个就好了 如果出现意外 打死策划吧^_^
         * 返回距离结束还有多少时间
         */
        public checkActivity(): number {
            let data: xls.rankInfo = xls.get(xls.rankInfo).get(1);
            let closeTime: number = util.TimeUtil.formatTimeStrToSec(data.closeTime);;
            return closeTime - clientCore.ServerManager.curServerTime;
        }

        /** 检查展示界面的时间*/
        public checkHide(): number {
            let endT: number = util.TimeUtil.formatTimeStrToSec("2020/3/31 00:00:00");
            return endT - clientCore.ServerManager.curServerTime;
        }

        private static _ins: RankManager;
        public static get ins(): RankManager {
            return this._ins || (this._ins = new RankManager());
        }

    }

    export class RankInfo {

        cls: xls.rankInfo;
        msg: pb.IRankInfo | pb.IFamilyRankInfo;

        constructor() { }

        get userName(): string{
            if(this.msg instanceof pb.RankInfo){
                return this.msg.userBase.nick;
            }
            return '';
        }

        get familyName(): string{
            if(this.msg instanceof pb.RankInfo){
                return this.msg.userBase.familyName;
            }
            return '';
        }

        get headImage(): number{
            if(this.msg instanceof pb.RankInfo){
                return this.msg.userBase.headImage;
            }
            return 0;
        }

        get headFrame(): number{
            if(this.msg instanceof pb.RankInfo){
                return this.msg.userBase.headFrame;
            }
            return 0;
        }

        dispose(): void {
            this.cls = this.msg = null;
            Laya.Pool.recover("RankInfo", this);
        }

        public static create(msg: pb.IRankInfo, rankId: number): RankInfo {
            let info: RankInfo = Laya.Pool.getItemByClass("RankInfo", RankInfo);
            info.msg = msg;
            info.cls = xls.get(xls.rankInfo).get(rankId);
            return info;
        }
    }
}