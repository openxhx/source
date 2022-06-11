namespace friends {
    /**
     * 消息控制
     */
    export class FriendSCommand {

        private _model: FriendModel;
        private _listenHandler: Laya.Handler;

        constructor() {
            this._model = FriendModel.ins;
        }

        /** 注册监听*/
        public listen(handler: Laya.Handler): void {
            this._listenHandler = handler;
            net.listen(pb.sc_add_friend_notify, handler.caller, handler.method as (data: any) => void);
            net.listen(pb.sc_apply_add_friend_notify, handler.caller, handler.method as (data: any) => void);
            net.listen(pb.sc_del_friend_notify, handler.caller, handler.method as (data: any) => void);
            net.listen(pb.sc_notify_give_friend_gift, handler.caller, handler.method as (data: any) => void);
        }

        /** 监听回调*/
        private unListen(): void {
            net.unListen(pb.sc_add_friend_notify, this._listenHandler.caller, this._listenHandler.method as (data: any) => void);
            net.unListen(pb.sc_apply_add_friend_notify, this._listenHandler.caller, this._listenHandler.method as (data: any) => void);
            net.unListen(pb.sc_del_friend_notify, this._listenHandler.caller, this._listenHandler.method as (data: any) => void);
            net.unListen(pb.sc_notify_give_friend_gift, this._listenHandler.caller, this._listenHandler.method as (data: any) => void);
            this._listenHandler.recover();
            this._listenHandler = null;
        }

        /**
         * 获取好友列表
         * @param handler 获取成功回调 
         */
        // public getFriends(handler: Laya.Handler): void {
        //     net.sendAndWait(new pb.cs_get_friend_list()).then((msg: pb.sc_get_friend_list) => {   //isFriend 1: 申请 2: 好友 3：离线添加的好友（红点）
        //         this._model.friendLimit = msg.friendsLimit;
        //         let ids: number[] = [];
        //         _.forEach(msg.friendList, (data: pb.Ifriend_t) => {
        //             switch (data.isFriend) {
        //                 case 1:
        //                     this._model.applySimpleIDS.push(data.friendUid);
        //                     break;
        //                 case 2:
        //                     ids.push(data.friendUid);
        //                     this._model.setSimpleInfo(data);
        //                     break;
        //                 case 3:
        //                     ids.unshift(data.friendUid);
        //                     this._model.setSimpleInfo(data);
        //                     !this._model.isOffLineAdd && (this._model.isOffLineAdd = true);
        //                     break
        //                 default:
        //                     break;
        //             }
        //         });
        //         ids.length > 0 ? this.getFriendInfo(ids, handler) : handler.run();
        //     })
        // }

        /**
         * 获取好友信息
         * @param ids id列表
         */
        public getFriendInfo(ids: number[], handler: Laya.Handler): void {
            // net.sendAndWait(new pb.cs_get_friend_info({ friendUid: ids })).then((msg: pb.sc_get_friend_info) => {
            // handler.runWith([msg.friendInfo]);
            // })
        }

        /**
         * 申请添加好友 | 一键添加
         * @param ids id列表
         * @param handler 
         */
        public applyAddFriends(ids: number[], handler: Laya.Handler): void {
            // net.send(new pb.cs_apply_add_friend({ friendUid: ids }));
            net.sendAndWait(new pb.cs_apply_add_friend({ friendUid: ids })).then((msg: pb.sc_apply_add_friend) => {
                handler.runWith(ids);
            });
        }

        /**
         * 删除好友
         * @param id 
         */
        public deleteFriend(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_del_friend({ friendUid: id })).then((msg: pb.sc_del_friend) => {
                handler.runWith(id);
            })
        }

        /**
         * 同意或者拒绝好友申请
         * @param type 1- 同意 2- 拒绝
         * @param id 
         */
        public responseFriend(type: number, ids: number[], handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_response_apply_friend({ operate: type, friendUid: ids })).then((msg: pb.sc_response_apply_friend) => {
                handler.runWith([type, ids]);
            });
        }

        /**
         * 查找好友
         * @param name 名称 
         * @param handler 查找回调
         */
        public searchFriend(name: string, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_search_friend({ friendNick: name })).then((msg: pb.sc_search_friend) => {
                this.getFriendInfo([msg.user.userid], handler);
            })
        }

        /**
         * 获取推荐好友列表
         * @param handler 获取成功回调 
         */
        public getRecommendFriends(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_recommend_friend()).then((msg: pb.sc_get_recommend_friend) => {
                msg.users.length <= 0 ? handler.run() : handler.runWith([msg.users]);
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
         * 赠送好友礼物
         * @param ids 
         */
        public giveFriendGift(ids: number[], handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_give_friend_gifts({ friendIds: ids })).then((msg: pb.sc_give_friend_gifts) => {
                handler.runWith([ids]);
            });
        }

        /**
         * 领取好友礼物
         * @param ids 
         */
        public getFriendGift(ids: number[], handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_friend_gifts({ friendIds: ids })).then((msg: pb.sc_get_friend_gifts) => {
                handler.runWith([ids]);
            });
        }

        public dispose(): void {
            this.unListen();
            this._model = null;
        }
    }
}