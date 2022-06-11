namespace clientCore {
    /**
     * 派对编辑UI
     */
    export class PartyEditorUI extends ui.main.party.PartyEditorModuleUI {
        private _tabNameArr: string[] = ["墙纸装饰", "地板装饰", "地面装饰", "墙面装饰", "挂顶装饰", "桌面装饰"];
        private _typeArr: number[][] = [[1], [2], [4], [3, 5], [6], [7]];
        private _curSelectTab: number = -1;
        private _searchState:boolean = false;
        constructor() {
            super();
            this.mouseEnabled = true;
            this.mouseThrough = true;
            this.mcEditPanel.visible = false;
            this.mcEditPanel.mouseThrough = true;
            this.width = Laya.stage.width;
            this.init();
        }
        init() {
            this.listTab.renderHandler = new Laya.Handler(this, this.tabRender);
            this.listTab.mouseHandler = new Laya.Handler(this, this.tabSelect);
            this.listTab.hScrollBarSkin = "";

            this.listItem.renderHandler = new Laya.Handler(this, this.itemsRender);
            this.listItem.mouseHandler = new Laya.Handler(this, this.itemSelect);
            this.listItem.hScrollBarSkin = "";

            this.listTab.array = this._tabNameArr;

            BC.addEvent(this,EventManager,"PARTY_PACKAGE_ITEM_CHANGE",this,this.packageNumChange);

            BC.addEvent(this,this.btnAll,Laya.Event.CLICK,this,this.allSelect);
            BC.addEvent(this,this.btnSearch,Laya.Event.CLICK,this,this.onSearchClick);
            BC.addEvent(this,this.btnCancelSearch,Laya.Event.CLICK,this,this.onCancelSearchClick);
            this.btnCancelSearch.visible = false;

            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "partyEditorUI") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if(objName == "tabCell_2"){
                    var obj: any;
                    obj = this.listTab.getCell(2);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if(objName == "itemCell_0"){
                    var obj: any;
                    obj = this.listItem.getCell(0);
                    Laya.timer.frameOnce(3,this,()=>{
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    })
                }
                else if (this[objName]) {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }
        private onCancelSearchClick(e:Laya.Event){
            this._searchState = false;
            this.btnCancelSearch.visible = false;
            this.showItemByTab(this._curSelectTab);
            this.txtinput.text = "";
        }
        private onSearchClick(e:Laya.Event){
            let searchStr = this.txtinput.text;
            PartyItemManager.searchItem(searchStr);
            this._searchState = true;
            this.btnCancelSearch.visible = true;
            this.showItemByTab(this._curSelectTab);
        }
        private allSelect(e:Laya.Event){
            this.showItemByTab(-1);
            this.listTab.refresh();
        }
        private packageNumChange(type:string,id:number){
            let num = PartyItemManager.getPackageItemNum(id);
            if(type == "reduce"){
                if(num <= 0){
                    let startIndex = this.listItem.startIndex;
                    this.showItemByTab(this._curSelectTab);
                    this.listItem.startIndex = startIndex;
                }
                else{
                    this.listItem.startIndex = this.listItem.startIndex;
                }
            }
            else if(type == "add"){
                let isShowTab = false;
                if(this._curSelectTab < 0 || id == 0){
                    isShowTab = true;
                }
                else{
                    let type = xls.get(xls.partyHouse).get(id).furnitureType;
                    if(this._typeArr[this._curSelectTab].indexOf(type) > -1){
                        isShowTab = true;
                    }
                }
                if(isShowTab){
                    let startIndex = this.listItem.startIndex;
                    this.showItemByTab(this._curSelectTab);
                    this.listItem.startIndex = startIndex;
                }
            }
        }
        private tabRender(cell: Laya.Box, index: number) {
            (cell.getChildByName("txtName") as Laya.Label).text = this._tabNameArr[index];
            (cell.getChildByName("imgSelect") as Laya.Image).visible = index == this._curSelectTab;
        }
        private tabSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK && this._curSelectTab != index) {
                this.showItemByTab(index);
                this.listTab.startIndex = this.listTab.startIndex;
                if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPartyEditTabCell"){
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }
        public showItemByTab(index: number) {
            this._curSelectTab = index;
            let itemArr: PartyPackageItemInfo[];
            if (index > -1) {
                let tmpTypeArr = this._typeArr[index];
                itemArr = PartyItemManager.getPackageItemsByTypes(tmpTypeArr,this._searchState);
            }
            else {
                itemArr = this._searchState?PartyItemManager.searchItemArr.slice():PartyItemManager.packageItemArr.slice();
            }
            this.listItem.array = itemArr;
            this.imgNo.visible = itemArr.length < 1;
        }
        private itemsRender(cell: ui.main.party.render.ItemRenderUI, index: number) {
            let info: PartyPackageItemInfo = this.listItem.array[index];
            cell.imgItem.skin = ItemsInfo.getItemIconUrl(info.ID);
            cell.txtNum.text = "" + info.num;
            cell.listHeart.repeatX = xls.get(xls.partyHouse).get(info.ID).quality;
        }
        private itemSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = this.listItem.array[index];
                let preID = 0;
                if (info.type == 1) {/** 墙纸 墙面装饰*/
                    preID = PartyItemManager.curWallID;
                    PartyItemManager.curWallID = info.ID;
                    PartyMapManager.changeWall(info.ID);
                    PartyItemManager.changeSpecialDeco(preID,info.ID);
                }
                else if (info.type == 2) {/** 底板  地面装饰 */
                    preID = PartyItemManager.curGroundID;
                    PartyItemManager.curGroundID = info.ID;
                    PartyMapManager.changeGround(info.ID);
                    PartyItemManager.changeSpecialDeco(preID,info.ID);
                }
                else if (info.type == 3) {/** 门  */
                    preID = PartyItemManager.curDoorID;
                    PartyItemManager.curDoorID = info.ID;
                    PartyMapManager.changeDoor(info.ID);
                    PartyItemManager.changeSpecialDeco(preID,info.ID);
                }
                else {/** 其他可编辑装饰 */
                    let tmpInfo = PartyItemInfo.createItemInfoByID(info.ID);
                    PartyEditorManager.ins.showOperateMapItem(tmpInfo);
                }
                if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPartyEditItemCell"){
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }

            }
        }
        /** 传进来的应该是物品的type，需要转换成tab对于的索引 */
        showTabByIndex(index: number) {
            let showIndex = -1;
            for (let i = 0; i < this._typeArr.length; i++) {
                if (this._typeArr[i].indexOf(index) > -1) {
                    showIndex = i;
                    break;
                }
            }
            this.showItemByTab(showIndex);
            this.listTab.startIndex = this.listTab.startIndex;
        }
        refreshList() {
            this.showItemByTab(this._curSelectTab);
        }
        close(){
            this.btnCancelSearch.visible = false;
            this.txtinput.text = "";
            this._searchState = false;
        }
        destroy() {

        }
    }
}