namespace mapBean {
    export class FamilyPickItemBean implements IFamilyActivity {
        private _destroy: boolean = false;
        private _acivityInfo: pb.IFamilyActivity;

        private _activityPanel: ui.familyPickItem.PickItemActivityInfoUI;
        private _pickInfoPanel: ui.familyPickItem.PickItemActivityHaveInfoUI;
        private _mapItemsArr: { posID: number, item: ui.familyPickItem.MapItemsUI, pickFlag: boolean }[];
        private _roundTimearr: RoundTime[];
        private _isActivityPlaying: boolean = false;
        private _restNum: number;
        private _itemPool: ui.familyPickItem.MapItemsUI[];

        private _itemIDArr = [2400001, 2400002, 2400003];
        private _pickInfoHashMap:util.HashMap<pickItemInfo>;
        // private _itemRoundMaxNumArr = [];
        // private _itemPickNumArr = [0,0,0];

        private _frameCount: number = 0;
        private _gainNeedTime: number;
        async start(data?: any) {
            this._acivityInfo = data;
            await Promise.all([
                clientCore.ModuleManager.loadatlas('familyPickItem'),
                xls.load(xls.familyPick),
                xls.load(xls.family)
            ]);
            /**读取表里面几种果实的采摘上限 */
            let maxNumArr = [
                xls.get(xls.family).get(1).primaryPick,
                xls.get(xls.family).get(1).advancedPick,
                xls.get(xls.family).get(1).specialPick
            ];
            this._pickInfoHashMap = new util.HashMap();
            for(let i = 0;i<this._itemIDArr.length;i++){
                this._pickInfoHashMap.add(this._itemIDArr[i],new pickItemInfo(this._itemIDArr[i],maxNumArr[i],0));
            }

            if (!this._destroy) {
                this.init();
            }

            console.log(`活动开始时间：${new Date(this._acivityInfo.startTime * 1000).toString()}`);
            console.log(`当前服务器时间：${new Date(clientCore.ServerManager.curServerTime * 1000).toString()}`);
            console.log(`活动结束时间：${new Date(this._acivityInfo.endTime * 1000).toString()}`);
        }
        init() {
            this._gainNeedTime = xls.get(xls.family).get(1).pickGainTime * 2 + 1;
            this.addEventListeners();
            this.initRoundTime();
            this._activityPanel = new ui.familyPickItem.PickItemActivityInfoUI();
            clientCore.LayerManager.uiLayer.addChild(this._activityPanel);
            this._activityPanel.anchorX = 0.5;
            this._activityPanel.x = Laya.stage.width / 2;
            this._activityPanel.y = 10;
            this._pickInfoPanel = new ui.familyPickItem.PickItemActivityHaveInfoUI();
            clientCore.LayerManager.uiLayer.addChild(this._pickInfoPanel);
            this._pickInfoPanel.anchorY = 0.5;
            this._pickInfoPanel.x = 20;
            this._pickInfoPanel.y = Laya.stage.height / 2;
            this._mapItemsArr = [];
            this._itemPool = [];
            this.checkGetItemsInfo();
            this.showPanel();
            this.refreshTime();
            this.refreshItemNum();
        }
        checkPickItem() {
            if (this._isActivityPlaying) {
                for (let i = this._mapItemsArr.length - 1; i >= 0; i--) {
                    if (!this._mapItemsArr[i].pickFlag) {
                        if (this.getDisPos(this._mapItemsArr[i].item) < 50 * 50) {
                            this._mapItemsArr[i].pickFlag = true;
                            let itemID = xls.get(xls.familyPick).get(this._mapItemsArr[i].posID).itemId;
                            let info = this._pickInfoHashMap.get(itemID);
                            if(info.curPickNum >= info.pickMaxNum){
                                alert.showFWords(`背包中的${clientCore.ItemsInfo.getItemName(itemID)}已达本轮可拥有最大上限`);
                                console.log("前端判断物品拾取已达上限");
                                return;
                            }
                            
                            net.sendAndWait(new pb.cs_family_map_pick_item({ posId: this._mapItemsArr[i].posID })).then((data: pb.sc_family_map_pick_item) => {
                                if (data.isOver == 0) {
                                    let itemID = xls.get(xls.familyPick).get(data.posId).itemId;
                                    this._pickInfoHashMap.get(itemID).curPickNum++;
                                    this.refreshItemNum();
                                }
                                else if (data.isOver == 1) {
                                    alert.showFWords(`速度慢了。已经被人捡走了！`);
                                    // this.setCanPick(data.posId);
                                }
                                else if (data.isOver == 2) {
                                    let itemID = xls.get(xls.familyPick).get(data.posId).itemId;
                                    alert.showFWords(`背包中的${clientCore.ItemsInfo.getItemName(itemID)}已达本轮可拥有最大上限`);
                                }
                                else if (data.isOver == 3) {
                                    alert.showFWords(`活动结束了！`);
                                }
                                for (let i = 0; i < data.randomItems.length; i++) {
                                    alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.randomItems[i].id) + " x" + data.randomItems[i].cnt);
                                }
                            });
                        }
                    }
                    else {
                        if (this.getDisPos(this._mapItemsArr[i].item) > 60 * 60) {
                            this._mapItemsArr[i].pickFlag = false;
                        }
                    }
                }
            }

            for (let i = 0; i < this._mapItemsArr.length; i++) {
                this._mapItemsArr[i].item.imgBg.rotation += 3;
            }

        }
        private getDisPos(item:Laya.Sprite):number{
            let player = clientCore.PeopleManager.getInstance().player;
            let disX = player.x - (item.x + item.width/2);
            let disY = (player.y) - (item.y + item.height/2);
            return disX * disX + disY * disY;
        }
        refreshItemNum() {
            for (let i = 1; i < 4; i++) {
                let info = this._pickInfoHashMap.get(this._itemIDArr[i-1]);
                this._pickInfoPanel["txtNum_" + i].text = ""+info.curPickNum + "/"+info.pickMaxNum;
            }
        }
        refreshTime() {
            let endRestTime = this._acivityInfo.endTime - clientCore.ServerManager.curServerTime;
            let startRestTime = this._acivityInfo.startTime - clientCore.ServerManager.curServerTime;
            this._activityPanel.txtRestTime.text = util.StringUtils.getDateStr(endRestTime >= 0 ? endRestTime : 0);
            this._activityPanel.txtRestTime1.text = util.StringUtils.getDateStr(startRestTime >= 0 ? startRestTime : 0);
            if (this._activityPanel.visible == false) {
                if (clientCore.ServerManager.curServerTime >= this._acivityInfo.startTime - 30 * 60) {
                    this.showPanel();
                }
            }

            this._frameCount++;
            if (this._frameCount % this._gainNeedTime == 0 && this._isActivityPlaying) {
                net.sendAndWait(new pb.cs_get_family_pick_items_gain({})).then((data: pb.sc_get_family_pick_items_gain) => {
                    for (let i = 0; i < data.items.length; i++) {
                        alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                    }
                });
            }
        }
        addEventListeners() {
            net.listen(pb.sc_notify_family_activity_finish, this, this.onActivityFinish);
            net.listen(pb.sc_notify_family_map_items, this, this.itemPickNotice);
            net.listen(pb.sc_notify_family_map_pick_item_begin, this, this.activityStartNotice);
            Laya.timer.frameLoop(2, this, this.checkPickItem);
            Laya.timer.loop(500, this, this.refreshTime);
        }
        removeEventListeners() {
            net.unListen(pb.sc_notify_family_activity_finish, this, this.onActivityFinish);
            net.unListen(pb.sc_notify_family_map_items, this, this.itemPickNotice);
            net.unListen(pb.sc_notify_family_map_pick_item_begin, this, this.activityStartNotice);
            Laya.timer.clear(this, this.checkPickItem);
            Laya.timer.clear(this, this.refreshTime);
        }
        activityStartNotice(data: pb.sc_notify_family_map_pick_item_begin) {
            this._isActivityPlaying = true;
            this._frameCount = 0;
            this.showMapItems(data.pickItems);
            this._restNum = data.canPick;
            for(let id of this._itemIDArr){
                this._pickInfoHashMap && (this._pickInfoHashMap.get(id).curPickNum = 0);
            }
            this.refreshItemNum();
            this.showPanel();
        }
        itemPickNotice(data: pb.sc_notify_family_map_items) {
            if (data.pickItems.length > 0) {
                if (data.pickItems[0].remain > 0) {
                    this.showMapItems(data.pickItems);
                }
                else {
                    this._restNum -= data.pickItems.length;
                    this.removeMapItems(data.pickItems);
                }
            }
            this.showPanel();
        }
        removeMapItems(arr: pb.IPickItem[]) {
            for (let info of arr) {
                for (let i = this._mapItemsArr.length - 1; i >= 0; i--) {
                    let mapItemInfo = this._mapItemsArr[i];
                    if (info.posId == mapItemInfo.posID) {
                        this._itemPool.push(mapItemInfo.item);
                        mapItemInfo.item.removeSelf();
                        this._mapItemsArr.splice(i, 1);
                        break;
                    }
                }
            }
        }
        onActivityFinish(data: pb.sc_notify_family_activity_finish) {
            if (data.activity.eventId == 3) {
                this._isActivityPlaying = false;
                this._acivityInfo = data.activity;
                console.log(`活动开始时间：${new Date(this._acivityInfo.startTime * 1000).toString()}`);
                console.log(`当前服务器时间：${new Date(clientCore.ServerManager.curServerTime * 1000).toString()}`);
                console.log(`活动结束时间：${new Date(this._acivityInfo.endTime * 1000).toString()}`);
                // alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                if (this._acivityInfo.count == 0) {
                    alert.showSmall("活动已结束，奖励通过邮箱发送！");
                    this.destroy();
                    return;
                }
                this.showPanel();
                if (this._mapItemsArr) {
                    for (let itemInfo of this._mapItemsArr) {
                        this._itemPool.push(itemInfo.item);
                        itemInfo.item.removeSelf();
                    }
                    this._mapItemsArr = [];
                }
                this.refreshItemNum();
            }
        }
        showPanel() {
            this._activityPanel.txtRound.text = "第" + util.StringUtils.num2Chinese(this._acivityInfo.count) + "轮";
            this._activityPanel.txtRound1.text = "第" + util.StringUtils.num2Chinese(this._acivityInfo.count) + "轮";
            this._activityPanel.txtRestNum.text = "" + this._restNum;

            if (clientCore.ServerManager.curServerTime < this._acivityInfo.startTime - 30 * 60) {
                this._pickInfoPanel.visible = false;
                this._activityPanel.visible = false;
            }
            else {
                if (this._isActivityPlaying) {
                    this._activityPanel.txtTitle.text = "花园采摘活动正在进行中";
                    this._activityPanel.boxPlay.visible = true;
                    this._activityPanel.boxWait.visible = false;
                    this._activityPanel.visible = true;

                    this._pickInfoPanel.visible = true;
                }
                else {
                    this._activityPanel.txtTitle.text = "花园采摘活动即将开始";
                    this._activityPanel.boxPlay.visible = false;
                    this._activityPanel.boxWait.visible = true;
                    this._activityPanel.visible = true;

                    this._pickInfoPanel.visible = false;
                }
            }
        }
        checkGetItemsInfo(): void {
            net.sendAndWait(new pb.cs_family_pick_items_info({})).then((data: pb.sc_family_pick_items_info) => {
                if (data.flag == 1) {/**如果在活动中，显示当前地图的拾取物品 */
                    this.showMapItems(data.pickItems);
                    this._isActivityPlaying = true;
                    this._frameCount = 0;
                }
                else if (data.flag == 0) {/**一轮提前结束 */
                    this._isActivityPlaying = false;
                }
                this._restNum = data.canPick;
                for(let item of data.picked){
                    this._pickInfoHashMap.get(item.id).curPickNum = item.cnt;
                }
                this.showPanel();
                this.refreshItemNum();
            });
        }
        showMapItems(items: pb.IPickItem[]): void {
            for (let info of items) {
                if(info.remain > 0){
                    let item = this.getOneItemUI();
                    item.pos(info.pos.x, info.pos.y);
                    item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(xls.get(xls.familyPick).get(info.posId).itemId);
                    this._mapItemsArr.push({ posID: info.posId, item: item, pickFlag: false });
                    clientCore.MapManager.mapItemsLayer.addChild(item);
                }
            }
        }
        getOneItemUI(): ui.familyPickItem.MapItemsUI {
            if (this._itemPool.length > 0) {
                return this._itemPool.shift();
            }
            else {
                return new ui.familyPickItem.MapItemsUI();
            }
        }
        initRoundTime() {
            this._roundTimearr = [];
            for (let i = 0; i < 3; i++) {
                let round = new RoundTime();
                round.startTime = this._acivityInfo.startTime + 5 * i * 60;
                round.endTime = round.startTime + 180;
                round.roundIndex = i + 1;
                this._roundTimearr.push(round);
            }
        }
        destroy(): void {
            this.removeEventListeners();
            this._activityPanel?.removeSelf();
            this._pickInfoPanel?.removeSelf();
            if (this._mapItemsArr) {
                for (let itemInfo of this._mapItemsArr) {
                    itemInfo.item.removeSelf();
                }
            }
            this._itemPool = null;
            this._mapItemsArr = null;
            this._itemPool = null;
            this._destroy = true;
        }
    }
    class RoundTime {
        roundIndex: number;
        startTime: number;
        endTime: number;
    }

    class pickItemInfo{
        itemID:number;
        pickMaxNum:number;
        curPickNum:number;
        constructor(id:number,max:number,num:number){
            this.itemID = id;
            this.pickMaxNum = max;
            this.curPickNum = num;
        }
    }
}
