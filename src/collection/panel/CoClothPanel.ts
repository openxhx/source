namespace collection {
    /**
        性感	sexy	与清纯互斥
        清纯	pure	与性感互斥
        优雅	grace	与可爱互斥
        可爱	lovely	与优雅互斥
        华丽	gorgeous	与简约互斥
        简约	simple	与华丽互斥
        -------------------------------
        现代	modern	与古风互斥
        古风	ancient	与现代互斥
        清凉	cool	与保暖互斥
        保暖	warm	与清凉互斥
        校园	school	与魔幻互斥
        礼服	dress	与校园互斥
        幻想	fantasy	与魅力互斥
        魅力	charm	与幻想互斥
     */
    export enum newTag {
        sexy = 'sexy',
        pure = 'pure',
        grace = 'grace',
        lovely = 'lovely',
        gorgeous = 'gorgeous',
        simple = 'simple',
        //-------------------------
        modern = 'modern',
        ancient = 'ancient',
        cool = 'cool',
        warm = 'warm',
        school = 'school',
        dress = 'dress',
        fantasy = 'fantasy',
        charm = 'charm',
        activity = 'activity'
    }
    import SuitsInfo = clientCore.SuitsInfo;
    export class CoClothPanel implements ICollectionPanel {
        ui: ui.collection.panel.ClothPanelUI;
        private _currDetailSuitID: number;
        private curType: number;
        private _tab: number;
        private _person: clientCore.Person;
        private _tabCacheHash: util.HashMap<number>;//打开详情页，切换tab时 要缓存切换tab前察看的套装id,key是tab,value是套装id
        private _allCloth: xls.collectSuits[];
        constructor(type: number) {
            this.curType = type;
            this.ui = new ui.collection.panel.ClothPanelUI();
            this.ui.listView.list.hScrollBarSkin = null;
            this.ui.listView.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.listView.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.ui.detailView.listPart.renderHandler = new Laya.Handler(this, this.onPartRender);
            this.ui.detailView.listPart.vScrollBarSkin = null;
            this.ui.detailView.listTag.renderHandler = new Laya.Handler(this, this.newTagRender);
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
            this._person.scale(0.4, 0.4);
            this._person.pos(276, 316);
            this.ui.detailView.addChildAt(this._person, 2);
            this._tabCacheHash = new util.HashMap();
            //---------------------------------
            this.initTool();
            this.addEvent();
        }

        show() {
            if (!this.curType) {
                this._allCloth = _.filter(xls.get(xls.collectSuits).getValues(), (o) => { return o.sex != (3 - clientCore.LocalInfo.sex) });
            } else {
                this._allCloth = _.filter(xls.get(xls.collectSuits).getValues(), (o) => { return o.set == this.curType && o.sex != (3 - clientCore.LocalInfo.sex) });
            }
            this.showView('list');
            // this.changeTab(1);
            this.showPickResult();
            this.showProgress();
            this.refreshRed();
        }

        private refreshRed() {
            let all = this._allCloth;
            for (let type = 1; type <= 5; type++) {
                let canGetRwd = _.filter(all, (o) => {
                    let info = SuitsInfo.getSuitInfo(o.suitsId);
                    return info.suitInfo && info.suitInfo.type == type && info.allGet && !clientCore.CollectManager.instance.getClothGetedReward(o.suitsId)//收集齐且没领奖
                });
                this.ui['red_' + type].visible = canGetRwd.length > 0;
            }
        }

        private showProgress() {
            if (this.ui.detailView.visible) {
                let info = clientCore.SuitsInfo.getSuitInfo(this._currDetailSuitID);
                if (info) {
                    let haveArr = _.filter(info.clothes, (id) => { return clientCore.LocalInfo.checkHaveCloth(id) });
                    this.ui.txtProgress.text = haveArr.length + '/' + info.clothes.length;
                    this.ui.imgProgress.x = (haveArr.length / info.clothes.length - 1) * this.ui.imgPro.width;
                }
            }
            else {
                let haveArr = _.filter(this._allCloth, (o) => { return SuitsInfo.getSuitInfo(o.suitsId).allGet });
                this.ui.txtProgress.text = haveArr.length + '/' + this._allCloth.length;
                this.ui.imgProgress.x = (haveArr.length / this._allCloth.length - 1) * this.ui.imgPro.width;
            }
        }

        waitLoad() {
            return clientCore.CollectManager.instance.reqInfo(clientCore.CO_TYPE.CLOTH);
        }

        private showView(v: 'detail' | 'list') {
            this.ui.detailView.visible = v == 'detail';
            this.ui.listView.visible = v == 'list';
            this.ui.btnGetAll.visible = v == 'list';
            this.showProgress();
        }

        // private changeTab(newTab: number) {
        //     if (this._tab != newTab) {
        //         for (let i = 1; i <= 5; i++) {
        //             this.ui['tab_' + i].index = newTab == i ? 0 : 1;
        //         }
        //         let all = _.filter(xls.get(xls.collectSuits).getValues(), (o) => { return o.set == this.curType });
        //         let allSuitIDArr = _.filter(all, (o) => { return SuitsInfo.getSuitInfo(o.suitsId).suitInfo && SuitsInfo.getSuitInfo(o.suitsId).suitInfo.type == newTab }).map((o) => { return o.suitsId });
        //         if (newTab == 5) {//暂时将类型5/6都归类给百搭
        //             let suit6 = _.filter(all, (o) => { return SuitsInfo.getSuitInfo(o.suitsId).suitInfo && SuitsInfo.getSuitInfo(o.suitsId).suitInfo.type == 6 }).map((o) => { return o.suitsId });
        //             allSuitIDArr = allSuitIDArr.concat(suit6);
        //         }
        //         let arr = _.map(allSuitIDArr, (id) => {
        //             let info = SuitsInfo.getSuitInfo(id);
        //             return {
        //                 id: id,
        //                 allGet: info.allGet,
        //                 haveRwd: !(info.allGet && !clientCore.CollectManager.instance.getClothGetedReward(id)),
        //                 rare: 10 - info.suitInfo.quality//品质要反过来
        //             }
        //         })
        //         this.ui.listView.list.dataSource = _.sortBy(arr, ['haveRwd', 'allGet', 'rare']);
        //         this.ui.listView.list.scrollTo(0);
        //         // 打开详情页，切换tab时 要缓存切换tab前察看的套装id
        //         if (this.ui.detailView.visible) {
        //             //缓存当前tab的
        //             this._tabCacheHash.add(this._tab, this._currDetailSuitID);
        //             //如果有缓存显示
        //             if (this._tabCacheHash.has(newTab)) {
        //                 this._currDetailSuitID = this._tabCacheHash.get(newTab);
        //             }
        //             else {
        //                 this._currDetailSuitID = this.ui.listView.list.dataSource[0].id;
        //             }
        //             this.showDetailView();
        //         }
        //         this._tab = newTab;
        //     }
        // }

        private onListRender(cell: ui.collection.render.SuitRenderUI, idx: number) {
            let suitsId = cell.dataSource.id as number;
            let suitInfo = SuitsInfo.getSuitInfo(suitsId);
            cell.imgSuit.skin = pathConfig.getSuitImg(suitsId, clientCore.LocalInfo.sex);
            cell.clipRare.index = suitInfo.suitInfo.quality - 1;
            cell.txtName.text = suitInfo.suitInfo.name;
            cell.filters = suitInfo.allGet ? [] : util.DisplayUtil.darkFilter;
            cell.clipRwd.index = clientCore.CollectManager.instance.getClothGetedReward(suitsId) ? 1 : 0;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (this.ui.listView.list.array) {
                    this._currDetailSuitID = this.ui.listView.list.getItem(idx).id;
                    this.showDetailView();
                    this.showView('detail');
                }
            }
        }

        private onPartRender(cell: ui.collection.render.ClothPartRenderUI, idx: number) {
            let clothId = cell.dataSource as number;
            let xlsInfo = clientCore.ClothData.getCloth(clothId)?.xlsInfo;
            if (xlsInfo) {
                cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(clothId);
                cell.listStar.repeatX = xlsInfo.quality;
                cell.txtName.text = xlsInfo.name;
                cell.filters = clientCore.ItemsInfo.getItemNum(clothId) > 0 ? [] : util.DisplayUtil.darkFilter;
            }
        }

        private showDetailView() {
            let suitInfo = SuitsInfo.getSuitInfo(this._currDetailSuitID);
            this.ui.detailView.btnWant.visible = true;
            this.ui.detailView.boxTips.visible = false;
            this.showProgress();
            if (suitInfo) {
                this._person.replaceByIdArr(suitInfo.clothes);
                this.ui.detailView.listPart.dataSource = _.sortBy(suitInfo.clothes, (id) => {
                    return !clientCore.LocalInfo.checkHaveCloth(id);
                });
                this.ui.detailView.txtDes.text = suitInfo.suitInfo.describe;
                this.ui.detailView.btnGet.disabled = !suitInfo.allGet;
                this.onScrollEnd();
                if (suitInfo.allGet)
                    this.ui.detailView.btnWant.visible = false;
                this.ui.detailView.clipRare.index = suitInfo.suitInfo.quality - 1;
                let clothInfo = xls.get(xls.itemCloth).get(suitInfo.clothes[0]);
                let tagInfo: newTag[] = [];
                for (let i: number = 0; i < 3; i++) {
                    if (clothInfo[this.pairTag[i][0]] > 1) tagInfo.push(this.pairTag[i][0]);
                    if (clothInfo[this.pairTag[i][1]] > 1) tagInfo.push(this.pairTag[i][1]);
                }
                tagInfo = tagInfo.sort((a: newTag, b: newTag) => {
                    return clothInfo[b] - clothInfo[a];
                })
                for (let i: number = 3; i < this.pairTag.length; i++) {
                    if (clothInfo[this.pairTag[i][0]] > 1) tagInfo.push(this.pairTag[i][0]);
                    if (clothInfo[this.pairTag[i][1]] > 1) tagInfo.push(this.pairTag[i][1]);
                }
                if (clothInfo[newTag.activity] > 1) tagInfo.push(newTag.activity);
                this.ui.detailView.listTag.array = tagInfo;
            }
            let nowIdx = _.findIndex(this.ui.listView.list.dataSource, (o: any) => { return o.id == this._currDetailSuitID });
            this.ui.detailView.btnPrev.visible = nowIdx != 0;
            this.ui.detailView.btnNext.visible = nowIdx != this.ui.listView.list.length - 1;
            this.ui.detailView.txtName.text = suitInfo.suitInfo.name;
            let rwdArr: xls.pair[] = xls.get(xls.collectSuits).get(this._currDetailSuitID)?.itemReward ?? [];
            this.ui.detailView.listRwd.repeatX = rwdArr.length;
            this.ui.detailView.boxTips.width = this.ui.detailView.listRwd.width + 80;
            this.ui.detailView.listRwd.dataSource = _.map(rwdArr, (o) => {
                return {
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) },
                    num: { value: o.v2 },
                    imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) }
                }
            });
            this.ui.detailView.clipRwd.index = clientCore.CollectManager.instance.getClothGetedReward(this._currDetailSuitID) ? 1 : 0;
            if (clientCore.CollectManager.instance.getClothGetedReward(this._currDetailSuitID)) {
                this.ui.detailView.btnGet.disabled = true;
            }
        }

        private onChangePage(diff: number) {
            let nowIdx = _.findIndex(this.ui.listView.list.dataSource, (o: any) => { return o.id == this._currDetailSuitID });
            nowIdx = _.clamp(nowIdx + diff, 0, this.ui.listView.list.length);
            this._currDetailSuitID = this.ui.listView.list.dataSource[nowIdx].id;
            this.showDetailView();
        }

        private onScrollEnd() {
            let scroll = this.ui.detailView.listPart.scrollBar;
            let bg = this.ui.detailView.scrollBg;
            this.ui.detailView.imgScrollBar.y = scroll.value / scroll.max * (bg.height - this.ui.detailView.imgScrollBar.height) + bg.y;
        }

        private onTips() {
            this.ui.detailView.boxTips.visible = !this.ui.detailView.boxTips.visible;
        }

        private onGetSuitRwd() {
            clientCore.CollectManager.instance.getClothReward([this._currDetailSuitID]).then(() => {
                this.showDetailView();
                this.ui.listView.list.startIndex = this.ui.listView.list.startIndex;
                this.refreshRed();
            })
        }

        private onWant() {
            let info = xls.get(xls.collectSuits).get(this._currDetailSuitID);
            if (info)
                if (info.channelType)
                    clientCore.ToolTip.gotoMod(parseInt(info.channelType.split('/')[1]));
                else
                    alert.showSmall('当前没有获取途径', { btnType: alert.Btn_Type.ONLY_SURE });
        }
        //#region 新版tag检索
        private curPickTag: newTag[] = [];
        private limitHave: boolean;
        private limitQuality: number;
        /**tag两两互斥 */
        private pairTag: newTag[][] = [
            [newTag.sexy, newTag.pure],
            [newTag.grace, newTag.lovely],
            [newTag.gorgeous, newTag.simple],
            //-------------------------------
            [newTag.modern, newTag.ancient],
            [newTag.cool, newTag.warm],
            [newTag.school, newTag.dress],
            [newTag.fantasy, newTag.charm]
        ];
        private initTool() {
            this.ui.listLevel.renderHandler = new Laya.Handler(this, this.levelTagRender);
            this.ui.listLevel.mouseHandler = new Laya.Handler(this, this.levelTagClick);
            this.ui.listLevel.array = [2, 3, 4, 5];

            this.ui.listOther.renderHandler = new Laya.Handler(this, this.otherTagRender);
            this.ui.listOther.mouseHandler = new Laya.Handler(this, this.otherTagClick);
            this.ui.listOther.array = ['yi_yong_you'];

            this.ui.listType.renderHandler = new Laya.Handler(this, this.newTagRender);
            this.ui.listType.mouseHandler = new Laya.Handler(this, this.newTagClick, ['type']);
            this.ui.listType.array = [newTag.sexy, newTag.grace, newTag.gorgeous, newTag.pure, newTag.lovely, newTag.simple];

            this.ui.listTag.renderHandler = new Laya.Handler(this, this.newTagRender);
            this.ui.listTag.mouseHandler = new Laya.Handler(this, this.newTagClick, ['tag']);
            this.ui.listTag.array = [newTag.modern, newTag.cool, newTag.school, newTag.ancient, newTag.warm, newTag.dress, newTag.fantasy, newTag.charm, newTag.activity];

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

        private levelTagRender(item: ui.collection.render.SuitTagUI) {
            let data: number = item.dataSource;
            item.imgTag.skin = `collection/cloth/level_${data}.png`;
            item.imgSel.visible = this.limitQuality == data;
        }

        private otherTagRender(item: ui.collection.render.SuitTagUI) {
            let data: string = item.dataSource;
            item.imgTag.skin = `collection/cloth/${data}.png`;
            if (data == 'yi_yong_you') item.imgSel.visible = this.limitHave;
        }

        private newTagRender(item: ui.collection.render.SuitTagUI) {
            let data: newTag = item.dataSource;
            item.imgTag.skin = `collection/cloth/${data}.png`;
            item.imgSel.visible = this.curPickTag.indexOf(data) >= 0;
        }

        private levelTagClick(event: Laya.Event, idx: number) {
            if (event.type == Laya.Event.CLICK) {
                let data: number = this.ui.listLevel.array[idx];
                if (this.limitQuality == data) this.limitQuality = 0;
                else this.limitQuality = data;
                this.ui.listLevel.refresh();
                this.showPickResult();
            }
        }

        private otherTagClick(event: Laya.Event, idx: number) {
            if (event.type == Laya.Event.CLICK) {
                let data: string = this.ui.listOther.array[idx];
                if (data == 'yi_yong_you') this.limitHave = !this.limitHave;
                this.ui.listOther.refresh();
                this.showPickResult();
            }
        }

        private newTagClick(flag: 'type' | 'tag', event: Laya.Event, idx: number) {
            if (event.type == Laya.Event.CLICK) {
                let data: newTag
                if (flag == 'type') data = this.ui.listType.array[idx];
                else data = this.ui.listTag.array[idx];
                let curIdx = this.curPickTag.indexOf(data);
                if (curIdx >= 0) {
                    this.curPickTag.splice(curIdx, 1);
                } else {
                    this.curPickTag.push(data);
                    for (let i: number = 0; i < this.pairTag.length; i++) {
                        let selfIdx = this.pairTag[i].indexOf(data);
                        if (selfIdx >= 0) {
                            _.remove(this.curPickTag, (o) => { return o == this.pairTag[i][1 - selfIdx] });
                            break;
                        }
                    }
                }
                if (flag == 'type') this.ui.listType.refresh();
                else this.ui.listTag.refresh();
                this.showPickResult();
            }
        }

        /**清空所有tag */
        private clearAllTag() {
            this.curPickTag = [];
            this.limitQuality = 0;
            this.limitHave = false;
            this.ui.listTag.refresh();
            this.ui.listOther.refresh();
            this.ui.listType.refresh();
            this.ui.listLevel.refresh();
            this.showPickResult();
        }

        /**刷新检索结果 */
        private showPickResult() {
            let all: xls.collectSuits[] = _.cloneDeep(this._allCloth);
            if (this.limitHave)
                all = _.filter(this._allCloth, (o) => { return SuitsInfo.getSuitInfo(o.suitsId)?.allGet; });
            if (this.limitQuality > 0) {
                all = _.filter(this._allCloth, (o) => { return SuitsInfo.getSuitInfo(o.suitsId)?.suitInfo?.quality == this.limitQuality; });
            }
            for (let i: number = 0; i < this.curPickTag.length; i++) {
                let tagName: string = this.curPickTag[i];
                all = _.filter(all, (o) => {
                    let cloth = SuitsInfo.getSuitInfo(o.suitsId)?.clothes[0];
                    return xls.get(xls.itemCloth).get(cloth)[tagName] > 0;
                });
            }
            let arr = _.map(all, (o) => {
                let info = SuitsInfo.getSuitInfo(o.suitsId);
                return {
                    id: o.suitsId,
                    allGet: info.allGet,
                    haveRwd: !(info.allGet && !clientCore.CollectManager.instance.getClothGetedReward(o.suitsId)),
                    rare: 10 - info.suitInfo.quality//品质要反过来
                }
            })
            this.ui.listView.list.dataSource = _.sortBy(arr, ['haveRwd', 'allGet', 'rare']);
            this.ui.listView.list.scrollTo(0);
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
                let all = _.filter(this._allCloth, (o) => { return o.name.indexOf(keyword) > -1 });
                this.serchResult = _.map(all, (o) => {
                    let info = SuitsInfo.getSuitInfo(o.suitsId);
                    return {
                        id: o.suitsId,
                        allGet: info.allGet,
                        haveRwd: !(info.allGet && !clientCore.CollectManager.instance.getClothGetedReward(o.suitsId)),
                        rare: 10 - info.suitInfo.quality//品质要反过来
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
            item.suitName.text = SuitsInfo.getSuitInfo(item.dataSource.id).suitInfo.name;
            item.di.visible = false;
        }

        private suitNameClick(e: Laya.Event, idx: number) {
            let cell = this.ui.listSuitName.getCell(idx) as any;
            if (e.type == Laya.Event.MOUSE_DOWN) {
                cell.di.visible = true;
            } else if (e.type == Laya.Event.CLICK) {
                this.ui.boxSuitName.visible = false;
                this.ui.labInput.text = SuitsInfo.getSuitInfo(cell.dataSource.id).suitInfo.name;
                this.serchResult = [cell.dataSource];
            } else {
                cell.di.visible = false;
            }
        }
        /**搜索 */
        private onSerch() {
            if (this.serchResult.length == 0) this.showSerchResult();
            this.ui.listView.list.dataSource = _.sortBy(this.serchResult, ['haveRwd', 'allGet', 'rare']);
            this.ui.listView.list.scrollTo(0);
            this.showTool(null);
        }
        //#endregion

        /**一键领取所有奖励 */
        private getAllReward() {
            let arr = _.filter(this._allCloth, (o) => {
                let info = SuitsInfo.getSuitInfo(o.suitsId);
                return (info.allGet && !clientCore.CollectManager.instance.getClothGetedReward(o.suitsId));
            }).map((o) => { return o.suitsId });
            if (arr.length == 0) {
                alert.showFWords('所有奖励都已领取');
                return;
            }
            clientCore.CollectManager.instance.getClothReward(arr).then(() => {
                this.ui.listView.list.refresh();
            })
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.detailView.btnPrev, Laya.Event.CLICK, this, this.onChangePage, [-1]);
            BC.addEvent(this, this.ui.detailView.btnNext, Laya.Event.CLICK, this, this.onChangePage, [1]);
            BC.addEvent(this, this.ui.detailView.listPart.scrollBar, Laya.Event.CHANGE, this, this.onScrollEnd);
            BC.addEvent(this, this.ui.detailView.clipRwd, Laya.Event.CLICK, this, this.onTips);
            BC.addEvent(this, this.ui.detailView.btnGet, Laya.Event.CLICK, this, this.onGetSuitRwd);
            BC.addEvent(this, this.ui.detailView.btnWant, Laya.Event.CLICK, this, this.onWant);
            //----------------------------------------------------------------------------
            BC.addEvent(this, this.ui.btnShowTool, Laya.Event.CLICK, this, this.showTool);
            BC.addEvent(this, this.ui.btnShowPick, Laya.Event.CLICK, this, this.pickOrSerch, ['pick']);
            BC.addEvent(this, this.ui.btnShowSerch, Laya.Event.CLICK, this, this.pickOrSerch, ['serch']);
            BC.addEvent(this, this.ui.btnGetAll, Laya.Event.CLICK, this, this.getAllReward);
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
            if (this.ui.detailView.visible)
                this.showView('list');
            else
                EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this._person?.destroy();
            this.curPickTag = null;
            this.serchResult = null;
            this._allCloth = null;
            this.removeEvent();
        }
    }
}