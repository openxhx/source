/// <reference path="../person/Person2.ts" />
namespace clientCore {
    var MAX_USER_NUM: number = 30;
    export class PeopleManager {
        static BASE_SCALE: number = 0.25;
        static RIDER_SCALE: number = 8 / 3;
        private static _instance: PeopleManager;
        private _aimPos: Laya.Point;
        private _currShowFriendNum: number = 0; //当前展示玩家中是好友的个数
        private _realMapUserDic: util.HashMap<pb.IUserBase>;//地图中所有玩家数据（不管是否显示）
        private _currMapOtherUnitDic: util.HashMap<OtherUnit>;//当前地图其他人字典(地图中显示的玩家数据)
        private _otherChangeClothQueue: util.HashMap<pb.Isc_notify_user_change_cloth_in_map>;//他人换装缓存字典（换装需要重建图集,所以不能同时来）
        private _otherCreateQueue: util.HashMap<pb.IUserBase>;

        private _titleT: time.GTime;

        /** 玩家自身*/
        public player: Player;
        private static _showPlayer: boolean = true;

        private onListen: boolean;
        public static getInstance(): PeopleManager {
            if (!PeopleManager._instance) {
                PeopleManager._instance = new PeopleManager();
            }
            return PeopleManager._instance;
        }

        public constructor() {
            this._realMapUserDic = new util.HashMap();
            this._currMapOtherUnitDic = new util.HashMap();
            this._otherChangeClothQueue = new util.HashMap();
            this._otherCreateQueue = new util.HashMap();

            this._titleT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTitle);
            this._titleT.start();
        }

        public createPlayer(): void {
            this.player = new Player();
        }

        public setUp() {
            console.log("加载人物信息……");
            this.player.init(LocalInfo.srvUserInfo);
            this.onSelfChangeCloth();
            this.fixedListen();
            this.startListen();
            //自己
            EventManager.on(globalEvent.USER_CHANGE_CLOTH, this, this.onSelfChangeCloth);
            Laya.timer.frameLoop(1, this, this.fly);
            Laya.timer.loop(5000, this, this.checkFunnyToy);
            let showFlagStr = Laya.LocalStorage.getItem("showPlayerFlag" + LocalInfo.uid);
            PeopleManager._showPlayer = showFlagStr == null || showFlagStr == "1";
        }

        private fixedListen() {
            //登陆后才实行
            if (LocalInfo.srvUserInfo) {
                net.listen(pb.sc_notify_user_enter_map, this, this.onPlayerEnterMap);
                net.listen(pb.sc_notify_user_move_in_map, this, this.onPlayerMove);
                net.listen(pb.sc_notify_user_quit_map, this, this.onPlayerQuitMap);
                EventManager.on(globalEvent.FAMILY_BADGE_CHANGE, this, this.onBadgeChange);
                EventManager.on(globalEvent.USER_LEVEL_UP, this, this.levelUp);
            }
        }

        public startListen() {
            //登陆后才实行
            if (LocalInfo.srvUserInfo && !this.onListen) {
                net.listen(pb.sc_notify_user_change_cloth_in_map, this, this.onPlayerChangeCloth);
                Laya.timer.loop(1000, this, this.applyChangeCloth);//一秒一次换装，防止开销过大
                this.onListen = true;
            }
        }

        public stopListen() {
            if (LocalInfo.srvUserInfo) {
                net.unListen(pb.sc_notify_user_change_cloth_in_map, this, this.onPlayerChangeCloth);
                // net.unListen(pb.sc_notify_user_move_in_map, this, this.onPlayerMove);
                // net.unListen(pb.sc_notify_user_enter_map, this, this.onPlayerEnterMap);
                // net.unListen(pb.sc_notify_user_quit_map, this, this.onPlayerQuitMap);
                Laya.timer.clear(this, this.applyChangeCloth);//一秒一次换装，防止开销过大
                // EventManager.off(globalEvent.FAMILY_BADGE_CHANGE,this,this.onBadgeChange);//不能移除事件，打开模块的时候调用
                this.onListen = false;
            }
        }

        /**根据时间戳更新 */
        private checkFunnyToy() {
            let now = clientCore.ServerManager.curServerTime;
            //别人的
            for (const o of this._currMapOtherUnitDic.getValues()) {
                if (o.data?.propStampInfo) {
                    let needUpdate = false;
                    for (const obj of o.data.propStampInfo) {
                        //有过期的需要更新
                        if (now > obj.clearPropStamp) {
                            needUpdate = true;
                            break;
                        }
                    }
                    if (needUpdate)
                        o.updateFunnyToy(o.data.propStampInfo);
                }
            }
            //自己的
            let needUpdate = false;
            for (const obj of LocalInfo.srvUserInfo.propStampInfo) {
                //有过期的需要更新
                if (now > obj.clearPropStamp) {
                    needUpdate = true;
                    EventManager.event(globalEvent.FUNNY_TOY_INFO_UPDATE);
                    break;
                }
            }
            if (needUpdate)
                this.player.updateFunnyToy(LocalInfo.srvUserInfo.propStampInfo);
        }

        private levelUp() {
            this.player.playLevelUpAni();
        }

        private onBadgeChange() {
            this.player.updateBadge(LocalInfo.srvUserInfo.badgeBase, LocalInfo.srvUserInfo.badgeType);
        }

        //-----------------------------他人-----------------------------------------------
        /**
         * 有人换装
         */
        private onPlayerChangeCloth(data: pb.Isc_notify_user_change_cloth_in_map) {
            if (data.uid != LocalInfo.uid) {
                if (this._currMapOtherUnitDic.has(data.uid))
                    this._otherChangeClothQueue.add(data.uid, data);
            }
        }

        /** 获取场景上的某位玩家（非已）*/
        public getOther(uid: number): OtherUnit {
            return this._currMapOtherUnitDic.get(uid);
        }

        /** 判断某位玩家是否在地图*/
        public checkInMap(uid: number): boolean {
            return clientCore.LocalInfo.uid == uid || this._currMapOtherUnitDic.has(uid) || this._otherCreateQueue.has(uid);
        }

        /**
         * 有人进出地图
         */
        private onPlayerEnterMap(data: pb.Isc_notify_user_enter_map) {
            let uid = data.user.userid;
            this._realMapUserDic.add(uid, data.user);
            if (uid != LocalInfo.uid) {
                //如果是cp，立即创建
                if (uid == CpManager.instance.cpID) {
                    this.createOnePeople(data.user);
                }
                //如果小于上限 则可以继续进入
                else if (this._currMapOtherUnitDic.length + this._otherCreateQueue.length < MAX_USER_NUM) {
                    //如果新进入的是好友，且当前显示的人中有非好友,则需要替换
                    if (FriendManager.instance.checkIsFriend(uid) && this._currShowFriendNum < MAX_USER_NUM) {
                        //移除一个非好友
                        for (const id of this._currMapOtherUnitDic.getKeys()) {
                            if (!FriendManager.instance.checkIsFriend(parseInt(id))) {
                                this.removeOnePeople(id);
                                break;
                            }
                        }
                    }
                    this._otherCreateQueue.add(uid, data.user);
                }
                this.updateFriendShowNum();
            }
        }

        private onPlayerQuitMap(data: pb.Isc_notify_user_quit_map) {
            let uid = data.uid;
            this._realMapUserDic.remove(uid);
            if (uid != LocalInfo.uid) {
                this.removeOnePeople(uid);
                this.updateFriendShowNum();
            }
        }


        /**
         * 有人移动
         */
        private onPlayerMove(data: pb.Isc_notify_user_move_in_map) {
            let uid = data.uid;
            if (this._currMapOtherUnitDic.has(uid)) {
                let p = this._currMapOtherUnitDic.get(uid);
                let len = new Laya.Point(p.x, p.y).distance(data.pos.x, data.pos.y);
                if (len <= 0) return;
                let start = new Laya.Point(p.x, p.y);
                let target = new Laya.Point(data.pos.x, data.pos.y);
                let diff = new Laya.Point(target.x - start.x, target.y - start.y);
                let middlePoint = new Laya.Point(start.x + diff.x * 0.7, start.y + diff.y * 0.7);
                p.flyAcceleration();
                p.reversal(target.x - start.x > 0);
                p.flyTo(middlePoint, target, len);
            }
        }

        /**
         * 执行换装
         */
        private applyChangeCloth() {
            if (!PeopleManager.showPlayerFlag)//如果当前不显示玩家，那么合图可以先暂停下来
            {
                return;
            }
            let queue = this._otherChangeClothQueue.toArray();
            if (queue.length > 0) {
                let changeInfo = queue[0][1];
                let uid = changeInfo.uid;
                if (this._currMapOtherUnitDic.has(uid)) {
                    this._currMapOtherUnitDic.get(uid).replaceClothArr(changeInfo.clothes);
                }
                this._otherChangeClothQueue.remove(uid);
            }
        }

        private applyCreatePeople() {
            let queue = this._otherCreateQueue.toArray();
            if (queue.length > 0) {
                let changeInfo = queue[queue.length - 1][1];
                let uid = changeInfo.userid;
                this.createOnePeople(changeInfo);
                this._otherCreateQueue.remove(uid);
                console.log('待创建' + (queue.length - 1));
            }
            // if (queue.length == 0) {
            //     console.log('场景人物创建完毕')
            //     Laya.timer.clear(this, this.applyCreatePeople);
            // }
        }

        private createOnePeople(data: pb.IUserBase) {
            if (this._currMapOtherUnitDic.has(data.userid))
                return;
            let person: OtherUnit = OtherUnit.create();
            person.init(data);
            person.pos(data.x, data.y);
            this._currMapOtherUnitDic.add(data.userid, person);
            let select: ShowType = data.babyImage ? FlowerPetInfo.analysis(data.babyImage) : FlowerPetInfo.getShow(data.babyVipType, data.babyFreeExp);
            data.babyFollow == 1 && person.creFlowerPet(select.big, select.little, data.x, data.y);
            person.visible = PeopleManager.showPlayerFlag;
            if (MapInfo.mapID == 24) person.checkSwimsuit();
            // if (MapInfo.mapID == 11) person.creatBasket();
            if (data.title && data.isHideTitle == 0) {
                let cls: xls.title = xls.get(xls.title).get(data.title);
                if (cls && (cls.limitTime == 0 || clientCore.ServerManager.curServerTime < data.titleEndTime)) {
                    person.showTitle(pathConfig.getTitlePath(cls.id));
                }
            }
            this.handleCpEffect();
            EventManager.event(globalEvent.PEOPLE_MAP_CREATE_OVER, data);
        }

        private onTitle(): void {
            let array: OtherUnit[] = this._currMapOtherUnitDic.getValues();
            if (array.length <= 0) return;
            _.forEach(array, (element: OtherUnit) => {
                element?.checkTitle();
            })
        }

        private removeOnePeople(uid: number | string) {
            let p: OtherUnit = this._currMapOtherUnitDic.get(uid);
            p && p.dispose();
            this._currMapOtherUnitDic.remove(uid);
            this._otherChangeClothQueue.remove(uid);
            this.handleCpEffect();
        }

        /**处理同地图 */
        private handleCpEffect() {
            let arr = this._realMapUserDic.getValues();
            let needShowEffctIdArr = [];
            for (const a of arr) {
                for (const b of arr) {
                    if (a.cpId == b.userid) {
                        needShowEffctIdArr.push(a.userid);
                        needShowEffctIdArr.push(b.userid);
                    }
                }
            }
            needShowEffctIdArr = _.uniq(needShowEffctIdArr);
            let unitArr = this._currMapOtherUnitDic.toArray();
            for (const pair of unitArr) {
                let uid = parseInt(pair[0]);
                let unit = pair[1];
                if (needShowEffctIdArr.indexOf(uid) > -1) {
                    unit.setCpEffect(this._realMapUserDic.get(uid).cpRing);
                }
                else {
                    unit.setCpEffect(0);
                }
            }
            this.changeSelfAndCpRing();
        }

        /**更换自己和cp的戒指 */
        changeSelfAndCpRing() {
            let mycpId = CpManager.instance.cpID;
            if (this._realMapUserDic.has(mycpId)) {
                let ring = CpManager.instance.currRingId;
                this.player.setCpEffect(ring);
                if (this._currMapOtherUnitDic.has(mycpId))
                    this._currMapOtherUnitDic.get(mycpId).setCpEffect(ring)
            }
            else {
                this.player.setCpEffect(0);
            }
        }

        /**强行下掉一个人的cp戒指特效 */
        forceDisableCpRing(uid: number) {
            if (this._currMapOtherUnitDic.has(uid))
                this._currMapOtherUnitDic.get(uid).setCpEffect(0)
        }

        //-----------------------------自己-----------------------------------------------
        /**
         * 自己换装（发消息的地方已经同步给后台了）
         */
        private onSelfChangeCloth() {
            this.player.changeCloths(LocalInfo.wearingClothIdArr);
        }

        public flyTo(aimPos: Laya.Point) {
            this._aimPos = aimPos;
        }

        private fly(): void {
            if (this._aimPos) {
                let playerPos: Laya.Point = new Laya.Point(this.player.x, this.player.y);
                let dis: number = Math.floor(playerPos.distance(this._aimPos.x, this._aimPos.y));
                if (dis > 1) {
                    var xMoveDis: number = (this._aimPos.x - playerPos.x) / 6;
                    var yMoveDis: number = (this._aimPos.y - playerPos.y) / 6;
                    this.player.x += xMoveDis;
                    this.player.y += yMoveDis;
                    this.player.reversal(xMoveDis > 0);
                }
                else {
                    this._aimPos = null;
                    EventManager.event(globalEvent.PLAYER_FLY_COMPLETE);
                }
            }
        }

        public getMyPosition(): Laya.Point {
            return new Laya.Point(this.player.x, this.player.y);
        }

        public removeAllPeople() {
            this._currShowFriendNum = 0;
            this._realMapUserDic.clear();
            this._otherCreateQueue.clear();
            this._otherChangeClothQueue.clear();
            let keys = this._currMapOtherUnitDic.getKeys();
            keys.forEach(key => {
                this.removeOnePeople(key);
            });
            Laya.timer.clear(this, this.applyCreatePeople);
        }

        public addMapPeople(dataArr: pb.IUserBase[]) {
            /**如果是在boss地图里面，创建人物数量最大值为15 */
            MAX_USER_NUM = MapInfo.type == 4 ? 15 : 30;

            this._otherCreateQueue.clear();
            //优先加好友
            for (let info of dataArr) {
                this._realMapUserDic.add(info.userid, info);
                if (info.userid != LocalInfo.uid && this._otherCreateQueue.length <= MAX_USER_NUM && FriendManager.instance.checkIsFriend(info.userid)) {
                    this._otherCreateQueue.add(info.userid, info);
                }
            }
            this.updateFriendShowNum();
            //不满上限 还可以加入非好友
            if (this._currShowFriendNum <= MAX_USER_NUM) {
                for (let info of dataArr) {
                    if (info.userid != LocalInfo.uid && this._otherCreateQueue.length <= MAX_USER_NUM && !FriendManager.instance.checkIsFriend(info.userid)) {
                        this._otherCreateQueue.add(info.userid, info);
                    }
                }
            }
            EventManager.once(globalEvent.ENTER_MAP_SUCC, this, () => {
                if (MapInfo.type == 4) {
                    Laya.timer.loop(1000, this, this.applyCreatePeople);
                }
                else {
                    Laya.timer.loop(200, this, this.applyCreatePeople);
                }
            });

        }

        /**计算下当前地图中显示的好友数 */
        private updateFriendShowNum() {
            this._currShowFriendNum = 0;
            for (let id of this._currMapOtherUnitDic.getKeys()) {
                if (FriendManager.instance.checkIsFriend(parseInt(id)))
                    this._currShowFriendNum++;
            }
        }

        public setPlayersVisible(isShow: boolean): void {
            let allMapPlayers = this._currMapOtherUnitDic.getValues();
            for (let i = 0; i < allMapPlayers.length; i++) {
                allMapPlayers[i].visible = isShow;
            }
        }

        public static get showPlayerFlag(): boolean {
            return this._showPlayer;
        }
        public static set showPlayerFlag(f: boolean) {
            if (this._showPlayer != f) {
                this._showPlayer = f;
                PeopleManager.getInstance().setPlayersVisible(this._showPlayer);
                Laya.LocalStorage.setItem("showPlayerFlag" + LocalInfo.uid, f ? "1" : "0");
            }
        }

        public craeteCopy() {
            this.createOnePeople(LocalInfo.srvUserInfo);
        }

        public replace() {
            this._currMapOtherUnitDic.get(LocalInfo.uid).replaceClothArr(LocalInfo.wearingClothIdArr);
        }

        /**获取当前地图所有玩家id */
        public getAllPlayerIdInMap() {
            if (!this._realMapUserDic) return [];
            return this._realMapUserDic.getKeys();
        }

    }
}