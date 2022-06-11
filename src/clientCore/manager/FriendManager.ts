
namespace clientCore {
    /**
     * 消息控制
     */
    export class FriendManager {

        private static _instance: FriendManager;

        private _friendLimit: number;
        private _friendHash: util.HashMap<pb.Ifriend_t>;
        private _applyHash: util.HashMap<pb.Ifriend_t>;
        private _recommandHash: util.HashMap<pb.IUserBase>;
        private _blackLimit: number;
        private _blackHash: util.HashMap<pb.IUserBase>;
        public _getFriendGiftNum: number = 0;//获取好友赠礼（四叶草）次数

        static get instance() {
            this._instance = this._instance || new FriendManager();
            return this._instance;
        }

        constructor() {
            this._friendHash = new util.HashMap();
            this._applyHash = new util.HashMap();
            this._recommandHash = new util.HashMap();
            this._blackHash = new util.HashMap();
            net.listen(pb.sc_add_friend_notify, this, this.onAddFriend);
            net.listen(pb.sc_apply_add_friend_notify, this, this.onApplyFriend);
            net.listen(pb.sc_del_friend_notify, this, this.onDelFriend);
            net.listen(pb.sc_notify_give_friend_gift, this, this.onGiveFriendFift);
            net.listen(pb.sc_add_friendship_notify, this, this.onFriendShipAdd);
            net.listen(pb.sc_friend_home_like, this, this.onFriendSlot);
            net.listen(pb.sc_one_click_friend_accelerate_and_pick, this, this.onFriendHelp);
            BC.addEvent(this, EventManager, globalEvent.FLOWER_PET_VIP_CHANGE_NOTICE, this, this.refreshFriendList);
        }

        async setup() {
            await Promise.all([
                xls.load(xls.friendLevel),
                xls.load(xls.wisdomLevel),
                xls.load(xls.beautifulLevel)
            ])
            await Promise.all([
                this.refreshFriendList(),
                this.refreshRecommendList(),
                this.refreshBalckList()
            ])
        }

        /**判断是否为好友 */
        checkIsFriend(uid: number) {
            return this._friendHash.has(uid);
        }

        //--------------------------------下面这块都是通知 更新缓存数据
        private onAddFriend(data: pb.sc_add_friend_notify) {
            //别人通过了我的申请
            this._friendHash.add(data.friendInfo.userBaseInfo.userid, data.friendInfo);
            EventManager.event(globalEvent.FRIEND_INFO_CHANGE);
        }

        private onApplyFriend(data: pb.sc_apply_add_friend_notify) {
            //别人向我申请好友
            this._applyHash.add(data.friendInfo.userBaseInfo.userid, data.friendInfo);
            EventManager.event(globalEvent.FRIEND_INFO_CHANGE);
        }

        private onDelFriend(data: pb.sc_del_friend_notify) {
            //别人删除我
            this._friendHash.remove(data.friendUid);
            EventManager.event(globalEvent.FRIEND_INFO_CHANGE);
        }

        private onGiveFriendFift(data: pb.sc_notify_give_friend_gift) {
            //有好友送我礼物
            let friendData: pb.Ifriend_t = this._friendHash.get(data.friendUid);
            if (friendData) {
                friendData.isGift = 1;
                EventManager.event(globalEvent.FRIEND_INFO_CHANGE);
            }
        }

        private onFriendSlot(data: pb.sc_friend_home_like) {
            if (this._friendHash.has(data.friendId)) {
                this._friendHash.get(data.friendId).likeTime = 1;
            }
        }

        private onFriendHelp(data: pb.sc_one_click_friend_accelerate_and_pick) {
            if (data.isCooperationTimes >= 3 && this._friendHash.has(data.friendId)) {
                this._friendHash.get(data.friendId).isCooperation = 1;
            }
        }

        private onFriendShipAdd(data: pb.sc_add_friendship_notify) {
            if (this._friendHash.has(data.friendId)) {
                this._friendHash.get(data.friendId).friendShip += data.addNum;
                EventManager.event(globalEvent.FRIEND_INFO_CHANGE);
            }
        }
        //-------------------------------------------

        //---------------下面这块都是缓存的数据 如果需要刷新 调用refresh开头的方法----------------
        /**好友数量上限 */
        get friendLimit() {
            return this._friendLimit;
        }

        /**当前好友数量 */
        get friendNum() {
            return this._friendHash.length;
        }

        /**当前好友列表 */
        get friendList() {
            let list = this._friendHash.getValues();
            return list.sort((b, a) => {
                let aLove = GlobalConfig.lovePointInfo(a.userBaseInfo.love).lv;
                let bLove = GlobalConfig.lovePointInfo(b.userBaseInfo.love).lv;
                let aLv = LocalInfo.parseLvInfoByExp(a.userBaseInfo.exp).lv;
                let bLv = LocalInfo.parseLvInfoByExp(b.userBaseInfo.exp).lv;
                if (a.isOnline) {
                    return 1;
                }
                else if (b.isOnline) {
                    return -1;
                }
                else if (a.friendShip != b.friendShip) {
                    return a.friendShip - b.friendShip
                }
                else if (aLove != bLove) {
                    return aLove - bLove;
                }
                else if (aLv != bLv) {
                    return aLv - bLv;
                }
            })
        }

        /**获取当前 */
        get recommandList() {
            return this._recommandHash.getValues();
        }

        /**别人向我的好友申请（这个是实时的，根据申请通知协议更新的） */
        get applyList() {
            return this._applyHash.getValues();
        }

        /**根据id获取好友信息 */
        getFriendInfoById(id: number) {
            return this._friendHash.get(id);
        }
        //---------------------------------------------------------------------------------------

        /**
         * 获取推荐好友列表
         */
        public refreshRecommendList() {
            this._recommandHash.clear();
            return net.sendAndWait(new pb.cs_get_recommend_friend()).then((msg: pb.sc_get_recommend_friend) => {
                for (const info of msg.users) {
                    this._recommandHash.add(info.userid, info);
                }
                return Promise.resolve(msg.users);
            })
        }
        /**
         * 从后台刷新好友列表
         */
        public refreshFriendList() {
            this._applyHash.clear();
            this._friendHash.clear();
            return net.sendAndWait(new pb.cs_get_friend_list()).then((msg: pb.sc_get_friend_list) => {
                //isFriend 1: 申请列表 2: 好友 3：离线添加的好友（红点）
                this._friendLimit = msg.friendsLimit;
                for (const info of msg.friendList) {
                    if (info.isFriend == 1)
                        this._applyHash.add(info.friendUid, info);
                    else
                        this._friendHash.add(info.friendUid, info);
                }
                this._getFriendGiftNum = msg.dailyGotGiftTimes;
            })
        }

        /**黑名单上限 */
        get blackLimit() {
            return this._blackLimit;
        }

        isBlackListFull() {
            return this._blackHash.length >= this._blackLimit;
        }
        get blackList() {
            return this._blackHash.getValues();
        }

        /**刷新黑名单数据 */
        refreshBalckList() {
            this._blackHash.clear();
            return net.sendAndWait(new pb.cs_get_black_list()).then((msg: pb.sc_get_black_list) => {
                this._blackLimit = msg.blackLimit;
                for (const o of msg.blackList) {
                    this._blackHash.add(o.userid, o);
                }
            })
        }

        /**判断是否黑名单内 */
        checkInBlackList(uid: number) {
            return this._blackHash.has(uid)
        }

        /**加黑名单 
         * @return bool值的Promise对象，加黑名单的结果
        */
        addToBlackList(uid: number) {
            if (this._blackHash.length >= this._blackLimit)
                return Promise.resolve(false);
            return net.sendAndWait(new pb.cs_add_black_list({ uid: uid })).then((data: pb.sc_add_black_list) => {
                this._blackHash.add(uid, data.blackList);
                return Promise.resolve(true);
            }).catch((e) => {
                return Promise.resolve(false);
            })
        }

        /**移除黑名单 */
        removeFromBlackList(uid: number) {
            return net.sendAndWait(new pb.cs_del_black_list({ uid: uid })).then(() => {
                this._blackHash.remove(uid);
            })
        }

        /**
         * 申请添加好友 在then中处理申请后
         * @param ids id列表
         */
        public applyAddFriends(ids: number[]) {
            if (ids.length == 1 && ids[0] == LocalInfo.uid) {
                alert.showFWords('不能添加自己为好友');
                return Promise.resolve([]);
            }
            //已经是好友的过滤
            let reqids = _.filter(ids, id => !this._friendHash.has(id));
            if (reqids.length == 0)
                return Promise.resolve(ids);
            else
                return net.sendAndWait(new pb.cs_apply_add_friend({ friendUid: reqids })).then((msg: pb.sc_apply_add_friend) => {
                    for (const id of ids) {
                        this._recommandHash.remove(id);
                    }
                    return Promise.resolve(ids);
                });
        }

        /**
        * 删除好友 在then中处理删除后
        * @param id 
        */
        public deleteFriend(id: number) {
            return net.sendAndWait(new pb.cs_del_friend({ friendUid: id })).then((msg: pb.sc_del_friend) => {
                this._friendHash.remove(id);
                return Promise.resolve();
            })
        }

        /**
         * 同意或者拒绝好友申请 then中处理回调 ids
         * @param type 1- 同意 2- 拒绝
         * @param id 
         * 
         */
        public responseFriend(type: number, ids: number[]) {
            if (ids.length == 0)
                return Promise.resolve([]);
            return net.sendAndWait(new pb.cs_response_apply_friend({ operate: type, friendUid: ids })).then((msg: pb.sc_response_apply_friend) => {
                //清理申请列表
                for (const id of ids) {
                    //如果是拒绝 或者 成功添加的则删除申请缓存
                    if (type != 1 || msg.friendUid.indexOf(id) == -1) {
                        let info = this._applyHash.remove(id);
                        //如果是同意 添加到本地缓存
                        if (type == 1) {
                            this._friendHash.add(id, info);
                        }
                    }
                }
                util.RedPoint.reqRedPointRefresh(1101);
                return Promise.resolve(ids);
            });
        }

        /**
         * 查找好友
         * @param name 名称 
         */
        public searchFirend(name: string) {
            return net.sendAndWait(new pb.cs_search_friend({ friendNick: name })).then((msg: pb.sc_search_friend) => {
                return Promise.resolve(msg.user);
            })
        }


        /**
        * 设置是否拒绝申请
        * @param type 0- 取消 1- 是的
        */
        public setRejectApply(type: number): void {
            net.send(new pb.cs_set_refuse_to_be_added({ flag: type }));
        }

        /**
        * 赠送好友礼物 then中处理 ids
        * @param ids 
        */
        public giveFriendGift(ids: number[]) {
            if (this.friendList.length == 0)
                return Promise.resolve([]);
            return net.sendAndWait(new pb.cs_give_friend_gifts({ friendIds: ids })).then((msg: pb.sc_give_friend_gifts) => {
                _.forEach(ids, (id: number) => {
                    let friend = this._friendHash.get(id);
                    friend.giveTime = clientCore.ServerManager.curServerTime;
                });
                let max: number = clientCore.GlobalConfig.maxFriendPower;
                let len: number = ids.length;
                if (len == 1) {
                    let msg: pb.Ifriend_t = this._friendHash.get(ids[0]);
                    alert.showFWords(`已赠送给好友${msg.userBaseInfo.nick}${max}个四叶草^_^`);
                }
                if (len > 1) {
                    alert.showFWords(`给${len}位好友赠送了四叶草^_^`);
                }
                return Promise.resolve(ids);
            });
        }

        /**
         * 领取好友礼物 then中处理 ids
         * @param ids 
         */
        public getFriendGift(ids: number[]) {
            if (this.friendList.length == 0)
                return Promise.resolve([]);
            return net.sendAndWait(new pb.cs_get_friend_gifts({ friendIds: ids })).then((msg: pb.sc_get_friend_gifts) => {
                _.forEach(ids, (id: number) => {
                    this._friendHash.get(id).isGift = 0;
                });
                if (ids.length == 1) {
                    let friendInfo: pb.Ifriend_t = this._friendHash.get(ids[0]);
                    alert.showFWords(`获得${friendInfo.userBaseInfo.nick}赠送的${msg.curGotNum}个四叶草^_^`);
                }
                if (ids.length > 1) {
                    alert.showFWords(`获得好友赠送的${msg.curGotNum}个四叶草^_^`);
                }
                this._getFriendGiftNum += msg.curGotNum;
                return Promise.resolve(ids);
            });
        }

        /**
         * 一键点赞 then中处理 id
         * @param id
        */
        public slotFriend(ids: number[]) {
            if (this.friendList.length == 0)
                return Promise.resolve([]);
            net.send(new pb.cs_friend_home_onekey_like({ homeIdList: ids }));
            _.forEach(ids, (id: number) => {
                this._friendHash.get(id).likeTime = 1;
            });
            let len: number = ids.length;
            if (len == 1) {
                let msg: pb.Ifriend_t = this._friendHash.get(ids[0]);
                alert.showFWords(`已给好友${msg.userBaseInfo.nick}点赞^_^`);
            }
            if (len > 1) {
                alert.showFWords(`已给${len}位好友点赞^_^`);
            }
            return Promise.resolve(ids);
        }

    //     /**
    //      * 一键互助 then中处理 id
    //      * @param id
    //      */
    //     public helpFriend(ids: number[]) {
    //     if (this.friendList.length == 0)
    //         return Promise.resolve([]);
    //     this.helpOneFriend(ids, 0);
    // }

    //     private helpOneFriend(ids : number[], index: number = 0){
    //     net.sendAndWait(new pb.cs_one_click_friend_accelerate_and_pick({ homeId: ids[index]  , type:1})).then((msg: pb.sc_one_click_friend_accelerate_and_pick) => {
    //         for (let i = 0; i < msg.items.length; i++) {
    //             alert.showFWords("获得：" + ItemsInfo.getItemName(msg.items[i].id) + " x" + msg.items[i].cnt);
    //         }
    //         if (index < ids.length - 1) {
    //             this.helpOneFriend(ids, index + 1);
    //         } else {
    //             alert.showFWords(`已帮助${index + 1}位好友^_^`);
    //             return Promise.resolve(ids);
    //         }
    //     })
    // }

}
}