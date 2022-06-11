namespace friends {
    export class FriendModel extends Laya.EventDispatcher {

        /** 当前界面类型*/
        public viewType: number;

        /** 离线有新好友增加*/
        public isOffLineAdd: boolean = false;

        /** 好友上限*/
        public friendLimit: number = 0;

        /** 简易的申请列表*/
        public applySimpleIDS: number[];
        public myFriends: util.HashMap<pb.Ifriend_t>;
        public applyFriends: util.HashMap<pb.Ifriend_t>;

        /** 简易好友的信息存储*/
        public simpleInfos: any;

        constructor() {
            super();
            this.applySimpleIDS = [];
            this.myFriends = new util.HashMap();
            this.applyFriends = new util.HashMap();
        }

        /**
         * 解析数据到hash表
         * @param data 数据
         * @param isApplyFriend [可选]是否是申请的好友
         */
        public analysisInfo2(data: pb.Ifriend_t[], isApplyFriend?: boolean): void {
            let info: pb.Ifriend_t;
            let simpleInfo: pb.Ifriend_t;
            let map: util.HashMap<pb.Ifriend_t> = isApplyFriend ? this.applyFriends : this.myFriends;
            _.forEach(data, (ele: pb.Ifriend_t) => {
                info = map.get(ele.friendUid);
                info && (info = null);
                if (!isApplyFriend && this.simpleInfos) { //赋予礼包实时数据
                    simpleInfo = this.simpleInfos[ele.friendUid];
                    if (simpleInfo) {
                        ele.giveTime = simpleInfo.giveTime;
                        ele.isGift = simpleInfo.isGift;
                    }
                }; map.add(ele.friendUid, ele);
            });
        }

        public setSimpleInfo(data: pb.Ifriend_t): void {
            if (!this.simpleInfos) this.simpleInfos = {};
            this.simpleInfos[data.friendUid] = data;
        }

        public clear(): void {
            _.forEach(this.myFriends.getValues(), (info: pb.Ifriend_t) => {
                info = null;
            });
            _.forEach(this.applyFriends.getValues(), (info: pb.Ifriend_t) => {
                info = null;
            });
            this.myFriends.clear();
            this.applyFriends.clear();
            this.applySimpleIDS.length = 0;
            this.simpleInfos = null;
        }

        private static _ins: FriendModel;
        public static get ins(): FriendModel {
            return this._ins || (this._ins = new FriendModel());
        }
    }
}