
namespace clientCore {
    /**CP状态 */
    export enum CP_STATU {
        /**申请中 */
        APPLYING = 0,
        /**正常cp */
        NORMAL = 1,
        /**等待解除 */
        WAIT_DIVORCE = 2,
        /**别人向我申请解约 等待我的回复 */
        WAIT_DIVRORE_REPLEY = 4
    }

    export class CpManager {
        private static _ins: CpManager;
        private _allCpInfos: util.HashMap<pb.ICpInfo>;
        private _currRingId: number;
        private _rank: number;
        private _weddingInfo: pb.Isc_get_cp_wedding_info;
        private _cacheWeddingList: pb.Isc_get_cp_wedding_list;
        private _lastReqAllWeddingInfoTime: number = 0;
        private _annouceList: util.HashMap<pb.IWeddingInfo>;
        /**是否举行过婚礼 */
        public haveWedding: boolean = false;

        static get instance() {
            this._ins = this._ins || new CpManager();
            return this._ins;
        }

        constructor() {
            this._allCpInfos = new util.HashMap();
            this._annouceList = new util.HashMap();
        }

        async setup() {
            await net.sendAndWait(new pb.cs_get_couple_info()).then((data: pb.sc_get_couple_info) => {
                for (const o of data.cpInfo) {
                    this._allCpInfos.add(o.coupleId, o);
                }
                this._rank = data.rank;
                this._currRingId = data.curRing;
                this.haveWedding = data.isWeddings == 1;
            });
            await this.refreshSelfWeddingInfo();
            await xls.load(xls.cpCommonDate);
            await xls.load(xls.cpRing);
            net.listen(pb.sc_apply_cp_notify, this, this.onSomeoneApply);
            net.listen(pb.sc_reply_apply_cp_notify, this, this.onSomeoneReply);
            net.listen(pb.sc_reply_relieve_cp_notify, this, this.onReplyDivorceNotify);
            net.listen(pb.sc_apply_relieve_cp_notify, this, this.onDivorceNotify);
            net.listen(pb.sc_cp_online_notify, this, this.onCpOnline);
            net.listen(pb.sc_cp_change_ring_notify, this, this.onRingChange);
            net.listen(pb.sc_couple_cancel_wait_notify, this, this.onSomeoneCancleApply);
            net.listen(pb.sc_cp_wedding_reservation_notify, this, this.onCpChangeWeddingInfo);
            net.listen(pb.sc_wedding_reservation_world_announce, this, this.onAnnouce);
            net.listen(pb.sc_cp_pay_suit_notify, this, this.onBrideBuyNotify);
        }

        /**当前玩家的cp信息,有可能为undefined,申请中的也算是cp信息 */
        get cpInfo() {
            let info = _.find(this._allCpInfos.getValues(), o =>
                //先判断是否有正常的或是等待解除期的
                (o.status != CP_STATU.APPLYING) ||
                //再判断是否我发出的申请
                (o.status == CP_STATU.APPLYING && o.isApply == 1)
            );
            if (info && !info.userBase) {
                info.userBase = new pb.UserBase({ sex: 1 });
            }
            return info;
        }

        /** 获取当前玩家的CPID 没有cd返回0*/
        get cpID(): number {
            let info = this.cpInfo;
            return info && info.status != CP_STATU.APPLYING ? info.userBase.userid : 0;
        }

        /**获取纪念日，没有cp返回0 */
        get weddingTime() {
            if (this.haveCp()) {
                return this.cpInfo.applyTime;
            }
        }

        /**判断当前是否有CP */
        haveCp() {
            let info = this.cpInfo;
            return (info instanceof pb.CpInfo) && info.status != CP_STATU.APPLYING;
        }

        /**刷新CP的角色信息 */
        refreshCpUserInfo() {
            let cpIds = _.map(this._allCpInfos.getValues(), o => o.userBase.userid);
            if (cpIds.length > 0) {
                return net.sendAndWait(new pb.cs_get_user_base_info({ uids: cpIds })).then((data: pb.sc_get_user_base_info) => {
                    let userInfo = data.userInfos[0];
                    if (userInfo) {
                        this.cpInfo.userBase = userInfo;
                    }
                });
            }
            else {
                return Promise.resolve();
            }
        }

        /** 判断cp*/
        checkCp(uid: number): boolean {
            let info: pb.ICpInfo = this.cpInfo;
            if (info && info.status != CP_STATU.APPLYING) {
                return this.cpInfo.userBase.userid == uid;
            }
            return false;
        }

        /**当前是否有解约申请 */
        getDivorceAlert() {
            let info = _.find(this._allCpInfos.getValues(), (o) => {
                return o.status == CP_STATU.WAIT_DIVRORE_REPLEY && o.coupleId == this.cpID;
            })
            return info;
        }

        /**当前使用的婚戒id */
        get currRingId() {
            return this._currRingId;
        }

        /**第几对集成的CP */
        get cpRank() {
            return this._rank;
        }

        /**申请列表 */
        get applyList() {
            return _.filter(this._allCpInfos.getValues(), (o) => {
                return o.status == CP_STATU.APPLYING && o.isApply == 0;
            })
        }

        /**删除申请中的（结成CP时删除所有正在申请的） */
        private deleteOtherApply() {
            for (const iterator of this._allCpInfos.toArray()) {
                if (iterator[1].status == CP_STATU.APPLYING) {
                    this._allCpInfos.remove(iterator[0]);
                }
            }
        }

        /**
         * 向某人申请结成cp
         * @param uid 玩家uid
         * @param ringId 所用戒指id
         */
        applyCp(uid: number, ringId: number) {
            net.sendAndWait(new pb.cs_apply_cp({ toolId: ringId, uid: uid })).then((data: pb.sc_apply_cp) => {
                this._allCpInfos.add(data.cpInfo.coupleId, data.cpInfo);
                alert.showFWords(`申请成功，请等待回复`);
                EventManager.event(globalEvent.CP_INFO_UPDATE);
            })
        }

        /**取消申请cp */
        cancleApplyCp() {
            net.sendAndWait(new pb.cs_cancel_couple_apply()).then(() => {
                this._allCpInfos.remove(this.cpInfo.coupleId);
                EventManager.event(globalEvent.CP_INFO_UPDATE);
            })
        }

        /**
         * 回复某人cp请求
         * @param uid 玩家uid
         * @param result 1同意2拒绝
         */
        replyCp(uid: number, result: number) {
            return net.sendAndWait(new pb.cs_reply_apply_cp({ uid: uid, result: result })).then((data: pb.sc_reply_apply_cp) => {
                //同意的话 需要更新cp信息
                if (result == 1) {
                    this._allCpInfos.add(uid, data.cpInfo);
                    this._currRingId = data.cpInfo.toolId;
                    this._rank = data.rank;
                    this.deleteOtherApply();
                    EventManager.event(globalEvent.CP_INFO_UPDATE);
                    this.onCpRelactionInit();
                }
                else {
                    //拒绝 直接删除信息
                    this._allCpInfos.remove(uid);
                    EventManager.event(globalEvent.CP_APPLY_LIST_UPDATE);
                }
            })
        }

        /**更换戒指 */
        changeRing(ringId: number) {
            return net.sendAndWait(new pb.cs_couple_change_ring({ toolId: ringId })).then(() => {
                this._currRingId = ringId;
                EventManager.event(globalEvent.CP_INFO_UPDATE);
                PeopleManager.getInstance().changeSelfAndCpRing();
            })
        }

        /**
         * 解除cp
         * @param type  1：和离， 2：15天未归强离， 3：强离
         */
        divorce(type: number) {
            return net.sendAndWait(new pb.cs_relieve_cp({ type: type })).then((data: pb.sc_relieve_cp) => {
                //普通解约，有冷静期，需要更新状态
                if (data.cpInfo) {
                    this._allCpInfos.add(data.cpInfo.coupleId, data.cpInfo);
                }
                //强制解除，直接删了
                else {
                    this.onCpRelationBroke(this.cpInfo.coupleId);
                }
                EventManager.event(globalEvent.CP_INFO_UPDATE);
            })
        }

        /**
         * 答复别人的解约申请
         * @param type 1同意解约 2拒绝
         */
        replyDivorce(type: number) {
            return net.sendAndWait(new pb.cs_reply_relieve_cp({ result: type })).then((data: pb.sc_relieve_cp) => {
                //同意解约，直接删除关系
                if (type == 1)
                    this.onCpRelationBroke(this.cpInfo.coupleId);
                //拒绝解约，重置到正常状态
                else
                    this.cpInfo.status = CP_STATU.NORMAL;
                EventManager.event(globalEvent.CP_INFO_UPDATE);
            })
        }

        /**有人向我申请CP */
        private onSomeoneApply(data: pb.sc_apply_cp_notify) {
            if (data?.cpInfo) {
                this._allCpInfos.add(data.cpInfo.coupleId, data.cpInfo);
                EventManager.event(globalEvent.CP_APPLY_LIST_UPDATE);
            }
        }

        /**有人回复了我的CP申请 */
        private onSomeoneReply(data: pb.sc_reply_apply_cp_notify) {
            //别人同意了我发出的申请
            if (data.result == 1) {
                this._allCpInfos.add(data.cpInfo.coupleId, data.cpInfo);
                this._currRingId = data.cpInfo.toolId;
                this._rank = data.rank;
                this.deleteOtherApply();
                this.onCpRelactionInit();
            }
            else {
                this._allCpInfos.remove(data.cpInfo.coupleId);
            }
            EventManager.event(globalEvent.CP_INFO_UPDATE);
        }

        /**我的解约申请有了回复 */
        private onReplyDivorceNotify(data: pb.sc_reply_relieve_cp_notify) {
            //对方同意我的解约，直接删除
            if (data.result == 1) {
                this.onCpRelationBroke(data.uid)
            }
            //对方拒绝我的解约，变回正常状态
            if (data.result == 2) {
                this._allCpInfos.get(data.uid).status = CP_STATU.NORMAL;
            }
            EventManager.event(globalEvent.CP_INFO_UPDATE);
        }

        /**收到解约申请 */
        private onDivorceNotify(data: pb.sc_apply_relieve_cp_notify) {
            //有cpInfo，和平解约
            if (data.cpInfo) {
                this._allCpInfos.add(data.uid, data.cpInfo);
                EventManager.event(globalEvent.CP_DIVORCE_ALERT);
            }
            //否则为强制解约
            else {
                this.onCpRelationBroke(data.uid)
            }
            EventManager.event(globalEvent.CP_INFO_UPDATE);
        }

        /**正式断绝cp关系 */
        private onCpRelationBroke(uid: number) {
            this._allCpInfos.remove(uid);
            util.RedPoint.reqRedPointRefreshArr([11004, 11005]);
            //显示双人背景秀的状态也要下掉
            if (clientCore.LocalInfo.showCp) {
                clientCore.LocalInfo.showCp = false;
                if (BgShowManager.instance.currBgShowId > 0) {
                    let downMap = new util.HashMap<number>();
                    downMap.add(CLOTH_TYPE.Bg, 0);
                    clientCore.BgShowManager.instance.setCurrDecoShow(downMap);
                }
            }
            //结缘礼信息也要清空
            this.selfWeddingInfo = null;
            PeopleManager.getInstance().changeSelfAndCpRing();
            PeopleManager.getInstance().forceDisableCpRing(uid);
        }

        /**cp关系正式成立 */
        private onCpRelactionInit() {
            PeopleManager.getInstance().changeSelfAndCpRing();
            EventManager.event(globalEvent.CP_RELATION_INIT_ALERT);
        }

        private onRingChange(data: pb.sc_cp_change_ring_notify) {
            this._currRingId = data.toolId;
            PeopleManager.getInstance().changeSelfAndCpRing();
            EventManager.event(globalEvent.CP_INFO_UPDATE);
        }

        private onSomeoneCancleApply(data: pb.sc_couple_cancel_wait_notify) {
            this._allCpInfos.remove(data.uid);
            EventManager.event(globalEvent.CP_APPLY_LIST_UPDATE);
            EventManager.event(globalEvent.CP_INFO_UPDATE);
        }

        private onCpOnline(data: pb.sc_cp_online_notify) {
            if (this.cpInfo?.userBase) {
                let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
                info.bgPath = 'res/alert/worldNotice/101.png';
                info.width = 752;
                info.y = 23;
                info.value = `${this.cpInfo.userBase.nick}回到了拉贝尔大陆~`;
                info.sizeGrid = '0,189,0,378';
                alert.showWorlds(info);
            }
        }

        /**某个戒指是否有动效 */
        static checkHaveRingEffect(ringId: number) {
            let xlsInfo = xls.get(xls.cpRing)?.get(ringId);
            return xlsInfo ? xlsInfo.specialEffect == 1 : false;
        }

        /** 从后台刷新一次自己的结缘礼信息*/
        private refreshSelfWeddingInfo() {
            return net.sendAndWait(new pb.cs_get_cp_wedding_info()).then((data: pb.sc_get_cp_wedding_info) => {
                this.selfWeddingInfo = data;
            })
        }

        /**请求一次全部的结缘礼举办信息，有一分钟的节流 */
        refreshAllWeddingInfo() {
            //节流60s
            if ((clientCore.ServerManager.curServerTime - this._lastReqAllWeddingInfoTime) > 20)
                return net.sendAndWait(new pb.cs_get_cp_wedding_list()).then((data: pb.sc_get_cp_wedding_list) => {
                    this._cacheWeddingList = data;
                    this._lastReqAllWeddingInfoTime = clientCore.ServerManager.curServerTime;
                })
            else
                return Promise.resolve();
        }

        /**获取当前时刻正在举行的结缘礼列表 */
        getNowWeddingList() {
            if (this._cacheWeddingList) {
                let now = clientCore.ServerManager.curServerTime;
                return _.filter(this._cacheWeddingList.nowWedding, (o) => {
                    return _.inRange(now - o.startTime, 0, 3600);
                })
            }
            return [];
        }

        /**传入一个uid，获取是否有婚礼 */
        getWeddingInfoByUID(uid: number) {
            let info = _.find(this._annouceList.getValues(), o => o.cps[0].userid == uid || o.cps[1].userid == uid);
            if (info)
                return info
            else
                return null;
        }

        /**自己的结缘礼信息 */
        public get selfWeddingInfo(): pb.Isc_get_cp_wedding_info {
            return this._weddingInfo;
        }
        public set selfWeddingInfo(value: pb.Isc_get_cp_wedding_info) {
            //替换掉缓存列表里面的值
            let weddingId = this._weddingInfo?.weddingInfo?.weddingId;
            if (this._cacheWeddingList) {
                if (value == null) {
                    _.pullAllBy(this._cacheWeddingList.nowWedding, o => o.weddingId == weddingId);
                    _.pullAllBy(this._cacheWeddingList.futureWedding, o => o.weddingId == weddingId);
                }
                else {
                    let now = clientCore.ServerManager.curServerTime;
                    if (_.inRange(now - value.weddingInfo.startTime, 0, 3600)) {
                        this._cacheWeddingList.nowWedding.push(value.weddingInfo);
                    }
                    else {
                        this._cacheWeddingList.futureWedding.push(value.weddingInfo);
                    }
                }
            }
            this._weddingInfo = value;
        }

        /**获取接下来最近的一场结缘礼列表 */
        getNextWeddingList() {
            let nextTime = this.getNextWeddingTime();
            if (nextTime > 0) {
                return _.filter(this._cacheWeddingList.futureWedding, o => o.startTime == nextTime);
            }
            return [];
        }

        /** 根据当前时间获取下一次举办的时间 没有回0 */
        private getNextWeddingTime() {
            let now = clientCore.ServerManager.curServerTime;
            let todayBeginTime = util.TimeUtil.floorTime(Math.floor(util.TimeUtil.formatSecToDate(now).getTime() / 1000));
            let hourArr = xls.get(xls.cpCommonDate).get(1).weddingHour;
            for (const hour of hourArr) {
                let openTime = todayBeginTime + hour * 3600;
                if (now < openTime) {
                    return openTime;
                }
            }
            return 0
        }

        /**cp更改了结缘礼信息 */
        private onCpChangeWeddingInfo(data: pb.sc_cp_wedding_reservation_notify) {
            this.selfWeddingInfo = data;
            this.haveWedding = true;
            EventManager.event(globalEvent.CP_CHANGE_WEDDINGINFO);
        }

        static getWeddingMapIdByOriMapId(id: number) {
            return id == 12 ? 21 : 22;
        }

        private onAnnouce(data: pb.sc_wedding_reservation_world_announce) {
            this._annouceList.add(data.weddingInfo.weddingId, data.weddingInfo);
            switch (data.type) {
                case 1:
                    //婚礼广播
                    this.createWeddingNotify(data.weddingInfo);
                    break;
                case 2:
                    //婚礼开始
                    this.createWeddingJoinNotify(data.weddingInfo);
                    break;
                case 3:
                    //获得捧花
                    alert.showWorlds({
                        bgPath: 'res/alert/worldNotice/101.png',
                        value: `${data.user.nick}在${data.weddingInfo.cps[0].nick}与${data.weddingInfo.cps[1].nick}的结缘礼上获得了代表幸福的纯白花束~`,
                        width: 770,
                        y: 23,
                        sign: alert.Sign.FUNNY_TOY,
                        sizeGrid: '0,189,0,378'
                    });
                    break;
                case 4:
                    //发福袋 
                    this.createRedBagJoinNotify(data.weddingInfo);
                    if (MapInfo.mapID == data.weddingInfo.mapId)
                        alert.showFWords(`${data.user.nick}给朋友发了10个福袋，手快有手慢无~`);
                    break;
                case 5:
                    //发捧花
                    if (MapInfo.mapID == data.weddingInfo.mapId)
                        alert.showFWords(`${data.user.nick}抛出了捧花，快去找到吧！`);
                    break;
                default:
                    break;
            }
        }

        /** 
         * 
        */
        private createWeddingNotify(info: pb.IWeddingInfo) {
            let msg = new pb.chat_msg_t();
            msg.chatType = 1;
            msg.sendUid = 1;
            msg.recvUid = clientCore.LocalInfo.uid;
            let date = util.TimeUtil.formatSecToDate(info.startTime);
            let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            let dateStr = `${date.getMonth() + 1}月${date.getDate()}日${hour}:${min}`;
            let mapName = xls.get(xls.map).get(info.mapId)?.name ?? '啥地图';
            msg.content = `“${info.cps[0].nick}”与“${info.cps[1].nick}”将于${dateStr}在${mapName}进行结缘之礼，欢迎小花仙们共同见证幸福~`;
            msg.sendTime = clientCore.ServerManager.curServerTime;
            msg.special = info.cps[0].userid;
            msg.sendNick = '系统公告';
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, msg);
        }

        private createWeddingJoinNotify(info: pb.IWeddingInfo) {
            let msg = new pb.chat_msg_t();
            msg.chatType = 1;
            msg.sendUid = 0;
            msg.recvUid = clientCore.LocalInfo.uid;
            let mapName = xls.get(xls.map).get(info.mapId)?.name ?? '啥地图';
            msg.content = `“${info.cps[0].nick}”与“${info.cps[1].nick}”正在${mapName}举办结缘之礼，欢迎小花仙们前往观礼~（点击前往）`;
            msg.sendTime = clientCore.ServerManager.curServerTime;
            msg.special = info.cps[0].userid;
            msg.sendNick = '系统公告';
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, msg);
        }

        private createRedBagJoinNotify(info: pb.IWeddingInfo) {
            let msg = new pb.chat_msg_t();
            msg.chatType = 1;
            msg.sendUid = 0;
            msg.recvUid = clientCore.LocalInfo.uid;
            msg.content = `玩家“${info.cps[0].nick}”与“${info.cps[1].nick}”正在结缘礼现场发放结缘福袋~抢到福袋的玩家可以获得幸运哦~（点击前往）`;
            msg.sendTime = clientCore.ServerManager.curServerTime;
            msg.special = info.cps[0].userid;
            msg.sendNick = '系统公告';
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, msg);
        }

        static setCpTitle(id: number) {
            return net.sendAndWait(new pb.cs_set_cp_user_base_show({ type: id })).then(() => {
                alert.showFWords('变更成功！');
                LocalInfo.srvUserInfo.cpShowType = id;
            })
        }

        private onBrideBuyNotify(data: pb.sc_cp_pay_suit_notify) {
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/101.png';
            info.width = 752;
            info.y = 23;
            info.value = `[${data.nick}]向[${data.cpNick}]赠送了一套幽冥花嫁豪华礼包~`;
            info.sizeGrid = '0,189,0,378';
            alert.showWorlds(info);
        }
    }
}