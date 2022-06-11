namespace clientCore {
    export class RandomEventManager {
        private static _eventHashMap: util.HashMap<pb.IsimpleRandomEvent>;
        private static _mapNpc: RandomEventMapNpc[];
        private static _eventXlsInfoHashMap: util.HashMap<xls.randomTask[]>;
        public static setUp() {
            net.listen(pb.sc_random_event_info_notify, this, this.randomEventNotice);
            EventManager.on(globalEvent.ENTER_MAP_SUCC, this, this.changeMapSucc);
            this.parseEventInfo();

            Laya.timer.loop(1000, this, this.timeRefresh);
        }
        private static timeRefresh() {
            let eventArr = this._eventHashMap.getValues();
            let hideFlag = false;
            for (let i = 0; i < eventArr.length; i++) {
                if ((eventArr[i].eventEndTime > 0 && ServerManager.curServerTime > eventArr[i].eventEndTime) ||
                    (eventArr[i].taskEndTime > 0 && ServerManager.curServerTime > eventArr[i].taskEndTime)) {
                    this._eventHashMap.remove(eventArr[i].eventId);
                    hideFlag = true;
                }
            }
            if (hideFlag && this._mapNpc) {
                this.refreshNpc();
            }
        }
        public static async loadRes() {
            await Promise.all([
                xls.load(xls.randomTask),
                xls.load(xls.random),
                this.getRandomEvent()
            ]);

        }
        public static getRandomEvent() {
            return net.sendAndWait(new pb.cs_get_random_event_lists({})).then((data: pb.sc_get_random_event_lists) => {
                if (this._eventHashMap) {
                    this._eventHashMap.clear();
                }
                this._eventHashMap = new util.HashMap();
                for (let i = 0; i < data.simpleEventLists.length; i++) {
                    this._eventHashMap.add(data.simpleEventLists[i].eventId, data.simpleEventLists[i]);
                }
            });
        }
        private static randomEventNotice(data: pb.sc_random_event_info_notify) {
            for (let i = 0; i < data.simpleEventInfo.length; i++) {
                let showFlag = this._eventHashMap.has(data.simpleEventInfo[i].eventId);
                this._eventHashMap.add(data.simpleEventInfo[i].eventId, data.simpleEventInfo[i]);
                if (!showFlag) {
                    console.log("-------------------add by notice -------------------");
                    this.checkAddToMap(data.simpleEventInfo[i]);
                }
            }
            this.refreshNpc();
            EventManager.event(globalEvent.RANDOM_EVENT_INFO_NOTICE);
        }
        public static getEventInfoById(id: number) {
            return this._eventHashMap.get(id);
        }
        public static getXlsInfoByID(id: number) {
            return this._eventXlsInfoHashMap.get(id);
        }
        private static parseEventInfo() {
            this._eventXlsInfoHashMap = new util.HashMap();
            let eventArr = xls.get(xls.randomTask).getValues();
            for (let i = 0; i < eventArr.length; i++) {
                if (!this._eventXlsInfoHashMap.has(eventArr[i].eventId)) {
                    this._eventXlsInfoHashMap.add(eventArr[i].eventId, []);
                }
                this._eventXlsInfoHashMap.get(eventArr[i].eventId).push(eventArr[i]);
            }
        }
        private static changeMapSucc(e: Laya.Event) {
            if (this._mapNpc) {
                for (let i = 0; i < this._mapNpc.length; i++) {
                    this._mapNpc[i].destroy();
                }
            }
            this._mapNpc = [];
            let eventArr = this._eventHashMap.getValues();
            for (let i = 0; i < eventArr.length; i++) {
                this.checkAddToMap(eventArr[i]);
            }
        }
        private static checkAddToMap(eventInfo: pb.IsimpleRandomEvent) {
            let eventXlsInfo = this._eventXlsInfoHashMap.get(eventInfo.eventId)[0];
            let mapID = eventXlsInfo.npc[1];
            if (mapID == 1 && MapInfo.isSelfHome) {
                this.addOneNpcToMap(eventXlsInfo);
            }
            else if (mapID == 2 && MapInfo.isSelfFamily) {
                this.addOneNpcToMap(eventXlsInfo);
            }
            else if (MapInfo.type == 5 && mapID == MapInfo.mapID) {
                this.addOneNpcToMap(eventXlsInfo);
            }
        }
        private static addOneNpcToMap(eventTaskInfo: xls.randomTask) {
            let npc = new RandomEventMapNpc(eventTaskInfo.npc[0], eventTaskInfo.eventId);
            this._mapNpc.push(npc);
            MapManager.peopleLayer.addChild(npc);
            let pos = MapInfo.calPositionByRowAndCol(eventTaskInfo.npc[2], eventTaskInfo.npc[3]);
            npc.pos(pos.x, pos.y);
            BC.addEvent(this, npc, Laya.Event.MOUSE_DOWN, this, this.onNpcClick, [npc, eventTaskInfo.eventId]);
            npc.mouseEnabled = true;
        }
        private static onNpcClick(npc: RandomEventMapNpc, eventID: number) {
            if (npc.state == 0) {
                net.sendAndWait(new pb.cs_random_event_opt({ eventId: eventID })).then(() => {
                    let eventInfo = this._eventHashMap.get(eventID);
                    let mod: string = xls.get(xls.randomTask).get(eventInfo.taskId).taskType == 2 ? "randomEvent.RandomEventInfoPanel" : "randomEvent.RandomEventPlotPanel";
                    ModuleManager.open(mod, eventInfo.eventId)
                });
            }
            else {
                let eventInfo = this._eventHashMap.get(eventID);
                let mod: string = xls.get(xls.randomTask).get(eventInfo.taskId).taskType == 2 ? "randomEvent.RandomEventInfoPanel" : "randomEvent.RandomEventPlotPanel";
                ModuleManager.open(mod, eventInfo.eventId);
            }
        }

        public static checkCanFinish(eventID: number) {
            let eventInfo = this._eventHashMap.get(eventID);
            let taskInfo = xls.get(xls.randomTask).get(eventInfo.taskId);
            //非订单任务
            if (taskInfo.taskType != 2 && eventInfo.status != 1) {
                return false;
            }
            //订单任务
            let element: xls.triple;
            let len: number = taskInfo.taskGoods.length;
            for (let i: number = 0; i < len; i++) {
                element = taskInfo.taskGoods[i];
                if (element && this.getItemNum(eventInfo.itemInfo, element.v2) < element.v3) {
                    return false;
                }
            }
            return true;
        }
        public static getItemNum(itemArr: pb.IorderTask[], id: number) {
            for (let i = 0; i < itemArr.length; i++) {
                if (itemArr[i].itemId == id) {
                    return itemArr[i].finish;
                }
            }
            return 0;
        }
        public static checkAnimateHaveChoice(rewardArr: xls.triple[]) {
            let type = -1;
            for (let i = 0; i < rewardArr.length; i++) {
                if (type < 0) {
                    type = rewardArr[i].v1;
                }
                else if (type != rewardArr[i].v1) {
                    return true;
                }
            }
            return false;
        }

        /**
        * 领取任务奖励
        * @param roleId 
        * @param taskId 
        */
        public static getTaskReward(eventID: number, complete: Laya.Handler): void {
            let curTaskID = this._eventHashMap.get(eventID).taskId;
            net.sendAndWait(new pb.cs_get_random_event_reward({ eventId: eventID })).then((msg: pb.sc_get_random_event_reward) => {
                complete && complete.run();
                // let info: FavorTaskInfo = this.getRoleTask(roleId);
                // info && info.taskId == taskId && this.removeTaskMap(roleId); //领取了奖励 未更新的任务移除
                // ModuleManager.open("randomEvent.RandomEventRewardPanel", { eventID: eventID, rewardArr: msg.rewardInfo });
                alert.showReward(GoodsInfo.createArray(msg.rewardInfo));
                let taskArr = this._eventXlsInfoHashMap.get(eventID);
                if (curTaskID == taskArr[taskArr.length - 1].taskId) {
                    this._eventHashMap.remove(eventID);
                    this.refreshNpc();
                }
            });
        }

        private static refreshNpc() {
            if (this._mapNpc)
                for (let i = this._mapNpc.length - 1; i >= 0; i--) {
                    if (!this._eventHashMap.has(this._mapNpc[i].eventID)) {
                        this._mapNpc[i].destroy();
                        this._mapNpc.splice(i, 1);
                    }
                    else {
                        this._mapNpc[i].update();
                    }
                }
        }
    }
}