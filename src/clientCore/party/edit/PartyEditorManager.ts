
namespace clientCore {
    /**
     * 地图建筑，装饰，花种编辑面板。
     */
    export class PartyEditorManager {
        private static _instance: PartyEditorManager;
        private _mainUI: PartyEditorUI;
        private _mcOperateItem: PartyMapOptItem;
        /**编辑操作变化数组 */
        private _optHash: util.HashMap<pb.ImapItem>;

        public static get ins(): PartyEditorManager {
            if (!PartyEditorManager._instance) {
                PartyEditorManager._instance = new PartyEditorManager();
            }
            return PartyEditorManager._instance;
        }

        public setUp() {
            this._optHash = new util.HashMap();
            if (!this._mainUI)
                this._mainUI = new PartyEditorUI();
            if (!this._mcOperateItem)
                this._mcOperateItem = new PartyMapOptItem();
            this.addEventListeners();
        }

        public resetAllOpt() {
            this._optHash.clear();
        }

        private createOptInfo(mapItemInfo: PartyItemInfo, opt: 'sure' | 'cancle' | 'pushToPack'): pb.mapItem {
            let changeInfo = new pb.mapItem();
            changeInfo.buildId = mapItemInfo.ID;
            changeInfo.getTime = mapItemInfo.getTime;
            changeInfo.pos = { x: mapItemInfo.row, y: mapItemInfo.col };
            changeInfo.isReverse = mapItemInfo.isReverse ? 1 : 0;
            changeInfo.opt = opt == 'pushToPack' ? 1 : 0;//0是添加，1是移除
            return changeInfo;
        }


        /**
         * 地图编辑保存逻辑
         * 1、点击UI布置按钮进入编辑模式，这个时候，保存，就是正常保存
         * 2、长按地图建筑进入编辑模式，这个时候，保存，也是正常保存
         * 3、从商店购买或者从生产面板进入编辑模式，这个情况，进入保存
         *   （1）保存的loading不能那么久，所有保存流程需要优化
         *   （2）不能保存完就去后台拉取背包信息，因为只保存一个的情况，能够保证背包的数据正确
         *   （3）保存完，需要判断这个活动或者装饰不是有多个，如果有多个可以进入下一轮编辑
         * 
         */
        private onOpreateEditClick(opt: 'sure' | 'cancle' | 'pushToPack') {
            let partyItemInfo = this._mcOperateItem.getOperateMapItemInfo();
            var optInfo: pb.mapItem;
            // this._lastAddMapItemInfo = null;
            switch (opt) {
                case 'sure':
                    if (!this._mcOperateItem.buildingCanPutFlag) {
                        alert.showFWords("当前这个位置不能摆放！");
                        return;
                    }
                    partyItemInfo.row = this._mcOperateItem.mapItemPreRow;
                    partyItemInfo.col = this._mcOperateItem.mapitemPreCol;
                    partyItemInfo.isReverse = this._mcOperateItem.isReverse;
                    partyItemInfo.putState = 1;

                    optInfo = this.createOptInfo(partyItemInfo, opt);
                    this._optHash.add(optInfo.getTime, optInfo);
                    PartyItemManager.changePartyItemState(partyItemInfo);
                    break;
                case 'cancle':
                    this.resumePreMapItem();
                    MapEditorManager.getInstance().resumePreMapItem();
                    break;
                case 'pushToPack':
                    optInfo = this.createOptInfo(partyItemInfo, opt);
                    this._optHash.add(optInfo.getTime, optInfo);
                    partyItemInfo.putState = 0;
                    PartyItemManager.addOneDecToPackage(partyItemInfo.ID);
                    PartyItemManager.changePartyItemState(partyItemInfo);
                    if (optInfo.getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {/**之前就不是在地图里面的 */
                        this._optHash.remove(optInfo.getTime);
                    }
                    break;
                default:
                    break;
            }
            this._mainUI.refreshList();
            this._mcOperateItem.hideOperateMapItem();//影藏UI

            egret.Tween.get(this._mainUI.boxPackage).to({ y: 750 - 188 }, 350, egret.Ease.backOut).call(()=>{
                if(GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitShowEditUIOver"){
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            });

            /**点击保存摆放 */
            if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPartyEditSureBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            /** 刚放进去的装饰，拿不到img的高，所以需要做个延迟排序 */
            Laya.timer.frameOnce(5,this,()=>{
                MapManager.sortMapItems();
            })
        }
        private onSaveClick() {
            let optItemArr = this.parseOptInfoArr();
            if (optItemArr.length == 0) {
                alert.showFWords('没有任何更改');
                this.hideUI();
                return;
            }
            LoadingManager.showSmall('保存中，请稍等。。。');
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPartyEditSaveBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            net.sendAndWait(new pb.cs_party_house_builds_opt({ itemInfo: optItemArr }))
                .then((data: pb.sc_party_house_builds_opt) => {
                    PartyItemManager.refreshAllMapItems(data.buildsInMap);
                })
                .then(() => {
                    return PartyItemManager.checkPartyItemsInPackage();
                })
                .then(() => {
                    return LoadingManager.hideSmall()
                })
                .then(() => { 
                    MapManager.sortMapItems();
                    this.hideUI() 
                })
                .then(() => {
                    if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitPartyEditSaveOver") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                    }
                })
                .catch(() => {
                    MapManager.sortMapItems();
                    LoadingManager.hideSmall(true);
                    this.hideUI();
                });
        }

        /**
         * 操作列表需要做的处理
         * 1、对于从背包里面拿出来的装饰，临时生产的getTime需要再提交给后台的时候，把getTime置0
         * 2、添加跟移动操作拆成两个。对于操作类型为0（添加），如果之前这个建筑已经在地图，那么需要把类型改成2
         * 3、返回背包的操作需要放到数组的前面
         */
        private parseOptInfoArr(): pb.ImapItem[] {
            let arr = this._optHash.getValues();
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {
                    arr[i].getTime = 0;
                }
                let isOnMap = _.find(PartyItemManager.mapServerData, { 'getTime': arr[i].getTime });
                if (isOnMap && arr[i].opt == 0) {
                    arr[i].opt = 2;
                }
                if (arr[i].opt == 1) {
                    let tmpOptInfo = arr.splice(i, 1);
                    arr.unshift(...tmpOptInfo);
                }
            }
            //
            this.addSpecialChangeInfo(arr, PartyItemManager.curWallID, PartyItemManager.preWallID);
            this.addSpecialChangeInfo(arr, PartyItemManager.curGroundID, PartyItemManager.preGroundID);
            this.addSpecialChangeInfo(arr, PartyItemManager.curDoorID, PartyItemManager.preDoorID);
            return arr;
        }

        private addSpecialChangeInfo(arr: pb.ImapItem[], cur: number, pre: number) {
            if (cur != pre) {
                let changeInfo = new pb.mapItem();
                changeInfo.buildId = cur;
                changeInfo.getTime = 0;
                changeInfo.pos = { x: 0, y: 0 };
                changeInfo.isReverse = 0;
                changeInfo.opt = 0;//0是添加，1是移除
                arr.push(changeInfo);
            }
        }

        private onUndoClick() {
            if (this._optHash.length > 0)
                alert.showSmall('是否撤销本次的全部操作？', { callBack: { caller: this, funArr: [this.undo] } });
            else
                this.hideUI();
        }

        private onCloseClick() {
            let optArr = this.parseOptInfoArr();
            if (optArr.length > 0) {
                alert.showSmall('你还有更改没有保存，确认退出吗？', { callBack: { caller: this, funArr: [this.sureClose] } });
            }
            else {
                this.hideUI();
            }
        }

        private sureClose() {
            this.undo();
            this.hideUI();
        }

        private undo() {
            let optArr = this.parseOptInfoArr();
            if (optArr.length > 0) {
                net.sendAndWait(new pb.cs_party_house_builds_opt({ itemInfo: [] }))
                    .then((data: pb.sc_party_house_builds_opt) => {
                        PartyItemManager.refreshAllMapItems(data.buildsInMap);
                        this._mcOperateItem.hideOperateMapItem();
                        this._optHash.clear();
                    }).then(() => {
                        return PartyItemManager.checkPartyItemsInPackage();
                    })
                    .then(() => {
                        this._mainUI.refreshList();
                        MapManager.refreshMapOccupyState();

                    });
            }
        }
        private async showGachapon(e: Laya.Event) {
            let shopMode = await ModuleManager.open('party.PartyEggSelectModule');
        }
        private refreshPackageList(){
            this._mainUI.refreshList();
        }
        private addEventListeners() {
            this._mainUI.btnClose.on(Laya.Event.CLICK, this, this.onCloseClick);
            this._mainUI.btnClearAllDecs.on(Laya.Event.CLICK, this, this.clearAllMapItem);
            this._mainUI.btnGachapon.on(Laya.Event.CLICK, this, this.showGachapon);
            this._mainUI.btnSave.on(Laya.Event.CLICK, this, this.onSaveClick);
            this._mainUI.btnUndo.on(Laya.Event.CLICK, this, this.onUndoClick);
            this._mainUI.btnCancel.on(Laya.Event.CLICK, this, this.onOpreateEditClick, ['cancle']);
            this._mainUI.btnSure.on(Laya.Event.CLICK, this, this.onOpreateEditClick, ['sure']);
            this._mainUI.btnMoveToPackage.on(Laya.Event.CLICK, this, this.onOpreateEditClick, ['pushToPack']);
            this._mainUI.btnReverse.on(Laya.Event.CLICK, this, this.onReverseClick);
            this._mainUI.btnShowDetail.on(Laya.Event.CLICK,this,this.showDetailInfo);
            this._mainUI.btnShowGrid.on(Laya.Event.CLICK, this, this.showGrid);
            this._mainUI.btnHideGrid.on(Laya.Event.CLICK, this, this.hideGrid);
            this._mainUI.btnSaveScheme.on(Laya.Event.CLICK, this, this.showSaveScheme);
            this._mainUI.btnUseScheme.on(Laya.Event.CLICK, this, this.showScheme);
            EventManager.on("party_egg_module_close",this,this.refreshPackageList);
        }
        private showDetailInfo(){
            clientCore.ModuleManager.open("party.PartyDecoDetailPanel",this._mcOperateItem.getOperateMapItemInfo().ID);
        }
        private showSaveScheme() {
            clientCore.ModuleManager.open("party.SavePanel");
        }
        private showScheme() {
            clientCore.ModuleManager.open("party.SchemePanel");
        }
        private showGrid(e: Laya.Event) {
            let mapItemInfo: PartyItemInfo = this._mcOperateItem.getOperateMapItemInfo();
            let type: number = mapItemInfo ? mapItemInfo.putType : 1;
            MapManager.refreshGridState(type);
            this.showGridBtnsState(true);
            MapManager.setGridLayerVisible(true);
        }

        private hideGrid(e: Laya.Event) {
            this.showGridBtnsState(false);
            MapManager.setGridLayerVisible(false);
        }
        public showGridBtnsState(show: boolean) {
            this._mainUI.btnShowGrid.visible = !show;
            this._mainUI.btnHideGrid.visible = show;
        }
        private onReverseClick(e: Laya.Event) {
            this._mcOperateItem.reverseMapItem();
        }

        private clearAllMapItem(e: Laya.Event) {
            alert.showSmall('是否收起小屋中所有装饰', { callBack: { caller: this, funArr: [this.sureClearAll] } });
        }
        /** 确定把地图中所有装饰收进背包 */
        private sureClearAll() {
            let allDescInMap = PartyItemManager.partyMapItemArr.slice();
            for (const item of allDescInMap) {
                let optInfo = this.createOptInfo(item.itemInfo, 'pushToPack');
                this._optHash.add(optInfo.getTime, optInfo);
                PartyItemManager.addOneDecToPackage(item.itemInfo.ID, false);
                item.itemInfo.putState = 0;
                PartyItemManager.changePartyItemState(item.itemInfo);
                if (optInfo.getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {/**之前就不是在地图里面的 */
                    this._optHash.remove(optInfo.getTime);
                }
            }
            this._mainUI.refreshList();
            this._mcOperateItem.hideOperateMapItem();//影藏UI
            egret.Tween.get(this._mainUI.boxPackage).to({ y: 750 - 188 }, 350, egret.Ease.backOut);
        }

        //如果是从上一个操作对象跳过来，那么上一个对象的信息需要还原下
        public showOperateMapItem(info: PartyItemInfo, pos: { row: number, col: number } = { row: -1, col: -1 }, newAddFlag: boolean = true) {
            this.resumePreMapItem();
            this._mcOperateItem.hideOperateMapItem();
            this._mcOperateItem.showMapItem(info, pos);
            this._mainUI.btnReverse.visible = info.canReverse;
            MapManager.refreshGridState(this._mcOperateItem.getOperateMapItemInfo().putType);
            if (newAddFlag) {/**过滤长按地图建筑物的情况 */
                PartyItemManager.getDecFromPackage(info.ID);
            }

            egret.Tween.removeTweens(this._mainUI.boxPackage);
            egret.Tween.get(this._mainUI.boxPackage).to({ y: 750 }, 350, egret.Ease.backIn);

            this.displayEditBox();
        }
        /**
         * 撤销上一步操作，可以使点击取消，也可以使拖动的时候，点击了其他的建筑
         */
        public resumePreMapItem() {
            let preItemInfo = this._mcOperateItem.getOperateMapItemInfo();
            if (preItemInfo) {
                if (preItemInfo.putState == 0) {
                    PartyItemManager.addOneDecToPackage(preItemInfo.ID);
                }
                else {
                    PartyItemManager.changePartyItemState(preItemInfo)
                }
            }
        }
        public mapItemChangePos(x: number, y: number) {
            this._mcOperateItem.pos(x, y);
        }
        public startDragOperateMapItem() {
            this._mcOperateItem.startDragInit();
        }
        // 
        public showUI(type: number = -1) {
            clientCore.LayerManager.uiLayer.addChild(this._mainUI);
            // this._mainUI.btnGachapon.visible = MapInfo.isSelfParty;//自己的派对里面显示扭蛋
            this._mainUI.showTabByIndex(type);
            MapInfo.mapEditState = true;
            this._optHash.clear();
            MapManager.refreshMapOccupyState();
            MapManager.enterEditMode();
            this.showGridBtnsState(false);
            this._mainUI.boxPackage.y = 750 - 188;
        }
        public hideUI(e: Laya.Event = null) {
            MapManager.setGridLayerVisible(false);
            this._mainUI.removeSelf();
            this.resumePreMapItem();
            this._mcOperateItem.hideOperateMapItem();
            MapInfo.mapEditState = false;
            MapManager.exitEditMode();
        }
        public checkHaveOperateTarget(): boolean {
            if(!this._mcOperateItem){
                return false;
            }
            return this._mcOperateItem.getOperateMapItemInfo() != null;
        }

        public showEditBox(flag: boolean) {
            this._mainUI.mcEditPanel.visible = flag;
            if (flag)
                Laya.timer.frameLoop(1, this, this.displayEditBox);
            else
                Laya.timer.clear(this, this.displayEditBox);
        }

        /**每一帧跟踪显示编辑框UI（缩放，位移） */
        private displayEditBox() {
            let globalPos = MapManager.mapItemsLayer.localToGlobal(new Laya.Point(this._mcOperateItem.x, this._mcOperateItem.y));
            this._mainUI.mcEditPanel.pos(globalPos.x, globalPos.y, true);
        }

        /**当前手上是否拿了一个建筑 */
        public get isPartyItemDraging() {
            return this._mcOperateItem && this._mcOperateItem.isDraging;
        }
    }
}