namespace worldMap {
    export class WorldMapModule extends ui.worldMap.worldMapModuleUI {
        constructor() {
            super();
        }
        public init(d: any) {
            // xls.load
            this.addPreLoad(xls.load(xls.cruise));
            this.addPreLoad(clientCore.CpManager.instance.refreshAllWeddingInfo());
        }
        public onPreloadOver() {
            this.initLockState();
        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "worldMapModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }
        private initLockState() {
            let lv = clientCore.LocalInfo.userLv;
            let mapInfoArr = xls.get(xls.map).getValues();
            for (let i = 0; i < mapInfoArr.length; i++) {
                let mapId = mapInfoArr[i].id;
                let mapLv = mapInfoArr[i].mapLevel
                let mapUI = this["lock_" + mapId];
                if (mapUI) {
                    if (mapInfoArr[i].mapType == 5) {
                        if (lv >= mapLv) {
                            mapUI.visible = false;
                        }
                        else {
                            if (mapLv >= 999) {
                                (mapUI["txtLockInfo"] as Laya.Label).changeText("敬请期待");
                            }
                            else {
                                (mapUI["txtLockInfo"] as Laya.Label).changeText(mapLv + "级 开启");
                            }
                            this["map_" + mapId].disabled = true;
                        }
                    }
                }
            }
            // 检查世界boss
            this.checkWorldBoss();
            // 检查花车
            this.checkVehicle();
            this.checkWedding();
            this.checkNian();
        }
        private checkWedding() {
            let arr = clientCore.CpManager.instance.getNowWeddingList()
            for (const info of arr) {
                if (this['wedding_' + info.mapId]) {
                    this['wedding_' + info.mapId].visible = true;
                }
            }
        }
        public addEventListeners() {
            let num = this.mapCon.numChildren;
            for (let i = 0; i < num; i++) {
                let item = this.mapCon.getChildAt(i);
                BC.addEvent(this, item, Laya.Event.CLICK, this, this.changeMap);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "worldMapModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }
        private changeMap(e: Laya.Event) {
            if (clientCore.LocalInfo.onLimit) {
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            let mapID = parseInt(e.currentTarget.name.split("_")[1]);
            if (mapID < 9999) {
                if (!clientCore.MapInfo.checkIsInWorldMap(mapID)) {
                    if (clientCore.MapManager.isPickingMapItem) {
                        alert.showSmall("采集期间不能切换地图，是否退出采集？", {
                            callBack: {
                                caller: this, funArr: [() => {
                                    this.destroy();
                                    clientCore.UserPickManager.ins.stopPick();
                                    clientCore.MapManager.enterWorldMap(mapID)
                                }]
                            },
                            btnType: alert.Btn_Type.SURE_AND_CANCLE,
                            needMask: true,
                            clickMaskClose: true
                        });
                    }
                    else {
                        this.destroy();
                        clientCore.MapManager.enterWorldMap(mapID);
                    }

                }
                else {
                    this.destroy();
                    alert.showFWords("已经在这个地图中了！");
                }
            }
            else {
                if (!clientCore.MapInfo.isSelfHome) {
                    if (clientCore.MapManager.isPickingMapItem) {
                        alert.showSmall("采集期间不能回家园，是否退出采集？", {
                            callBack: {
                                caller: this, funArr: [() => {
                                    this.destroy();
                                    clientCore.UserPickManager.ins.stopPick();
                                    clientCore.MapManager.enterHome(clientCore.LocalInfo.uid)
                                }]
                            },
                            btnType: alert.Btn_Type.SURE_AND_CANCLE,
                            needMask: true,
                            clickMaskClose: true
                        });
                    }
                    else {
                        this.destroy();
                        clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
                    }
                }
                else {
                    this.destroy();
                    alert.showFWords("已经在自己家园中！");
                }
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickMapOrHomeIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        public removeEventListeners() {
            BC.removeEvent(this);
        }
        public destroy() {
            this._bossIMG?.destroy();
            super.destroy();
        }

        private _bossIMG: Laya.Image;
        public async checkWorldBoss(): Promise<void> {
            this.imgBoss.visible = false;
            let data: pb.sc_get_world_boss_info = await clientCore.BossManager.ins.getBossInfo();
            let ct: number = clientCore.ServerManager.curServerTime;
            if (ct >= data.prepareTime && ct <= data.closeTime) {
                this.imgBoss.skin = `res/itemIcon/role/${clientCore.BossManager.BOSS_ROLD_ID}.png`;
                this.imgBoss.visible = true;
                // this._bossIMG = new Laya.Image('res/itemIcon/monster/2710001.png');
                // this._bossIMG.pos(960, 123);
                // this._bossIMG.scale(0.5, 0.5);
                // this.addChild(this._bossIMG);
            }//460 515
        }

        public checkVehicle(): void {
            this.imgVehicle.visible = false;
            if (!this.checkActitity()) return;
            net.sendAndWait(new pb.cs_mimi_float_get_info()).then((msg: pb.sc_mimi_float_get_info) => {
                if (!util.TimeUtil.isSameDay(msg.lastTime, clientCore.ServerManager.curServerTime)) return;
                let item: Laya.Box = this['map_' + msg.mapId];
                if (item) {
                    this.imgVehicle.visible = true;
                    this.imgVehicle.pos(item.x + 58 + item.width / 2, item.y + 50 + item.height / 2);
                }
            })
        }


        /** 检查是否在活动时间内*/
        private checkActitity(): boolean {
            let ct: number = clientCore.ServerManager.curServerTime;
            let event: xls.eventControl = xls.get(xls.eventControl).get(45);
            let arr: string[] = event.eventTime.split("_");
            let dst: number = util.TimeUtil.formatTimeStrToSec(arr[0]);
            let det: number = util.TimeUtil.formatTimeStrToSec(arr[1]);
            if (ct < dst || ct > det) return false; //不在活动日期
            let array: string[] = xls.get(xls.cruise).get(1).everydayTime.split('_');
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' ' + array[0]);
            let et: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' ' + array[1]);
            return ct >= st && ct <= et;
        }

        /** 检查年兽*/
        private checkNian(): void {
            this.imgNian.visible = false;
            if (!this.checkNianTime()) return;
            net.sendAndWait(new pb.cs_new_years_monster_map_id()).then((msg: pb.sc_new_years_monster_map_id) => {
                let item: Laya.Box = this['map_' + msg.mapId];
                if (item) {
                    this.imgNian.visible = true;
                    this.imgNian.pos(item.x + item.width / 2, item.y);
                }
            });
        }

        /** 检查年兽时间*/
        private checkNianTime(): boolean {
            if (!this.checkTime(118)) return false; //不在活动日期
            let now: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 12:00:00');
            let et: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 14:00:00');
            if (now >= st && now <= et) return true;
            st = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 18:00:00');
            et = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 20:00:00');
            if (now >= st && now <= et) return true;
            return false;
        }

        private checkTime(activityId: number): boolean {
            let ct: number = clientCore.ServerManager.curServerTime;
            let event: xls.eventControl = xls.get(xls.eventControl).get(activityId);
            let arr: string[] = event.eventTime.split("_");
            let dst: number = util.TimeUtil.formatTimeStrToSec(arr[0]);
            let det: number = util.TimeUtil.formatTimeStrToSec(arr[1]);
            if (ct < dst || ct > det) return false;
            return true;
        }
    }
}