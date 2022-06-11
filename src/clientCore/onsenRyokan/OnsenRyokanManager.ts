namespace clientCore {
    /**
     * 温泉会馆
     */
    export class OnsenRyokanManager {
        private constructor() {
            net.listen(pb.sc_hot_spring_user_status_notify, this, this.userChange);
        }
        /**玩家数据 */
        private userInfo: util.HashMap<pb.IHotSpringU>;
        /**托盘交互次数 */
        public panTimes: number;
        /**托盘最大交互次数 */
        public maxPanTimes: number = 20;
        /**花朵点击次数 */
        public huaTimes: number;
        /**花朵最大点击次数 */
        public maxHuaTimes: number = 60;
        /**打瞌睡点击次数 */
        public sleepTimes: number;
        /**打瞌睡最大点击次数 */
        public maxSleepTimes: number = 60;
        /**自己开始泡的时间 */
        public selfBeginTime: number;
        /**今日获得花朵数 */
        public flowerCnt: number;
        /**今日挂机花朵数 */
        public hangUpNum: number;
        /**最大挂机花朵数 */
        public maxHangUpNum: number = 120;
        /**托盘 */
        public pan: Laya.Image;
        /**落花 */
        public hua: Laya.Image;
        /**温泉动画 */
        private ani: clientCore.Bone;
        /**睡着的玩家id */
        public sleepUID: number;
        /**玩家睡着动画 */
        private sleepAni: clientCore.Bone;
        public getInfo() {
            net.sendAndWait(new pb.cs_get_hot_spring_info()).then((msg: pb.sc_get_hot_spring_info) => {
                if (!this.userInfo) this.userInfo = new util.HashMap();
                else this.userInfo.clear();
                this.panTimes = msg.games;
                this.huaTimes = msg.clickNum;
                this.flowerCnt = msg.flowerCnt;
                this.sleepTimes = msg.sleepNum;
                this.hangUpNum = msg.hangUpNum;
                for (let i: number = 0; i < msg.users.length; i++) {
                    this.userInfo.add(msg.users[i].uid, msg.users[i]);
                }
                clientCore.Logger.sendLog('2022年1月7日活动', '【主活动】温泉会馆', '进入温泉地图');
                clientCore.MapManager.enterActivityMap(24);
                EventManager.once(globalEvent.ENTER_MAP_SUCC, this, () => {
                    this.ani = clientCore.BoneMgr.ins.play("res/animate/onsenRyokan/hotspring.sk", 0, true, MapManager.effectLayer);
                    this.ani.pos(0, 1200);
                })
            });
        }

        public getOneInfo(uid: number) {
            return this.userInfo.get(uid);
        }

        private userChange(msg: pb.sc_hot_spring_user_status_notify) {
            if (msg.status == 0) {//离开
                this.userInfo.remove(msg.uid);
                let player: PersonUnit;
                if (msg.uid == LocalInfo.uid) {
                    player = PeopleManager.getInstance().player;
                    this.selfBeginTime = 0;
                    this.hua && (this.hua.visible = false);
                    this.pan && (this.pan.visible = false);
                } else {
                    player = PeopleManager.getInstance().getOther(msg.uid);
                }
                if (!player) return;
                this.checkSleep(msg.uid);
                player.setSwimsuitVisible(false);
                player.pos(1108, 344);
            } else {//进入
                this.userInfo.add(msg.uid, { uid: msg.uid, pos: 1, image: msg.image, sex: msg.sex });
                let player: PersonUnit;
                if (msg.uid == LocalInfo.uid) {
                    player = PeopleManager.getInstance().player;
                    net.send(new pb.cs_move_in_map({ pos: { x: 1288, y: 688 } }));
                } else {
                    player = PeopleManager.getInstance().getOther(msg.uid);
                }
                if (!player) return;
                player.showSwimsuit(msg.sex, msg.image);
                player.setSwimsuitVisible(true);
                player.pos(1288, 688);
            }
        }

        public outOnsenRyokan() {
            let player = PeopleManager.getInstance().player;
            player.setSwimsuitVisible(false);
            this.selfBeginTime = 0;
            this.ani.dispose();
            this.sleepAni?.dispose();
            this.sleepAni = this.ani = null;
        }

        /**替换玩家衣服为浴衣
         * @param arr id数组
         */
        static getCloths(arr: number[], sex: number) {
            let xlsHash = xls.get(xls.itemCloth);
            let res = _.filter(arr, (id) => {
                return xlsHash.has(id)
                    && (xlsHash.get(id).kind == CLOTH_TYPE.Hair
                        || xlsHash.get(id).kind == CLOTH_TYPE.Wing
                        || xlsHash.get(id).kind == CLOTH_TYPE.Eyebrow
                        || xlsHash.get(id).kind == CLOTH_TYPE.Eye
                        || xlsHash.get(id).kind == CLOTH_TYPE.Mouth
                        || xlsHash.get(id).kind == CLOTH_TYPE.Skin)
            });
            if (sex == 1) {
                res.push(115828, 115829);
            } else {
                res.push(115830, 115831);
            }
            return res;
        }

        /**展示托盘交互 */
        public async showPan() {
            if (!this.pan) {
                this.pan = new Laya.Image("main/onsenRyokan/qing_jiu.png");
                this.pan.anchorX = 0.5;
                this.pan.anchorY = 0.5;
                this.pan.scale(0.8, 0.8);
                BC.addEvent(this, this.pan, Laya.Event.CLICK, this, this.pickPan);
            }
            MapManager.curMap.pickLayer.addChild(this.pan);
            this.pan.pos(1313, 654);
            this.pan.visible = true;
            Laya.Tween.to(this.pan, { x: 1547, y: 732 }, 10000);
        }

        /**隐藏托盘交互 */
        public hidePan() {
            this.pan && (this.pan.visible = false);
        }

        /**展示落花 */
        public showHua() {
            if (!this.hua) {
                this.hua = new Laya.Image("main/onsenRyokan/icon_te_shu_hua_duo.png");
                this.hua.anchorX = 0.5;
                this.hua.anchorY = 0.5;
                BC.addEvent(this, this.hua, Laya.Event.CLICK, this, this.pickHua);
            }
            MapManager.curMap.pickLayer.addChild(this.hua);
            this.hua.pos(700, 0);
            this.hua.visible = true;
            Laya.Tween.to(this.hua, { x: 1400, y: 1200 }, 10000, null, Laya.Handler.create(this, () => {
                if (this.hua.visible) this.showHua();
            }));
        }

        /**拾取落樱 */
        private pickHua() {
            this.hua.visible = false;
            EventManager.event("ONSENRYOKAN_PICK_HUA");
        }

        /**点击托盘 */
        private pickPan() {
            EventManager.event("ONSENRYOKAN_PICK_PAN");
        }

        public showSleepAni() {
            if (this.sleepAni) {
                console.error("睡着动画重复创建");
                return;
            }
            let other = this.getOneOther();
            if (!other) return;
            this.sleepUID = other.uid;
            let player = PeopleManager.getInstance().getOther(other.uid);
            let sexString = other.sex == 1 ? "F" : "M";
            player._swim.swimVisible = false;
            this.sleepAni = clientCore.BoneMgr.ins.play("res/swimsuit/cha.sk", sexString + "sleep" + other.image, true, player._swim.base, null, true);
            this.sleepAni.scaleX = player._swim.scaleX;
            this.sleepAni.scaleY = player._swim.scaleY;
            this.sleepAni.pos(0, player._swim.height / 2);
            this.sleepAni.on(Laya.Event.CLICK, this, this.onSleepClick);
        }

        private getOneOther(): pb.IHotSpringU {
            let all = this.userInfo.getKeys();
            if (all.length == 1) {
                EventManager.event("ONSENRYOKAN_OUT_SLEEP");
                return;
            }
            let other = parseInt(all[Math.floor(Math.random() * all.length)]);
            if (other == LocalInfo.uid) return this.getOneOther();
            return this.getOneInfo(other);
        }

        private onSleepClick() {
            EventManager.event("ONSENRYOKAN_HIT_SLEEP", this.sleepUID);
            this.hideSleepAni();
        }

        private hideSleepAni() {
            let player = PeopleManager.getInstance().getOther(this.sleepUID);
            player._swim.swimVisible = true;
            this.sleepUID = 0;
            this.sleepAni.dispose();
            this.sleepAni = null;
        }

        private checkSleep(uid: number) {
            if (this.sleepUID == uid) {
                this.hideSleepAni();
                EventManager.event("ONSENRYOKAN_OUT_SLEEP");
            }
        }

        private static _ins: OnsenRyokanManager;
        public static get ins(): OnsenRyokanManager {
            return this._ins || (this._ins = new OnsenRyokanManager());
        }
    }
}