
namespace clothChange {
    import cloth_type = clientCore.CLOTH_TYPE;
    const DAPEI: number = 55555;//搭配
    const TAB_BASE_CHILDREN: number[] = [
        cloth_type.CLOTH_ARR,
        cloth_type.FACE_ARR,
        cloth_type.Skin,
        cloth_type.JEWELRY_ARR,
        cloth_type.SUIT_ARR,
        cloth_type.DECO_ARR,
        DAPEI
    ];

    const TAB_BASE_TWINKLE_CHILDREN: number[] = [
        cloth_type.CLOTH_ARR,
        cloth_type.JEWELRY_ARR,
        cloth_type.SUIT_ARR,
        DAPEI
    ];

    export const TAB_CLOTH_CHILDREN: number[] = [
        cloth_type.Hair,
        cloth_type.Cloth,
        cloth_type.Skirt,
        cloth_type.Shoe,
        cloth_type.Wing,
    ]

    export const TAB_FACE_CHILDREN: number[] = [
        cloth_type.Eyebrow,
        cloth_type.Eye,
        cloth_type.Mouth
    ];

    export const TAB_JEWERY_CHILDREN: number[] = [
        cloth_type.HandTool,
        cloth_type.Head,
        cloth_type.Ear,
        cloth_type.Necklace,
        cloth_type.Hand,
        cloth_type.Belt,
        cloth_type.Anklet,
        cloth_type.Face
    ];

    export const TAB_DECO_CHILDREN: number[] = [
        cloth_type.Bg,
        cloth_type.Stage,
        cloth_type.Rider
    ];
    const UI_NAME_DIC: util.HashMap<string> = new util.HashMap();
    UI_NAME_DIC.add(cloth_type.HandTool, 'shouchi');
    UI_NAME_DIC.add(cloth_type.Head, 'toushi');
    UI_NAME_DIC.add(cloth_type.Face, 'mianshi');
    UI_NAME_DIC.add(cloth_type.Hair, 'faxing');
    UI_NAME_DIC.add(cloth_type.Ear, 'ershi');
    UI_NAME_DIC.add(cloth_type.Necklace, 'xianglian');
    UI_NAME_DIC.add(cloth_type.Belt, 'yaodai');
    UI_NAME_DIC.add(cloth_type.Cloth, 'shangyi');
    UI_NAME_DIC.add(cloth_type.Hand, 'shoushi');
    UI_NAME_DIC.add(cloth_type.Shoe, 'xiezi');
    UI_NAME_DIC.add(cloth_type.Anklet, 'jiaoshi');
    UI_NAME_DIC.add(cloth_type.Skirt, 'xiazhuang');
    UI_NAME_DIC.add(cloth_type.Wing, 'chibang');
    UI_NAME_DIC.add(cloth_type.Eyebrow, 'meimao');
    UI_NAME_DIC.add(cloth_type.Eye, 'yanjing');
    UI_NAME_DIC.add(cloth_type.Mouth, 'zuiba');
    UI_NAME_DIC.add(cloth_type.Skin, 'fuse');
    UI_NAME_DIC.add(cloth_type.Bg, 'beijingxiu');
    UI_NAME_DIC.add(cloth_type.Stage, 'wutai');
    UI_NAME_DIC.add(cloth_type.Rider, 'zuoqi');
    //特殊
    UI_NAME_DIC.add(cloth_type.SUIT_ARR, 'taozhuang');
    UI_NAME_DIC.add(cloth_type.FACE_ARR, 'mianzhuang');
    UI_NAME_DIC.add(cloth_type.JEWELRY_ARR, 'shiping');
    UI_NAME_DIC.add(cloth_type.DECO_ARR, 'zhuangshi');
    UI_NAME_DIC.add(cloth_type.CLOTH_ARR, 'fuzhuang');
    UI_NAME_DIC.add(DAPEI, 'dapei');


    import BgShowInfo = clientCore.BgShowInfo;
    import BgShowManager = clientCore.BgShowManager;

    export class ClothPanel implements IClothChangePanel {
        protected mainUI: ui.clothChange.panel.ClothPanelUI;
        private _xlsCloth: util.HashMap<xls.itemCloth>;
        private _clothType: number;
        private _lastIsFace: boolean;
        private _tabControl: SellTabControl;
        private _renamePanel: RenameImagePanel;
        private _buyBgShowPanel: BuyBgShowPanel;
        private _skinPriceInfo: xls.shop[];

        constructor(ui: any) {
            this.mainUI = ui;
            this.mainUI.drawCallOptimize = true;
            this.mainUI.suitList.visible = false;
            this.mainUI.clothList.vScrollBarSkin = null;
            this.mainUI.suitList.vScrollBarSkin = null;
            this.mainUI.clothList.renderHandler = new Laya.Handler(this, this.onClothListRender);
            this.mainUI.clothList.mouseHandler = new Laya.Handler(this, this.onClothListSelect);
            this._xlsCloth = xls.get(xls.itemCloth);
            //任务引导哪里，需要把恋语花套装放到第一套
            let suitArr = clientCore.SuitsInfo.getAllMySuit();
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                for (let i = 0; i < suitArr.length; i++) {
                    if (suitArr[i] == 2100018) {
                        suitArr[i] = suitArr[0];
                        suitArr[0] = 2100018;
                    }
                }
            }
            //套装
            this.mainUI.suitList.renderHandler = new Laya.Handler(this, this.onSuitListRender);
            this.mainUI.suitList.mouseHandler = new Laya.Handler(this, this.onSuitListSelect);
            this.mainUI.suitList.dataSource = suitArr.sort((a, b) => {
                return clientCore.SuitsInfo.getSuitInfo(b).suitInfo.quality - clientCore.SuitsInfo.getSuitInfo(a).suitInfo.quality;
            });
            //搭配
            this.mainUI.dapeiList.vScrollBarSkin = null;
            this.mainUI.dapeiList.renderHandler = new Laya.Handler(this, this.onDapeiListRender);
            this.mainUI.dapeiList.mouseHandler = new Laya.Handler(this, this.onDapeiListSelect);
            this._skinPriceInfo = _.filter(xls.get(xls.shop).getValues(), (element) => { return element.type == 5 });
            this.mainUI.dapeiList.dataSource = _.sortBy(ClothChangeModel.instance.getAllImages(), (o) => {
                let haveSave = o.srvData && o.srvData.clothesid.length > 0;
                return !haveSave
            }, (o) => {
                let unlocked = this.getUnlockCondition(o.xlsInfo.condition).unlocked;
                return !unlocked
            });
            //背景秀
            this.mainUI.decoList.vScrollBarSkin = null;
            this.mainUI.decoList.renderHandler = new Laya.Handler(this, this.onDecoListRender);
            this.mainUI.decoList.mouseHandler = new Laya.Handler(this, this.onDecoListMouse);
            //皮肤
            this.mainUI.skinList.vScrollBarSkin = null;
            this.mainUI.skinList.renderHandler = new Laya.Handler(this, this.onSkinListRender);
            this.mainUI.skinList.mouseHandler = new Laya.Handler(this, this.onSkinListMouse);
            this.mainUI.skinList.dataSource = _.filter(this._xlsCloth.getValues(), (o) => { return o.sex == clientCore.LocalInfo.sex && o.kind == cloth_type.Skin });
            //搜索
            this.mainUI.searchList.vScrollBarSkin = null;
            this.mainUI.searchList.renderHandler = new Laya.Handler(this, this.onClothListRender);
            this.mainUI.searchList.mouseHandler = new Laya.Handler(this, this.onClothListSelect);
            //
            let typeHash = this.createTab();
            this._clothType = cloth_type.Hair;
            this._tabControl = new SellTabControl(this.mainUI.boxTabCon, typeHash, this._clothType, UI_NAME_DIC, new Laya.Handler(this, this.onClothTypeChange));
            this.showView();
            BC.addEvent(this, this.mainUI.imgOk, Laya.Event.CLICK, this, this.onSave);
            BC.addEvent(this, EventManager, globalEvent.USER_CHANGE_CLOTH, this, this.updateOkBtn);
            BC.addEvent(this, EventManager, 'CLOTHCHANGE_NEED_CONTINUE_BG', this, this.contiuneBgShowTime);
            BC.addEvent(this, this.mainUI.clip_cp, Laya.Event.CLICK, this, this.changeCoupeState);
            BC.addEvent(this, this.mainUI.btnFind, Laya.Event.CLICK, this, this.onFindClick);
            BC.addEvent(this, this.mainUI.btnDownAll, Laya.Event.CLICK, this, this.onDownAll);
            BC.addEvent(this, this.mainUI.btnReturn, Laya.Event.CLICK, this, this.onReturnClick);
            BC.addEvent(this, this.mainUI.txtSearch, Laya.Event.INPUT, this, this.onFindTagChange);
            this.mainUI.clip_cp.index = ClothChangeModel.instance.showCP ? 0 : 1;
            this.updateSearchView();
        }
        public getClothCell() {
            return this.mainUI.clothList.getCell(0);
        }
        public getSuitCell() {
            return this.mainUI.suitList.getCell(0);
        }
        public getSuitTab() {
            return this._tabControl.getClothListCell(clientCore.CLOTH_TYPE.SUIT_ARR)
        }
        public getOKImg() {
            return this.mainUI.imgOk;
        }
        private updateSearchView() {
            let isSearch = this.mainUI.txtSearch.text.length > 0;
            this.mainUI.searchList.visible = isSearch;
            this.mainUI.boxTabCon.alpha = isSearch ? 0.5 : 1;
            this.mainUI.boxTabCon.mouseEnabled = !isSearch;
            // this.mainUI.btnFind.filters = isSearch ? util.DisplayUtil.darkFilter : [];
            this.mainUI.imgNotFind.visible = this.mainUI.searchList.length == 0;
            if (isSearch) {
                this.mainUI.suitList.visible = this.mainUI.clothList.visible = this.mainUI.dapeiList.visible = this.mainUI.decoList.visible = this.mainUI.skinList.visible = false;
            }
            else {
                this.showView();
            }
        }
        private createTab() {
            let hash = new util.HashMap<number[] | number>();
            let allDecoInfo = BgShowManager.instance.allHaveDecoShowInfos();
            let array = this instanceof TwinkleClothPanel ? TAB_BASE_TWINKLE_CHILDREN : TAB_BASE_CHILDREN;
            for (const base of array) {
                let typeArr: any = [];
                if (base == cloth_type.FACE_ARR) {
                    typeArr = TAB_FACE_CHILDREN.slice();
                }
                else if (base == cloth_type.JEWELRY_ARR) {
                    typeArr = TAB_JEWERY_CHILDREN.slice();
                }
                else if (base == cloth_type.DECO_ARR) {
                    typeArr = TAB_DECO_CHILDREN.slice();
                }
                else if (base == cloth_type.CLOTH_ARR) {
                    typeArr = TAB_CLOTH_CHILDREN.slice();
                }
                else {
                    typeArr = base;
                }
                //如果某个部位没有 过滤tab页
                if (typeArr instanceof Array) {
                    //舞台，背景秀，坐骑单独过滤
                    if (base == cloth_type.DECO_ARR)
                        typeArr = _.filter(typeArr, (clothKind) => { return _.filter(allDecoInfo, (o) => { return o.xlsInfo.clothKind == clothKind }).length > 0 });
                    else
                        typeArr = _.filter(typeArr, (o) => { return ClothChangeModel.instance.getInfoByType(o).length > 0 });
                    if (typeArr.length > 0)
                        hash.add(base, typeArr)
                }
                else {
                    hash.add(base, typeArr)
                }
            }
            return hash;
        }

        protected onClothTypeChange(clothType: number) {
            let isFace: boolean = TAB_FACE_CHILDREN.indexOf(clothType) != -1;
            if (!this._lastIsFace && isFace) ClothChangeModel.instance.tweenScale(true)
            else if (this._lastIsFace && !isFace) ClothChangeModel.instance.tweenScale(false);
            this._lastIsFace = isFace;
            this._clothType = clothType;
            this.showView();
        }

        protected onClothListRender(cell: ui.clothChange.render.ClothRenderUI, idx: number) {
            let info: clientCore.ClothInfo = cell.dataSource;
            cell.styleList.visible = false;
            cell.tagList.visible = false;
            cell.txtName.text = info.name;
            cell.img.skin = `res/cloth/icon/${info.id}.png`;
            cell.imgSelect.visible = ClothChangeModel.instance.person.isIdWearing(info.id);
            cell.imgNew.visible = info.serverInfo.isnew == 1;
            cell.imgCollect.skin = `clothChange/collect_${info.serverInfo.isCollection}.png`;
            cell.starList.repeatX = this._xlsCloth.get(info.id).quality;
        }

        private onClothListSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = e.currentTarget['dataSource'] as clientCore.ClothInfo;
                let id: number = info.id;
                //设置收藏
                if (e.target.name == 'collect') {
                    ClothChangeModel.instance.setCollect(id);
                    this.refreshCloths();
                    return;
                }

                if (ClothChangeModel.instance.person.isIdWearing(id)) {
                    ClothChangeModel.instance.person.downById(id);
                }
                else {
                    let list = this.mainUI.searchList.visible ? this.mainUI.searchList : this.mainUI.clothList;
                    let cell = list.getCell(idx);
                    if (cell)
                        cell['ani1'].play(0, false);
                    ClothChangeModel.instance.person.upById(id);
                }
                if (info.serverInfo.isnew) {
                    ClothChangeModel.instance.setNewStateOff(info.id);
                }
                this.mainUI.clothList.startIndex = this.mainUI.clothList.startIndex;
                this.mainUI.searchList.startIndex = this.mainUI.searchList.startIndex;
                this.mainUI.skinList.startIndex = this.mainUI.skinList.startIndex;
                this.updateOkBtn();
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothChangeClothCell") {
                    this._tabControl.scrollToEnd();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        private refreshCloths(): void {
            if (this.mainUI.clothList.visible) {
                this.mainUI.clothList.array = ClothChangeModel.instance.getInfoByType(this._clothType);
            } else {
                this.mainUI.searchList.array = ClothChangeModel.instance.getInfoBySearch(this.mainUI.txtSearch.text);;
            }
        }

        private onDownAll() {
            let cloth = clientCore.SuitsInfo.getSuitInfo(2100150).clothes;
            cloth.push(clientCore.LocalInfo.sex == 1 ? 4300001 : 4300005);
            ClothChangeModel.instance.person.replaceByIdArr(cloth);
            ClothChangeModel.instance.upDecoShowId(0, cloth_type.Bg);
            ClothChangeModel.instance.upDecoShowId(0, cloth_type.Rider);
            ClothChangeModel.instance.upDecoShowId(0, cloth_type.Stage);
            this.mainUI.clothList.startIndex = this.mainUI.clothList.startIndex;
            this.mainUI.searchList.startIndex = this.mainUI.searchList.startIndex;
            this.mainUI.skinList.startIndex = this.mainUI.skinList.startIndex;
            this.mainUI.decoList.startIndex = this.mainUI.decoList.startIndex;
            this.updateOkBtn();
        }

        private onSuitListRender(cell: ui.clothChange.render.SuitRenderUI, idx: number) {
            let id = cell.dataSource as number;
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(id);
            cell.img.skin = pathConfig.getSuitImg(id, clientCore.LocalInfo.sex);
            cell.txtName.text = suitInfo.suitInfo.name;
            cell.list.repeatX = suitInfo.suitInfo.quality;
        }

        private onSuitListSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = e.currentTarget['dataSource'] as number;
                let suitInfo = clientCore.SuitsInfo.getSuitInfo(id);
                let skinId = ClothChangeModel.instance.person.wearingId(cloth_type.Skin);
                ClothChangeModel.instance.person.replaceByIdArr(suitInfo.clothes);
                ClothChangeModel.instance.person.upById(skinId);
                this.updateOkBtn();
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothChangeSuitCell") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        private onDapeiListRender(cell: ui.clothChange.render.DapeiRenderUI, idx: number) {
            let data: ImageSave = cell.dataSource;
            let isEmpty = data.srvData == null;
            let lockInfo = this.getUnlockCondition(data.xlsInfo.condition);
            if (lockInfo.unlocked) {
                cell.imgLock.visible = false;
                cell.imgAdd.visible = isEmpty;
                cell.btnDelete.visible = cell.btnEdit.visible = !isEmpty;
                if (isEmpty) {
                    cell.imgRole.removeChildren();
                }
                else {
                    cell.imgRole.addChildAt(ImageSaver.instance.getImage(data.xlsInfo.id), 0);
                }
            }
            else {
                cell.imgAdd.visible = false;
                cell.btnDelete.visible = false;
                cell.btnEdit.visible = false;
                cell.imgLock.visible = true;
                cell.txtCondition.text = lockInfo.txt;
                cell.imgRole.removeChildren();
            }
            cell.txtName.text = isEmpty ? '' : data.srvData.name;
        }

        private onDecoListRender(cell: ui.clothChange.render.DecoRenderUI, idx: number) {
            let data = cell.dataSource as BgShowInfo;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            cell.listStar.repeatX = data.xlsInfo.quality;
            cell.txtName.text = data.xlsInfo.name;
            cell.imgNew.visible = data.isNew && data.restTime != 0;
            cell.boxBuy.visible = data.restTime == 0;
            cell.boxTime.visible = data.restTime != 0;
            cell.imgCp.visible = data.xlsInfo.couple == 2;
            if (cell.boxBuy.visible) {
                cell.txtPrice.text = data.xlsInfo.cost.v2.toString();
                cell.imgBuyIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.xlsInfo.cost.v1);
            }
            if (cell.boxTime.visible) {
                cell.txtTime.text = data.restTime == -1 ? '永久' : Math.ceil(data.restTime / 3600 / 24).toString();
            }
            cell.imgSelect.visible = data.id == ClothChangeModel.instance.getCurrSelectDecoId(this._clothType);
        }

        private onSkinListRender(cell: ui.clothChange.render.SkinRenderUI, idx: number) {
            let info = cell.dataSource as xls.itemCloth;
            cell.txtName.text = info.name;
            cell.img.skin = clientCore.ItemsInfo.getItemIconUrl(info.clothesId);
            cell.imgSelect.visible = ClothChangeModel.instance.person.isIdWearing(info.clothesId);
            cell.starList.repeatX = info.quality;
            cell.imgVipSkin.visible = info.channelType.length > 0 && parseInt(info.channelType[0].split('/')[1]) == 52;
            cell.imgSkinSale.visible = info.channelType.length > 0 && parseInt(info.channelType[0].split('/')[1]) == 6 && !clientCore.LocalInfo.checkHaveCloth(info.clothesId);
            if (cell.imgSkinSale.visible) {
                let shopInfo = _.find(this._skinPriceInfo, (o) => { return o.itemId == info.clothesId });
                cell.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(shopInfo.sell[0].v1);
                cell.labPrice.text = shopInfo.sell[0].v2.toString();
            }
        }

        private onSkinListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = e.currentTarget['dataSource'] as xls.itemCloth;
                let id: number = info.clothesId;
                this.mainUI.clothList.getCell(idx)['ani1'].play(0, false);
                ClothChangeModel.instance.person.upById(id);
                this.mainUI.skinList.startIndex = this.mainUI.skinList.startIndex;
                this.updateOkBtn();
            }
        }

        /**续费背景秀 */
        private async contiuneBgShowTime(ids: { arr: number[] }) {
            for (const id of ids.arr) {
                await this.showOneContinueAlert(id).then(() => {
                    return this.openContinuePanel(id)
                }).catch(() => { })
            }
        }

        private showOneContinueAlert(id: number) {
            return new Promise((ok, reject) => {
                alert.showSmall(`您的${clientCore.BgShowManager.instance.getDecoInfoById(id).xlsInfo.name}已到期,是否续费?`, {
                    callBack: {
                        caller: this,
                        funArr: [
                            ok,
                            reject
                        ]
                    }
                })
            })
        }

        private openContinuePanel(id: number) {
            this._buyBgShowPanel = this._buyBgShowPanel || new BuyBgShowPanel();
            let info = BgShowManager.instance.getDecoInfoById(id);
            this._buyBgShowPanel.show({
                targetId: id,
                targetType: ContinueType.bgShow,
                cost: info.xlsInfo.cost,
                costTime: info.xlsInfo.costTime,
                name: clientCore.ItemsInfo.getItemName(id)
            });
            clientCore.DialogMgr.ins.open(this._buyBgShowPanel);
            return new Promise((ok) => {
                this._buyBgShowPanel.once(Laya.Event.CLOSE, this, () => {
                    this.mainUI.decoList.startIndex = this.mainUI.decoList.startIndex;
                    ok();
                });
            })
        }

        private onDecoListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.mainUI.decoList.getItem(idx) as BgShowInfo;
                if (e.target.name == 'btnBuy') {
                    this.openContinuePanel(data.id);
                }
                else {
                    ClothChangeModel.instance.upDecoShowId(data.id, data.xlsInfo.clothKind);
                    this.mainUI.decoList.startIndex = this.mainUI.decoList.startIndex;
                    this.updateOkBtn();
                }
                if (data.isNew) {
                    BgShowManager.instance.setNewStateOff(data.id);
                }
            }
        }

        private getUnlockCondition(pair: xls.pair) {
            let rtn = '';
            let unlocked: boolean;
            let type = pair.v1;
            let value = pair.v2;
            switch (type) {
                case 1:
                    unlocked = clientCore.ItemsInfo.getItemNum(value) > 0;
                    rtn = '拥有' + clientCore.ItemsInfo.getItemName(value);
                    break;
                case 2:
                    unlocked = clientCore.LocalInfo.vipLv >= value;
                    rtn = 'vip等级' + value;
                    break;
                case 3:
                    unlocked = clientCore.LocalInfo.userLv >= value;
                    rtn = '角色等级' + value;
                    break;
                case 4:
                    let stageInfo = clientCore.AdventureManager.instance.getOneStageInfo(value)
                    unlocked = stageInfo ? stageInfo.state != clientCore.STAGE_STATU.NO_COMPLETE : false;
                    rtn = '通过主线关卡' + xls.get(xls.stageBase).get(value).stageTitle;
                    break;
                case 5:
                    let frindNum = clientCore.FriendManager.instance.friendNum
                    unlocked = frindNum >= value;
                    rtn = '好友人数' + value;
                    break;
                default:
                    break;
            }
            return { unlocked: unlocked, txt: rtn };
        }

        private async onDapeiListSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let item: ImageSave = this.mainUI.dapeiList.getItem(idx);
                let id = item.xlsInfo.id;
                if (e.target.name == 'btnDelete') {
                    alert.showSmall(`是否要删除搭配:${item.srvData.name}?`, {
                        callBack: {
                            caller: this, funArr: [async () => {
                                await ClothChangeModel.instance.delectImage(id);
                                this.mainUI.dapeiList.startIndex = this.mainUI.dapeiList.startIndex;
                            }]
                        }
                    })
                }
                else if (e.target.name == 'btnEdit') {
                    this._renamePanel = this._renamePanel || new RenameImagePanel();
                    this._renamePanel.show(item.xlsInfo.id);
                    this._renamePanel.on(Laya.Event.CLOSE, this, () => {
                        this.mainUI.dapeiList.startIndex = this.mainUI.dapeiList.startIndex;
                    })
                }
                else if (e.target.name == 'imgChoose') {
                    let lockInfo = this.getUnlockCondition(item.xlsInfo.condition);
                    if (!lockInfo.unlocked)
                        return;
                    if (!item.srvData) {
                        //空的添加
                        await ClothChangeModel.instance.setImageClothes(id, '我的搭配' + (idx + 1));
                        this.mainUI.dapeiList.startIndex = this.mainUI.dapeiList.startIndex;
                    }
                    else {
                        //换上
                        alert.showSmall(`是否要换上搭配:${item.srvData.name}?`, {
                            callBack: {
                                caller: this, funArr: [() => {
                                    ClothChangeModel.instance.person.downAllCloth();
                                    //特殊处理需要vip的皮肤
                                    let clothIds = item.srvData.clothesid.slice();
                                    if (clientCore.FlowerPetInfo.petType == 0) {
                                        _.remove(clothIds, (id) => {
                                            let xlsInfo = this._xlsCloth.get(id);
                                            return xlsInfo.quality == 3 && xlsInfo.kind == cloth_type.Skin;
                                        })
                                    }
                                    ClothChangeModel.instance.person.upByIdArr(clothIds);
                                    this.updateOkBtn();
                                }]
                            }
                        })
                    }
                }
            }
        }

        protected onSave() {
            // if (this._clothType == cloth_type.Skin) {
            let selectId = ClothChangeModel.instance.person.wearingId(cloth_type.Skin);
            let selectSkinXls = this._xlsCloth.get(selectId);
            if (selectSkinXls.channelType.length > 0 && parseInt(selectSkinXls.channelType[0].split('/')[1]) == 6 && clientCore.ItemsInfo.getItemNum(selectSkinXls.clothesId) == 0) {
                let price = _.find(this._skinPriceInfo, (o) => { return o.itemId == selectSkinXls.clothesId }).sell[0];
                alert.showSmall(`是否花费${price.v2}${clientCore.ItemsInfo.getItemName(price.v1)}购买${selectSkinXls.name}`, { callBack: { caller: this, funArr: [this.sureBuySkin] } });
                return;
            }
            if (selectSkinXls.channelType.length > 0 && parseInt(selectSkinXls.channelType[0].split('/')[1]) == 52 && clientCore.FlowerPetInfo.petType == 0) {
                alert.showFWords(`需要奇妙花宝才能使用${selectSkinXls.name}哦!`);
                return;
            }
            //     ClothChangeModel.instance.saveCloth();
            // }
            // else {
            ClothChangeModel.instance.saveCloth();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothChangeOkBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            // }
        }

        private sureBuySkin() {
            let selectId = ClothChangeModel.instance.person.wearingId(cloth_type.Skin);
            let selectSkinXls = this._xlsCloth.get(selectId);
            let price = _.find(this._skinPriceInfo, (o) => { return o.itemId == selectSkinXls.clothesId }).sell[0];
            let have = clientCore.ItemsInfo.getItemNum(price.v1);
            if (have >= price.v2) {
                let selectId = ClothChangeModel.instance.person.wearingId(cloth_type.Skin);
                net.sendAndWait(new pb.cs_player_buy_skin({ skinId: selectId })).then((data: pb.sc_player_buy_skin) => {
                    alert.showReward(data.itms);
                })
            }
            else {
                alert.showSmall( clientCore.ItemsInfo.getItemName(price.v1) + '不足,是否购买?', { callBack: { caller: this, funArr: [this.gotoMoney] } });
            }
        }

        private gotoMoney() {
            clientCore.ToolTip.gotoMod(50);
        }

        show() {
            this.mainUI.visible = true;
            Laya.timer.loop(1000, this, this.onTimer);
        }

        private showView() {
            this.mainUI.suitList.visible = this._clothType == cloth_type.SUIT_ARR;
            this.mainUI.dapeiList.visible = this._clothType == DAPEI;
            this.mainUI.decoList.visible = TAB_DECO_CHILDREN.indexOf(this._clothType) > -1;
            this.mainUI.clothList.visible = TAB_CLOTH_CHILDREN.indexOf(this._clothType) > -1 || TAB_FACE_CHILDREN.indexOf(this._clothType) > -1 || TAB_JEWERY_CHILDREN.indexOf(this._clothType) > -1;
            this.mainUI.skinList.visible = this._clothType == cloth_type.Skin;
            let clothArr = ClothChangeModel.instance.getInfoByType(this._clothType);
            //针对背景秀 | 面饰做一个缩放
            let sp = ClothChangeModel.instance.bgShowImg.parent as Laya.Box;
            let scale = TAB_DECO_CHILDREN.indexOf(this._clothType) > -1 ? 0.7 : 1;
            Laya.Tween.clearTween(sp);
            Laya.Tween.to(sp, { scaleX: scale, scaleY: scale }, 200);
            //新手任务引导的时候，直接把草长莺飞服装放到第一个
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                for (let i = 0; i < clothArr.length; i++) {
                    if (clothArr[i].suitId == 9) {
                        if (i > 0) {
                            let tmp = clothArr[i];
                            clothArr[i] = clothArr[0];
                            clothArr[0] = tmp;
                        }
                    }
                }
            }
            this.mainUI.clothList.dataSource = clothArr;
            this.mainUI.clothList.scrollTo(0);
            if (this.mainUI.decoList.visible) {
                this.sortByListByState();
            }
            this.updateOkBtn();
            this.mainUI.clip_cp.visible = this._clothType == cloth_type.Bg;
        }

        private updateOkBtn() {
            this.mainUI.imgOk.disabled = !ClothChangeModel.instance.hasClothChanged && !ClothChangeModel.instance.hasDecoChanged && !ClothChangeModel.instance.hasShowCpChanged;
        }

        private changeCoupeState() {
            let state = 1 - this.mainUI.clip_cp.index;
            let ok = ClothChangeModel.instance.changeShowCp(state == 0, true);
            if (ok) {
                //切换单双人的时候还要给他去掉背景秀
                this.mainUI.clip_cp.index = state;
                this.sortByListByState();
                ClothChangeModel.instance.upDecoShowId(0, cloth_type.Bg);
                this.updateOkBtn();
            }
        }

        private sortByListByState() {
            let needShow = this.mainUI.clip_cp.index == 0;
            let bgShowArr = _.filter(BgShowManager.instance.allHaveDecoShowInfos(), o => o.xlsInfo.clothKind == this._clothType);
            this.mainUI.decoList.dataSource = _.sortBy(bgShowArr, (o) => {
                return needShow != (o.xlsInfo.couple == 2);
            });;
            this.mainUI.decoList.selectedIndex = _.findIndex(bgShowArr, (o) => { return o.id == BgShowManager.instance.getcurrDecoByType(this._clothType) });
        }
        private onTimer() {
            if (this.mainUI.decoList.visible) {
                this.mainUI.decoList.startIndex = this.mainUI.decoList.startIndex;
            }
        }

        private onFindClick() {
            this.mainUI.btnFind.disabled = true;
            this.mainUI.searchList.dataSource = ClothChangeModel.instance.getInfoBySearch(this.mainUI.txtSearch.text);
            this.updateSearchView();
        }

        private onReturnClick() {
            this.mainUI.txtSearch.text = '';
            this.mainUI.btnFind.disabled = true;
            this.updateSearchView();
        }

        private onFindTagChange() {
            this.mainUI.btnFind.disabled = false;
        }

        hide() {
            this.mainUI.visible = false;
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            this.mainUI.skinList.destroy();
            this.mainUI.searchList.destroy();
            this.mainUI.decoList.destroy();
            this.mainUI.clothList.destroy();
            this.mainUI.dapeiList.destroy();
            this.mainUI = null;
            this._skinPriceInfo = null;
            if (this._buyBgShowPanel) {
                clientCore.DialogMgr.ins.close(this._buyBgShowPanel, false);
                this._buyBgShowPanel = null;
            }
            Laya.timer.clear(this, this.onTimer);
            this._tabControl.destroy();
            let sp = ClothChangeModel.instance.bgShowImg.parent as Laya.Box;
            if (sp)
                Laya.Tween.clearTween(sp);
            if (this._renamePanel)
                this._renamePanel.destroy();
            BC.removeEvent(this);
        }
    }
}