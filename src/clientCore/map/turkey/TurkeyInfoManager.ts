namespace clientCore {
    /**
     * 2022.3.25
     * 火鸡
     * 二周年庆典
     */
    export class TurkeyInfoManeger {
        /**每日最大捕捉次数 */
        public readonly MAX_CATCH_COUNT: number = 20;
        /**今日已捕捉好友id */
        public doneFriendsIds: number[];
        /**今日自己家园剩余火鸡数量 */
        public selfCount: number;
        /**自己家园场景中的火鸡实体 */
        public turkeyItems: Bone[];
        /**自己家园场景中火鸡形象id */
        public turkeyIds: number[];
        /**自己家园中的火鸡点击 */
        // private turkeyClick: Laya.Sprite[];
        /**好友家园中的火鸡实体 */
        public turkeyItem: Bone;
        /**好友家园中火鸡形象 */
        public turkeyId: number;
        /**好友家园中的火鸡点击 */
        // private friendClick: Laya.Sprite;
        /**捉鸡标志 */
        public catching: boolean;
        /**是否显示火鸡 */
        private _show: boolean;
        /**移动速度 */
        private _speed: number = 1;
        /**角色移动 */
        private _onMove: boolean;
        /**火鸡坐标 */
        private allpos: xls.pair[] = [
            { v1: 3640, v2: 1000 }, { v1: 3934, v2: 1054 }, { v1: 2620, v2: 1076 }, { v1: 2700, v2: 1274 }, { v1: 2466, v2: 1174 },
            { v1: 2320, v2: 1292 }, { v1: 2164, v2: 1170 }, { v1: 2000, v2: 1244 }, { v1: 2300, v2: 994 }, { v1: 2000, v2: 970 },
            { v1: 1784, v2: 800 }, { v1: 534, v2: 700 }, { v1: 1454, v2: 1366 }, { v1: 1146, v2: 1140 }, { v1: 1244, v2: 1308 },
            { v1: 1000, v2: 1304 }, { v1: 772, v2: 1210 }, { v1: 482, v2: 1212 }, { v1: 700, v2: 1386 }, { v1: 1030, v2: 1494 },
            { v1: 1086, v2: 1722 }, { v1: 766, v2: 1620 }, { v1: 790, v2: 1840 }, { v1: 552, v2: 1720 }, { v1: 2080, v2: 1936 },
            { v1: 1782, v2: 1906 }, { v1: 1756, v2: 2126 }, { v1: 1472, v2: 1956 }, { v1: 530, v2: 1516 }, { v1: 2102, v2: 740 }
        ]
        /////////////////////////////
        public point: number;//二周年活动-庆典积分

        private curPos: xls.pair[];
        private dirArr: xls.pair[];
        private friendPos: xls.pair;
        constructor() { }

        public async setup() {
            // if (clientCore.SystemOpenManager.ins.checkActOver(230)) {
            //     return;
            // }
            // let flag = await clientCore.MedalManager.getMedal([MedalConst.RUNNING_TURKEY_IN_OUT]);
            // this._show = flag[0].value == 0;
            this._show = true;
            await this.updataDay();
            EventManager.on(globalEvent.JOY_STICK_START, this, this.startCheckPos);
            EventManager.on(globalEvent.JOY_STICK_END, this, this.endCheckPos);
            EventManager.on(globalEvent.ENTER_MAP_SUCC, this, this.showTurkey);
            if (LocalInfo.userLv < 8) EventManager.on(globalEvent.USER_LEVEL_UP, this, this.onUpdate);
            // await res.load("res/animate/halloweenCandy/nangua1.png");
            // await res.load("res/animate/halloweenCandy/nangua2.png");
            // await res.load("res/animate/halloweenCandy/nangua3.png");
        }

        private async updataDay() {
            let time = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) + util.TimeUtil.DAYTIME - clientCore.ServerManager.curServerTime;
            Laya.timer.once(time * 1000, this, this.updataDay);
            let msg = await this.getTurkeyInfo();
            this.selfCount = 10 - msg.ownTime;
            this.doneFriendsIds = msg.friendUid;
            if (this.turkeyItems) {
                this.showTurkey();
            }
        }

        private getTurkeyInfo() {
            return net.sendAndWait(new pb.cs_second_anniversary_celebration_info()).then((msg: pb.sc_second_anniversary_celebration_info) => {
                return Promise.resolve(msg);
            });
        }

        /**玩家升级 */
        private onUpdate() {
            if (LocalInfo.userLv < 8) return;
            EventManager.off(globalEvent.USER_LEVEL_UP, this, this.onUpdate);
            this.showTurkey();
        }

        /**展示火鸡实例 */
        private showTurkey() {
            if (LocalInfo.userLv < 8) return;
            let allPet = [11, 21, 41, 42, 46, 47];
            if (!this.turkeyItem) {
                let ranNum = allPet[Math.floor(Math.random() * 6)];
                this.turkeyItem = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(Math.floor(ranNum / 10), ranNum % 10), "fly", true, MapManager.mapUpLayer);
                this.turkeyId = ranNum;
                // this.friendClick = this.getClickArea();
                // this.friendClick.visible = false;
                this.turkeyItem.visible = false;
            }
            if (!this.turkeyItems) {
                this.turkeyItems = [];
                this.turkeyIds = [];
                // this.turkeyClick = [];
                for (let i: number = 0; i < 10; i++) {
                    let ranNum = allPet[Math.floor(Math.random() * 6)];
                    this.turkeyItems[i] = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(Math.floor(ranNum / 10), ranNum % 10), "fly", true, MapManager.mapUpLayer);
                    this.turkeyIds[i] = ranNum;
                    // this.turkeyClick[i] = this.getClickArea();
                    // this.turkeyClick[i].visible = false;
                    this.turkeyItems[i].visible = false;
                }
            }
            Laya.timer.clear(this, this.onFrame);
            if (MapInfo.type == 1 && this._show) {
                if (parseInt(MapInfo.mapData) == LocalInfo.uid) {
                    this.curPos = [];
                    for (let i: number = 0; i < this.turkeyItems.length; i++) {
                        if (i < this.selfCount) {
                            let pos = this.getRandomPos();
                            this.curPos.push(pos);
                            if (this.turkeyItems[i].skeleton && !this.turkeyItems[i].skeleton.parent)
                                MapManager.mapUpLayer.addChild(this.turkeyItems[i].skeleton);
                            // if (!this.turkeyClick[i].parent) MapManager.mapItemsLayer.addChildAt(this.turkeyClick[i], 0);
                            this.turkeyItems[i].pos(pos.v1, pos.v2);
                            // this.turkeyItems[i].play(1, true);
                            this.turkeyItems[i].scaleX = Math.random() < 0.5 ? 0.3 : -0.3;
                            this.turkeyItems[i].scaleY = 0.3;
                            this.turkeyItems[i].visible = true;
                            // this.turkeyClick[i].pos(pos.v1 - 37, pos.v2 - 62);
                            // this.turkeyClick[i].visible = true;
                        } else {
                            this.curPos.push({ v1: 0, v2: 0 });
                            this.turkeyItems[i].visible = false;
                            // this.turkeyClick[i].visible = false;
                        }
                    }
                    this.turkeyItem.visible = false;
                    // this.friendClick.visible = false;
                    if (this.selfCount > 0) Laya.timer.frameLoop(2, this, this.onFrame);
                } else {
                    for (let i: number = 0; i < this.turkeyItems.length; i++) {
                        this.turkeyItems[i].visible = false;
                        // this.turkeyClick[i].visible = false;
                    }
                    if (this.doneFriendsIds.indexOf(parseInt(MapInfo.mapData)) < 0) {
                        if (this.turkeyItem.skeleton && !this.turkeyItem.skeleton.parent)
                            MapManager.mapUpLayer.addChild(this.turkeyItem.skeleton);
                        // if (!this.friendClick.parent) MapManager.mapItemsLayer.addChildAt(this.friendClick, 0);
                        this.friendPos = this.allpos[Math.floor(Math.random() * this.allpos.length)];
                        this.turkeyItem.pos(this.friendPos.v1, this.friendPos.v2);
                        // this.turkeyItem.play(1, true);
                        this.turkeyItem.scaleX = 0.3;
                        this.turkeyItem.scaleY = 0.3;
                        this.turkeyItem.visible = true;
                        // this.friendClick.visible = true;
                        // this.friendClick.pos(this.friendPos.v1 - 37, this.friendPos.v2 - 62);
                        Laya.timer.frameLoop(2, this, this.onFrame);
                    } else {
                        this.turkeyItem.visible = false;
                        // this.friendClick.visible = false;
                    }
                }
            } else {
                for (let i: number = 0; i < this.turkeyItems.length; i++) {
                    this.turkeyItems[i].visible = false;
                }
                this.turkeyItem.visible = false;
            }
        }

        // protected getClickArea() {
        //     let trigger = new Laya.Sprite();
        //     trigger.width = 74;
        //     trigger.height = 72;
        //     trigger.graphics.clear();
        //     trigger.graphics.drawRect(0, 0, trigger.width, trigger.height, "#000000");
        //     trigger.alpha = 0;
        //     MapManager.mapItemsLayer.addChildAt(trigger, 0);
        //     BC.addEvent(this, trigger, Laya.Event.CLICK, this, this.jumpEvent);
        //     return trigger;
        // }

        // private jumpEvent() {
        //     if (parseInt(MapInfo.mapData) != LocalInfo.uid) return;
        //     ModuleManager.open("halloweenElf.HalloweenElfModule");
        // }

        private onFrame() {
            if (parseInt(MapInfo.mapData) == LocalInfo.uid) {
                for (let i: number = 0; i < this.turkeyItems.length; i++) {
                    if (this.turkeyItems[i].visible && this.turkeyItems[i].isLoop) {
                        this.turkeyMove(this.turkeyItems[i], null, this.curPos[i]);
                    }
                }
            } else {
                if (this.turkeyItem.visible && this.turkeyItem.isLoop) {
                    this.turkeyMove(this.turkeyItem, null, this.friendPos);
                }
            }
            this.checkPos();
        }

        private turkeyMove(turkey: clientCore.Bone, click: Laya.Sprite, orig: xls.pair) {
            let origPos = new Laya.Point(orig.v1, orig.v2);
            let limit = Math.random() * 50 + 50;
            if (origPos.distance(turkey.x, turkey.y) > limit) {
                turkey.scaleX = orig.v1 < turkey.x ? 0.3 : -0.3;
            }
            turkey.x -= turkey.scaleX * this._speed;
            // click.x -= turkey.scaleX * this._speed;
        }

        private getRandomPos(): xls.pair {
            let index = Math.floor(Math.random() * this.allpos.length);
            if (this.curPos.indexOf(this.allpos[index]) < 0) {
                return this.allpos[index];
            } else {
                return this.getRandomPos();
            }
        }

        /**玩家开始移动 */
        private startCheckPos() {
            if (!this._show) return;
            this._onMove = true;
        }

        /**玩家停止移动 */
        private endCheckPos() {
            if (!this._show) return;
            this._onMove = false;
        }

        /**检查火鸡位置 */
        private checkPos() {
            if (!this._onMove) return;
            let people = PeopleManager.getInstance().getMyPosition();
            people.y -= 20;
            if (MapInfo.type == 1) {
                if (parseInt(MapInfo.mapData) == LocalInfo.uid) {
                    for (let i: number = 0; i < this.turkeyItems.length; i++) {
                        if (this.turkeyItems[i].visible && people.distance(this.turkeyItems[i].x + 37, this.turkeyItems[i].y + 36) < 100) {
                            MapManager._moveImp.disableMove();
                            this._onMove = false;
                            // this.turkeyItems[i].play(0, false, Laya.Handler.create(this, () => {
                            this.turkeyItems[i].visible = false;
                            this.catchTurkey(this.turkeyIds[i]);
                            // }));
                            return;
                        }
                    }
                } else {
                    if (this.turkeyItem.visible && people.distance(this.turkeyItem.x + 37, this.turkeyItem.y + 36) < 100) {
                        if (this.MAX_CATCH_COUNT <= this.doneFriendsIds.length) {
                            // alert.showFWords("今天辛苦了，明天继续吧~");
                            return;
                        }
                        MapManager._moveImp.disableMove();
                        this._onMove = false;
                        // this.turkeyItem.play(0, false, Laya.Handler.create(this, () => {
                        this.turkeyItem.visible = false;
                        this.catchTurkey(this.turkeyId);
                        // }));
                    }
                }
            }
        }

        private catchTurkey(index: number) {
            net.sendAndWait(new pb.cs_halloween_candy_megagame_catch({ uid: parseInt(MapInfo.mapData) })).then((msg: pb.sc_halloween_candy_megagame_catch) => {
                this.selfCount = 10 - msg.num;
                if (parseInt(MapInfo.mapData) != LocalInfo.uid) {
                    this.doneFriendsIds.push(parseInt(MapInfo.mapData));
                    Laya.timer.clear(this, this.onFrame);
                } else if (this.selfCount == 0) {
                    Laya.timer.clear(this, this.onFrame);
                }
                ModuleManager.open("catchTurkey.CatchTurkeyModule", { msg: msg, pet: index });
                MapManager._moveImp.enableMove();
            }).catch(() => {
                MapManager._moveImp.enableMove();
            })
        }

        public set show(any) {
            this._show = !this._show;
            this.showTurkey();
        }

        public get show(): boolean {
            return this._show;
        }

        private static _ins: TurkeyInfoManeger;
        public static get ins(): TurkeyInfoManeger {
            return this._ins || (this._ins = new TurkeyInfoManeger());
        }
    }
}