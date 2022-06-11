namespace clientCore {
    /**
     * 
     */
    export class FriendHomeInfoMgr {
        private static _ins: FriendHomeInfoMgr;
        public static get ins(): FriendHomeInfoMgr {
            return this._ins || (this._ins = new FriendHomeInfoMgr());
        }
        public friendBaseInfo: pb.IUserBase;
        public friendHomeInfo: pb.sc_get_home_friend_info;
        public friendRankInfo: pb.IUserBase[];
        public async checkFriendInfo(id: number) {
            await net.sendAndWait(new pb.cs_get_user_base_info({ uids: [id] })).then((data: pb.sc_get_user_base_info) => {
                this.friendBaseInfo = data.userInfos[0];
            });
        }
        public async getFriendRankInfo() {
            await net.sendAndWait(new pb.cs_get_home_friend_info({ homeId: parseInt(MapInfo.mapData) })).then((data: pb.sc_get_home_friend_info) => {
                this.friendHomeInfo = data;
            });
            let idArr = [];
            for (let i = 0; i < this.friendHomeInfo.ranks.length; i++) {
                idArr.push(this.friendHomeInfo.ranks[i].userid);
            }
            if (idArr.length > 0)
                await net.sendAndWait(new pb.cs_get_user_base_info({ uids: idArr })).then((data: pb.sc_get_user_base_info) => {
                    this.friendRankInfo = data.userInfos;
                });
        }

        public static createVisitMsg(info: pb.IVistorEventLogInfo,uid:number,nick:string): string {
            let messageArr = [];
            messageArr.push(info.nick);
            messageArr.push("#00ffff");
            let str = "";
            if (info.eventType == 2) {
                str = "给" + this.getNameByFriendID(uid, nick) + "的家园";
                messageArr.push(str);
                messageArr.push("#000000");
                messageArr.push("点赞");
                messageArr.push("#ff3300");
                messageArr.push("啦！");
                messageArr.push("#000000");
            }
            else if (info.eventType == 1) {
                str = "给" + this.getNameByFriendID(uid, nick) + "的" + xls.get(xls.manageBuildingId).get(info.buildId).name;
                messageArr.push(str);
                messageArr.push("#000000");
                messageArr.push("加速" + util.StringUtils.getTimeStr2(info.reduceTime));
                messageArr.push("#00ff00");
                messageArr.push("！");
                messageArr.push("#000000");
            }
            return util.StringUtils.getColorText2(messageArr);
        }
        private static getNameByFriendID(id: number, nick: string) {
            if (id == LocalInfo.uid) {
                return "你";
            }
            return nick + "玩家";
        }
    }
}