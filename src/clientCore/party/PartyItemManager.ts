namespace clientCore {
    /**
     * 派对地图物品信息
     * 
     */
    export class PartyItemManager {
        static preWallID: number;
        static curWallID: number;//墙纸ID
        static preGroundID: number;
        static curGroundID: number;//地板ID
        static preDoorID: number;
        static curDoorID: number;//门ID
        static curCarpetID: number;//当前地毯ID

        static packageItemArr: PartyPackageItemInfo[] = [];
        static searchItemArr:PartyPackageItemInfo[] = [];
        static searchStr:string;//把搜索字段存储在这，是为了玩家摆放的时候，可以对比下搜索字段
        static partyMapItemArr: PartyMapItem[] = [];//地图摆放对象

        static mapServerData: pb.IBuild[];;

        static initPartyMapInfo(data: pb.Isc_enter_map) {
            this.partyMapItemArr = [];
            this.packageItemArr = [];
            this.addAllMapItems(data.builds);
            if (MapInfo.isSelfParty) {
                this.checkPartyItemsInPackage();
                this.mapServerData = data.builds.slice();
            }
            Laya.timer.frameOnce(5,this,()=>{
                MapManager.sortMapItems();
            })
            MapManager.refreshMapOccupyState();
            this.addEvents();
            PartyEditorManager.ins.setUp();
            PartySchemeManager.checkPartyDecoScheme();
        }
        private static addEvents() {
            net.listen(pb.sc_party_house_builds_change_notify, this, this.partyItemsChangeNotify);
            EventManager.on(globalEvent.PARTY_PACKAGE_ITEM_CHANGE_BY_DRAW, this, this.packageItemChange);
        }
        private static removeEvents() {
            net.unListen(pb.sc_party_house_builds_change_notify, this, this.partyItemsChangeNotify);
            EventManager.off(globalEvent.PARTY_PACKAGE_ITEM_CHANGE_BY_DRAW, this, this.packageItemChange);
        }
        private static packageItemChange(arr: pb.IdrawReward[]) {
            if(!MapInfo.isSelfParty){
                return;
            }
            for (let item of arr) {
                let xlsInfo = xls.get(xls.godTree).get(item.id);
                if (xlsInfo) {
                    let rwdPair = clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale
                    if (xls.get(xls.partyHouse).has(rwdPair.v1)) {

                        this.addPackageItemByNum(rwdPair.v1, rwdPair.v2);
                    }
                }
            }
            EventManager.event("PARTY_PACKAGE_ITEM_CHANGE", ["add", 0]);
        }
        private static addPackageItemByNum(id: number, num: number) {
            var haveFlag: boolean = false;
            for (let i = 0; i < this.packageItemArr.length; i++) {
                if (this.packageItemArr[i].ID == id) {
                    this.packageItemArr[i].num += num;
                    haveFlag = true;
                    break;
                }
            }
            if (!haveFlag) {
                let decInfo = PartyPackageItemInfo.createPackageInfo(id, num);
                this.packageItemArr.push(decInfo);
            }

        }
        private static partyItemsChangeNotify(data: pb.sc_party_house_builds_change_notify) {
            if (MapInfo.isOthersParty) {
                let buildsArr = data.build;
                for (let i = 0; i < buildsArr.length; i++) {
                    let itemInfo = PartyItemInfo.createInfo(buildsArr[i]);
                    this.changePartyItemState(itemInfo);
                }
            }
        }
        private static addAllMapItems(arr: pb.IBuild[]) {
            for (let info of arr) {
                let itemInfo = PartyItemInfo.createInfo(info);
                if (itemInfo.type == 1) {/** 墙纸 墙面装饰*/
                    this.curWallID = itemInfo.ID;
                    PartyMapManager.changeWall(this.curWallID);
                }
                else if (itemInfo.type == 2) {/** 底板  地面装饰 */
                    this.curGroundID = itemInfo.ID;
                    PartyMapManager.changeGround(this.curGroundID);
                }
                else if (itemInfo.type == 3) {/** 门  */
                    this.curDoorID = itemInfo.ID;
                    PartyMapManager.changeDoor(this.curDoorID);
                }
                else {/** 其他可编辑装饰 */
                    this.addOnePartyItem(itemInfo);
                }
            }
            this.setPreIDInfo();
        }
        private static setPreIDInfo() {
            this.preDoorID = this.curDoorID;
            this.preWallID = this.curWallID;
            this.preGroundID = this.curGroundID;
        }
        public static async checkPartyItemsInPackage(): Promise<any> {
            if (MapInfo.isSelfParty) {
                this.packageItemArr = [];
                const data = await net.sendAndWait(new pb.cs_get_party_house_builds_not_in_map({}));
                for (const info of data.decs) {
                    let itemInfo = PartyPackageItemInfo.createPackageInfo(info.buildId, info.buildNum);
                    this.packageItemArr.push(itemInfo);
                }
                //测试用
                // for(let i = 0;i<7;i++){
                //     this.packageItemArr.push(PartyPackageItemInfo.createPackageInfo(4200007+i, 3));
                // }
            }
        }

        public static async changeScheme(arr: pb.IBuild[]) {
            //删除当前地图所有物品
            if (this.partyMapItemArr) {
                for (let i = this.partyMapItemArr.length - 1; i >= 0; i--) {
                    this.partyMapItemArr[i].destroy();
                }
                this.partyMapItemArr = [];
            }
            this.addAllMapItems(arr);
            this.mapServerData = arr.slice();
            Laya.timer.frameOnce(10,this,()=>{
                MapManager.sortMapItems();
            })
            MapManager.refreshMapOccupyState();
            PartyEditorManager.ins.resetAllOpt();
            await this.checkPartyItemsInPackage();
            EventManager.event("PARTY_PACKAGE_ITEM_CHANGE", ["add", 0]);
        }

        /**
        * 建筑的增、删、改都通过这个接口。这样方便统一更新地图信息，统一更改场景建筑层级
        * @param info 
        */
        public static changePartyItemState(info: PartyItemInfo) {
            if (info.putState == 0) {
                this.removeOnePartyItem(info.getTime);
            }
            else if (info.putState == 1) {
                var mcPartyItem = this.getPartyItemInMap(info.getTime);
                if (!mcPartyItem) {
                    this.addOnePartyItem(info);
                    mcPartyItem = this.getPartyItemInMap(info.getTime);
                }
                mcPartyItem.visible = true;
                mcPartyItem.itemInfo.row = info.row;
                mcPartyItem.itemInfo.col = info.col;
                mcPartyItem.setPos();
            }
            else {
                console.log("run changePartyItemState function 'else' command");
            }
            MapManager.sortMapItems();
            MapManager.refreshMapOccupyState();
        }
        public static removeOnePartyItem(getTime: number) {
            for (let i = 0; i < this.partyMapItemArr.length; i++) {
                let item = this.partyMapItemArr[i];
                if (item.itemInfo.getTime == getTime) {
                    item.destroy();
                    this.partyMapItemArr.splice(i, 1);
                    break;
                }
            }
        }
        public static addOnePartyItem(info: PartyItemInfo) {
            var partyItem: PartyMapItem;
            partyItem = new PartyMapItem(info);
            this.partyMapItemArr.push(partyItem);
            MapManager.mapItemsLayer.addChild(partyItem);
            partyItem.mouseThrough = true;
        }
        public static getPartyItemInMap(getTime: number) {
            for (let item of this.partyMapItemArr) {
                if (item.itemInfo.getTime == getTime) {
                    return item;
                }
            }
            return null;
        }
        /** 装饰放回去背包，数量需要加回去 */
        public static addOneDecToPackage(id: number, refreshListFlag: boolean = true) {
            var haveFlag: boolean = false;
            for (let i = 0; i < this.packageItemArr.length; i++) {
                if (this.packageItemArr[i].ID == id) {
                    this.packageItemArr[i].num++;
                    haveFlag = true;
                    break;
                }
            }
            if (!haveFlag) {
                let decInfo = PartyPackageItemInfo.createPackageInfo(id, 1);
                this.packageItemArr.push(decInfo);
                // if(this.searchStr != ""){
                //     if(decInfo.name.indexOf(this.searchStr) > -1){
                //         this.searchItemArr.push(decInfo);
                //     }
                // }
            }
            refreshListFlag && EventManager.event("PARTY_PACKAGE_ITEM_CHANGE", ["add", id]);
        }
        public static getDecFromPackage(id: number, refreshListFlag: boolean = true) {
            for (let i = 0; i < this.packageItemArr.length; i++) {
                if (this.packageItemArr[i].ID == id) {
                    this.packageItemArr[i].num--;
                    if (this.packageItemArr[i].num <= 0) {
                        this.packageItemArr.splice(i, 1);
                    }
                    break;
                }
            }
            refreshListFlag && EventManager.event("PARTY_PACKAGE_ITEM_CHANGE", ["reduce", id]);
        }
        public static changeSpecialDeco(oriID: number, changeID: number) {
            for (let i = 0; i < this.packageItemArr.length; i++) {
                if (this.packageItemArr[i].ID == changeID) {
                    this.packageItemArr[i].ID = oriID;
                    break;
                }
            }
            EventManager.event("PARTY_PACKAGE_ITEM_CHANGE", ["add", changeID]);
        }
        /** 获取背包中类型所有的所有物品 */
        static getPackageItemsByTypes(typeArr: number[],searchFlag:boolean): PartyPackageItemInfo[] {
            let arr: PartyPackageItemInfo[] = [];
            let curArr = searchFlag?this.searchItemArr:this.packageItemArr;
            for (const info of curArr) {
                if (typeArr.indexOf(info.type) > -1) {
                    arr.push(info);
                }
            }
            return arr;
        }

        static searchItem(str:string){
            this.searchItemArr = [];
            for(let info of this.packageItemArr){
                if(info.name.indexOf(str) > -1){
                    this.searchItemArr.push(info);
                }
            }
        }
        /** 只算背包里面的数量 */
        static getPackageItemNum(id: number) {
            for (let i = 0; i < this.packageItemArr.length; i++) {
                if (this.packageItemArr[i].ID == id) {
                    return this.packageItemArr[i].num;
                }
            }
            return 0;
        }
        /** 背包跟家园里面的数量都要算 */
        static getTotalItemNum(id: number) {
            if(!this.packageItemArr || !this.partyMapItemArr){
                return 0;
            }
            let count = 0;
            for (let i = 0; i < this.packageItemArr.length; i++) {
                if (this.packageItemArr[i].ID == id) {
                    count+= this.packageItemArr[i].num;
                    break;
                }
            }
            for(let i = 0;i<this.partyMapItemArr.length;i++){
                if(this.partyMapItemArr[i].itemInfo.ID == id){
                    count++;
                }
            }
            return count;
        }

        /**根据id获取地图上的数量 */
        static getNumInMap(id: number) {
            let mapNum = 0;
            for (let i = 0; i < this.partyMapItemArr.length; i++) {
                if (this.partyMapItemArr[i].itemInfo.ID == id) {
                    mapNum++;
                }
            }
            return mapNum;
        }

        /**
        * 这个方法是在同步地图编辑后调用。
        */
        public static refreshAllMapItems(data: pb.IBuild[]) {
            this.mapServerData = data.slice();
            this.clearTmpMapItems();
            for (let i = 0; i < data.length; i++) {
                let tmpMapItemInfo: PartyItemInfo = PartyItemInfo.createInfo(data[i]);
                if (tmpMapItemInfo.type == 1) {/** 墙纸 墙面装饰*/
                    this.curWallID = tmpMapItemInfo.ID;
                    PartyMapManager.changeWall(this.curWallID);
                }
                else if (tmpMapItemInfo.type == 2) {/** 底板  地面装饰 */
                    this.curGroundID = tmpMapItemInfo.ID;
                    PartyMapManager.changeGround(this.curGroundID);
                }
                else if (tmpMapItemInfo.type == 3) {/** 门  */
                    this.curDoorID = tmpMapItemInfo.ID;
                    PartyMapManager.changeDoor(this.curDoorID);
                }
                else {/** 其他可编辑装饰 */
                    this.changePartyItemState(tmpMapItemInfo);
                }

            }
            MapManager.sortMapItems();
            MapManager.refreshMapOccupyState();
            this.setPreIDInfo();
        }
        /**
         * 编辑的时候临时加入的建筑，getTime时间都是小于1亿，在后台回包的时候，这些数据需要移除
         */
        private static clearTmpMapItems() {
            for (let i = this.partyMapItemArr.length - 1; i >= 0; i--) {
                if (this.partyMapItemArr[i].itemInfo.getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {
                    this.partyMapItemArr[i].destroy();
                    this.partyMapItemArr.splice(i, 1);
                }
            }
        }

        public static clearData() {
            this.removeEvents();
            if (this.partyMapItemArr) {
                for (let i = this.partyMapItemArr.length - 1; i >= 0; i--) {
                    this.partyMapItemArr[i].destroy();
                }
            }
            this.mapServerData = [];
            this.packageItemArr = [];
            this.partyMapItemArr = [];
        }
    }
}
