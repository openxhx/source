namespace clientCore {
    /**
     * 拯救小花仙全局管理
     */
    export class SaveFaeryManager {
        /**今日已交互次数 */
        public eventTimes: number;
        /**变木头cd */
        public limitCd: number;
        /**重新展示cd */
        private creatCd: number;
        /**坐标 */
        private allpos: xls.pair[];
        /**玩家点击实例 */
        private display: Laya.Image;
        /**怪物 */
        private monsterAni: clientCore.Bone;
        /**怪物形象id */
        private monsterId: number;
        /**人偶 */
        private person: clientCore.Person;
        /**人偶性别 */
        private sex: number;
        /**人偶套装 */
        private curSuit: number;
        /**限制特效 */
        private limitAni: clientCore.Bone;
        /**关卡id */
        private stageId: number;
        /**当前活动地图 */
        private eventMap: number;
        /**怪物气泡 */
        private talkMonster: Laya.Label;
        /**人物气泡 */
        private talkRole: Laya.Label;
        /**
         * 获得活动信息
         */
        public async setup() {
            if (clientCore.SystemOpenManager.ins.checkActOver(225)) {
                return;
            }
            this.eventMap = 17;
            this.allpos = [{ v1: 517, v2: 471 }, { v1: 1149, v2: 476 }, { v1: 1541, v2: 415 }, { v1: 1740, v2: 1199 }];
            let curTime = clientCore.ServerManager.curServerTime;
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-1-28 00:00:00")) {
                this.eventMap = 14;
                this.allpos = [{ v1: 1254, v2: 791 }, { v1: 1510, v2: 1245 }, { v1: 1823, v2: 790 }, { v1: 2044, v2: 736 }];
            } else if (curTime < util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")) {
                this.eventMap = 15;
                this.allpos = [{ v1: 2350, v2: 780 }, { v1: 1604, v2: 177 }, { v1: 1180, v2: 692 }, { v1: 880, v2: 392 }];
            }
            await xls.load(xls.monsterBase);
            await net.sendAndWait(new pb.cs_save_hua_info()).then((msg: pb.sc_save_hua_info) => {
                this.eventTimes = msg.gameTime;
            })
            net.listen(pb.sc_save_hua_wood_notify, this, this.changeWood);
            net.listen(pb.sc_save_hua_clean_up_notify, this, this.clearWood);
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
            EventManager.on(globalEvent.ENTER_MAP_SUCC, this, this.ShowMonster);
            EventManager.on("BATTLE_FIGHT_FINISH", this, this.onFightOver);
            EventManager.on("BATTLE_FIGHT_EXIT", this, this.reShowMonster);
            EventManager.on("SAVE_FAERY_FIGHT_EXIT", this, this.reShowMonster);
            EventManager.on(globalEvent.ORDER_FINISH, this, this.onOrderFinish);
        }

        private onOrderFinish() {
            alert.showFWords("勇气积分+10");
        }

        /**战斗结束 */
        private onFightOver(stage: number, result: number) {
            if (stage != this.stageId) return;
            net.sendAndWait(new pb.cs_save_hua_battle_finsh({ flag: result })).then((msg: pb.sc_save_hua_battle_finsh) => {
                this.eventTimes = msg.gameTime;
                this.ShowMonster();
                if (msg.type == 1 || msg.type == 4) {
                    clientCore.ModuleManager.open("saveFaeryInteract.CommonResultPanel", { uid: 0, sex: this.person.sex, cloths: this.person.getWearginIds(), monster: this.monsterId, type: msg.type, point: msg.courage, item: msg.item });
                } else if (msg.type == 2) {
                    net.send(new pb.cs_save_hua_cant_move({ mapId: this.eventMap }));
                    this.limitCd = 20;
                    Laya.timer.loop(1000, this, this.onTime);
                    LocalInfo.onLimit = true;
                    clientCore.ModuleManager.open("saveFaeryInteract.CommonResultPanel", { uid: 0, sex: this.person.sex, cloths: this.person.getWearginIds(), monster: this.monsterId, type: msg.type, point: msg.courage, item: msg.item });
                } else if (msg.type == 3) {
                    clientCore.ModuleManager.open("saveFaeryInteract.SpecialSuccessPanel", { point: msg.courage, item: msg.item });
                }
            })
        }

        /**跨天检查奖励时段 */
        private onOverDay() {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime == util.TimeUtil.formatTimeStrToSec("2022-1-28 00:00:00")) {
                this.eventMap = 15;
            } else if (curTime == util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")) {
                this.eventMap = 17;
            }
        }

        /**变木头 */
        private changeWood(msg: pb.sc_save_hua_wood_notify) {
            this.showEffect(msg.uid, true);
        }

        /**清除木头 */
        private clearWood(msg: pb.sc_save_hua_clean_up_notify) {
            this.showEffect(msg.uid, false);
        }

        /** */
        public showEffect(uid: number, flag: boolean) {
            let player: PersonUnit;
            if (uid == LocalInfo.uid) {
                player = PeopleManager.getInstance().player;
                LocalInfo.onLimit = flag;
            } else {
                player = PeopleManager.getInstance().getOther(uid);
            }
            if (!player) return;
            if (flag) {
                player.showLimitEffect();
            } else {
                player.clearLimitEffect();
            }
        }

        private monsterTalk: string[] = ["东西交出来， 我不打你~", "哈， 抓到一只小花仙~", "死心吧， 没人会来救你的~", "你怎么这么穷， 包袱里就几片花瓣？", "实力这么弱还敢逞强， 哼！"];
        private roleTalk: string[] = ["我我我， 就不交出来。。。", "救命啊！", "即便被打败， 我也是英雄！", "地地地， 主家也没有余粮啊！", "英勇的塔巴斯大人 不会放过你的！"];
        /**展示礼盒 */
        public ShowMonster() {
            if (LocalInfo.userLv < 8) return;
            // if (this.eventTimes >= 20) return;
            if (MapInfo.mapID != this.eventMap) return;
            if (!this.display) {
                this.display = new Laya.Image();
                this.display.width = 300;
                this.display.height = 180;
                this.display.mouseEnabled = true;
                this.display.mouseThrough = false;
                let di1 = new Laya.Image("res/swimsuit/di_talk.png");
                this.display.addChild(di1);
                di1.pos(-88, -62);
                let di2 = new Laya.Image("res/swimsuit/di_talk.png");
                this.display.addChild(di2);
                di2.pos(240, -95);
                di2.anchorX = 0.5
                di2.scaleX = -1;
                this.talkMonster = new Laya.Label();
                this.talkMonster.font = "汉仪中圆简";
                this.talkMonster.fontSize = 20;
                this.talkMonster.color = "#5c60ca";
                this.talkMonster.align = "center";
                this.talkMonster.width = 187;
                this.talkMonster.height = 44;
                this.talkMonster.wordWrap = true;
                this.talkMonster.valign = "middle";
                di1.addChild(this.talkMonster);
                this.talkMonster.pos(11, 17);

                this.talkRole = new Laya.Label();
                this.talkRole.font = "汉仪中圆简";
                this.talkRole.fontSize = 20;
                this.talkRole.color = "#5c60ca";
                this.talkRole.align = "center";
                this.talkRole.width = 187;
                this.talkRole.height = 44;
                this.talkRole.wordWrap = true;
                this.talkRole.valign = "middle";
                this.talkRole.anchorX = 0.5;
                this.talkRole.scaleX = -1;
                di2.addChild(this.talkRole);
                this.talkRole.pos(105, 17);
                MapManager.mapItemsLayer.addChildAt(this.display, 0);
                BC.addEvent(this, this.display, Laya.Event.CLICK, this, this.fightMonster);
                this.display.visible = false;
            }
            if (!this.display.parent) MapManager.mapItemsLayer.addChildAt(this.display, 0);
            if (this.display.visible) return;
            let talkIdx = Math.floor(Math.random() * this.monsterTalk.length);
            this.talkMonster.text = this.monsterTalk[talkIdx];
            this.talkRole.text = this.roleTalk[talkIdx];
            this.stageId = this.getRandomStage();
            let config = xls.get(xls.stageBase).get(this.stageId);
            let monsterInfo: xls.monsterBase = xls.get(xls.monsterBase).get(config.display);
            this.monsterId = monsterInfo.monAppear;
            this.monsterAni?.dispose();
            this.monsterAni = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(monsterInfo.monAppear), "idle", true, this.display);
            this.monsterAni.pos(100, 180);
            this.monsterAni.scaleX = -1;
            this.sex = Math.ceil(Math.random() * 2);
            this.curSuit = [2110582, 2110587, 2110588, 2110583][Math.floor(Math.random() * 4)];
            this.person?.destroy();
            this.person = new clientCore.Person(this.sex, this.getDefultFace());
            this.person.scale(0.25, 0.25);
            this.display.addChild(this.person);
            this.person.pos(200, 80);
            this.person.replaceByIdArr(SuitsInfo.getSuitInfo(this.curSuit, this.sex).clothes);
            this.limitAni?.dispose();
            this.limitAni = clientCore.BoneMgr.ins.play("res/animate/activity/effect.sk", 0, true, this.person);
            let idx = Math.floor(Math.random() * this.allpos.length);
            this.display.pos(this.allpos[idx].v1, this.allpos[idx].v2);
            this.display.visible = true;
        }

        private getRandomStage() {
            let random = Math.floor(Math.random() * 100);
            if (random < 20) return 60138;
            if (random < 35) return 60139;
            if (random < 50) return 60140;
            if (random < 60) return 60141;
            if (random < 70) return 60142;
            if (random < 80) return 60143;
            if (random < 88) return 60144;
            if (random < 95) return 60145;
            if (random < 98) return 60146;
            return 60147;
        }

        private getDefultFace() {
            if (clientCore.LocalInfo.sex == 1) {
                return [4100205, 4100206, 4100207];
            } else {
                return [4100208, 4100209, 4100210];
            }
        }

        private async fightMonster() {
            if (LocalInfo.onLimit) return;
            this.display.visible = false;
            let path: string = "atlas/fightInfo.atlas";
            if (!Laya.loader.getRes(path)) {
                clientCore.LoadingManager.showSmall();
                await res.load(path, Laya.Loader.ATLAS);
                clientCore.LoadingManager.hideSmall();
            }
            clientCore.ModuleManager.open("saveFaeryInteract.SaveFaeryFightInfo", this.stageId);
            // clientCore.LoadingManager.showSmall();
            // await clientCore.SceneManager.ins.register();
            // clientCore.LoadingManager.hideSmall(true);
            // clientCore.ModuleManager.closeAllOpenModule();
            // clientCore.SceneManager.ins.battleLayout(6, this.stageId);
        }

        private reShowMonster() {
            if(this.display && MapInfo.mapID == this.eventMap) this.display.visible = true;
        }

        private onTime() {
            this.limitCd--;
            if (this.limitCd <= 0) {
                LocalInfo.onLimit = false;
                this.clearLimit(LocalInfo.uid);
                Laya.timer.clear(this, this.onTime);
            }
        }

        public clearLimit(id: number) {
            // this.showEffect(id, false);
            net.send(new pb.cs_save_hua_clean({ uid: id, mapId: MapInfo.mapID }));
        }

        private constructor() { }
        private static _slef: SaveFaeryManager;
        public static get ins(): SaveFaeryManager {
            if (!this._slef) this._slef = new SaveFaeryManager();
            return this._slef;
        }
    }
}