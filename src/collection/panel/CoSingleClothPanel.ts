namespace collection {
    import ClothInfo = clientCore.ClothData;
    export class CoSingleClothPanel implements ICollectionPanel {
        ui: ui.collection.panel.SingleClothPanelUI;
        private allConfig: number[];
        private haveConfig: number[];
        constructor() {
            this.ui = new ui.collection.panel.SingleClothPanelUI();
            this.ui.list.hScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            //---------------------------------
            this.initTool();
            this.addEvent();
        }

        show() {
            this.allConfig = _.filter(xls.get(xls.collectItem).getValues(), (o) => { return o.sex == clientCore.LocalInfo.sex || o.sex == 0 }).map((o) => { return o.clothesId });
            this.haveConfig = _.filter(this.allConfig, (o) => { return clientCore.ItemsInfo.checkHaveItem(o) });
            this.ui.txtProgress.text = this.haveConfig.length + '/' + this.allConfig.length;
            this.ui.imgProgress.x = (this.haveConfig.length / this.allConfig.length - 1) * this.ui.imgPro.width;
            this.showPickResult();
        }

        waitLoad() {
            return clientCore.CollectManager.instance.reqInfo(clientCore.CO_TYPE.SANJAIN);
        }

        private onListRender(cell: ui.collection.render.SingleClothRenderUI, idx: number) {
            let clothId = cell.dataSource.id;
            let clothInfo = ClothInfo.getCloth(clothId);
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(clothId);
            cell.clipRare.index = clothInfo.xlsInfo.quality - 1;
            cell.txtName.text = clothInfo.xlsInfo.name;
            cell.filters = this.haveConfig.includes(clothId) ? [] : util.DisplayUtil.darkFilter;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.currentTarget.mouseX > 133 && e.currentTarget.mouseY < 56) {
                clientCore.ToolTip.showTips(this.ui.list.getCell(idx), { id: this.ui.list.getCell(idx).dataSource.id });
            }
        }
        //#region 新版tag检索
        private curPickTag: number[] = [];
        private initTool() {
            this.ui.listCloth.renderHandler = new Laya.Handler(this, this.tagRender);
            this.ui.listCloth.mouseHandler = new Laya.Handler(this, this.tagClick, ["cloth"]);
            this.ui.listCloth.array = [4, 8, 12, 10, 13];

            this.ui.listZs.renderHandler = new Laya.Handler(this, this.tagRender);
            this.ui.listZs.mouseHandler = new Laya.Handler(this, this.tagClick, ["zs"]);
            this.ui.listZs.array = [1, 2, 5, 6, 9, 7, 11, 3];

            this.ui.listFace.renderHandler = new Laya.Handler(this, this.tagRender);
            this.ui.listFace.mouseHandler = new Laya.Handler(this, this.tagClick, ["face"]);
            this.ui.listFace.array = [102, 103, 104];

            this.ui.panelTag.vScrollBarSkin = '';

            this.ui.labInput.text = '';
            this.ui.boxSuitName.visible = false;
            this.ui.listSuitName.vScrollBarSkin = "";
            this.ui.listSuitName.renderHandler = new Laya.Handler(this, this.suitNameRender);
            this.ui.listSuitName.mouseHandler = new Laya.Handler(this, this.suitNameClick);
            this.serchResult = [];
            this.ui.listSuitName.array = this.serchResult;

            this.pickOrSerch('pick');
        }

        private tagRender(item: ui.collection.render.ClothTypeUI) {
            let data: number = item.dataSource;
            item.txtType.text = clientCore.CLOTH_TYPE_NAME_OBJ[data];
            item.imgSel.visible = this.curPickTag.includes(data);
        }

        private tagClick(type: string, event: Laya.Event, idx: number) {
            if (event.type == Laya.Event.CLICK) {
                let list = type == "cloth" ? this.ui.listCloth : (type == "zs" ? this.ui.listZs : this.ui.listFace);
                let tag = list.getItem(idx);
                let index = this.curPickTag.indexOf(tag);
                if (index >= 0) {
                    this.curPickTag.splice(index, 1);
                } else {
                    this.curPickTag.push(tag);
                }
                list.refresh();
                this.showPickResult();
            }
        }

        /**清空所有tag */
        private clearAllTag() {
            this.curPickTag = [];
            this.ui.listFace.refresh();
            this.ui.listZs.refresh();
            this.ui.listCloth.refresh();
            this.showPickResult();
        }

        /**刷新检索结果 */
        private showPickResult() {
            let all: number[];
            if (this.curPickTag.length == 0) {
                all = this.allConfig;
            } else {
                all = _.filter(this.allConfig, (o) => {
                    return this.curPickTag.includes(ClothInfo.getCloth(o).xlsInfo.kind);
                });
            }
            let arr = _.map(all, (o) => {
                return {
                    id: o,
                    get: !this.haveConfig.includes(o),
                    rare: 10 - ClothInfo.getCloth(o).xlsInfo.quality//品质要反过来
                }
            })
            this.ui.list.array = _.sortBy(arr, ['get', 'rare']);
            this.ui.list.scrollTo(0);
        }

        /**打开检索工具 */
        private showTool(e: Laya.Event) {
            this.ui.boxTool.visible = !this.ui.boxTool.visible;
            this.ui.imgToolFlag.scaleX = this.ui.boxTool.visible ? 1 : -1;
            e?.stopPropagation();
            if (this.ui.boxTool.visible) BC.addEvent(this, this.ui, Laya.Event.CLICK, this, this.checkClick);
            else BC.removeEvent(this, this.ui, Laya.Event.CLICK, this, this.checkClick);
        }

        private checkClick(e: Laya.Event) {
            if (this.ui.boxTool?.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY))
                return;
            if (this.ui.btnShowTool?.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                return;
            }
            this.ui.boxTool.visible = false;
            this.ui.imgToolFlag.scaleX = -1;
        }

        /**选择筛选或者搜索 */
        private pickOrSerch(type: 'pick' | 'serch') {
            let isPick = type == 'pick';
            if (!isPick) this.clearAllTag();
            this.ui.boxPick.visible = isPick;
            this.ui.boxSerch.visible = !isPick;
            this.ui.imgTagFlag.x = isPick ? 0 : 190;
        }
        //#endregion

        //#region 直接搜索
        /**备选搜索结果 */
        private serchResult: any[];
        /**展示搜索结果 */
        private showSerchResult() {
            if (this.ui.labInput.text == '') {
                this.ui.boxSuitName.visible = false;
            } else {
                let keyword = this.ui.labInput.text;
                let all = _.filter(this.allConfig, (o) => { return ClothInfo.getCloth(o).xlsInfo.name.indexOf(keyword) >= 0 });
                this.serchResult = _.map(all, (o) => {
                    return {
                        id: o,
                        get: !this.haveConfig.includes(o),
                        rare: 10 - ClothInfo.getCloth(o).xlsInfo.quality//品质要反过来
                    }
                })
                if (this.serchResult.length > 0) {
                    this.ui.listSuitName.array = this.serchResult;
                    this.ui.listSuitName.scrollTo(0);
                    this.ui.boxSuitName.visible = true;
                } else {
                    this.ui.boxSuitName.visible = false;
                }
            }
        }

        private suitNameRender(item: ui.collection.render.SerchingSuitUI) {
            item.suitName.text = ClothInfo.getCloth(item.dataSource.id).xlsInfo.name;
            item.di.visible = false;
        }

        private suitNameClick(e: Laya.Event, idx: number) {
            let cell = this.ui.listSuitName.getCell(idx) as any;
            if (e.type == Laya.Event.MOUSE_DOWN) {
                cell.di.visible = true;
            } else if (e.type == Laya.Event.CLICK) {
                this.ui.boxSuitName.visible = false;
                this.ui.labInput.text = ClothInfo.getCloth(cell.dataSource.id).xlsInfo.name;
                this.serchResult = [cell.dataSource];
            } else {
                cell.di.visible = false;
            }
        }
        /**搜索 */
        private onSerch() {
            if (this.serchResult.length == 0) this.showSerchResult();
            this.ui.list.array = _.sortBy(this.serchResult, ['get', 'rare']);
            this.ui.list.scrollTo(0);
            this.showTool(null);
        }
        //#endregion

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            //----------------------------------------------------------------------------
            BC.addEvent(this, this.ui.btnShowTool, Laya.Event.CLICK, this, this.showTool);
            BC.addEvent(this, this.ui.btnShowPick, Laya.Event.CLICK, this, this.pickOrSerch, ['pick']);
            BC.addEvent(this, this.ui.btnShowSerch, Laya.Event.CLICK, this, this.pickOrSerch, ['serch']);
            BC.addEvent(this, this.ui.btnSerch, Laya.Event.CLICK, this, this.onSerch);
            BC.addEvent(this, this.ui.labInput, Laya.Event.INPUT, this, this.showSerchResult);
            // for (let i = 1; i <= 5; i++) {
            //     BC.addEvent(this, this.ui['tab_' + i], Laya.Event.CLICK, this, this.changeTab, [i]);
            // }
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        private onClose() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this.curPickTag = null;
            this.serchResult = null;
            this.allConfig = null;
            this.haveConfig = null;
            this.removeEvent();
        }
    }
}