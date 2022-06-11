namespace familyTailor.panel {

    enum Tab {
        /** 服饰*/
        CLOTH = 1,
        /** 饰品*/
        ORNAMENT,
        /** 面妆*/
        FACE
    }

    /**
     * 制作界面
     */
    export class MakePanel extends ui.familyTailor.panel.MakePanelUI {

        private _map: Object;
        /** 当前收集进度*/
        private _count: number;
        /** 所有*/
        private _total: number;
        /** 当前的Tab*/
        private _tabIndex: number;
        /** 当前选择的服饰是否已制作*/
        private _selectSuc: boolean;
        /** 人模*/
        private _person: clientCore.Person;

        constructor() {
            super();

            this.pos(90, 73);
            this.clothList.hScrollBarSkin = "";
            this.clothList.renderHandler = Laya.Handler.create(this, this.clothRender, null, false);
            this.clothList.selectHandler = Laya.Handler.create(this, this.clothSelect, null, false);
            this.materialList.renderHandler = Laya.Handler.create(this, this.materialRender, null, false);
            this.materialList.selectHandler = Laya.Handler.create(this, this.materialSelect, null, false);

            let isTailor: boolean = FamilyTailorModel.ins.shopType == ShopType.TAILOR;
            this.btnMake.fontSkin = isTailor ? "commonBtn/T_y_zhizuo.png" : "commonBtn/T_y_exchange.png";
            this.txDesc.changeText(isTailor ? "制作材料" : "兑换材料");
            this.boxName.visible = !isTailor;
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "familyTailorMakePanelOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private onRedChange(id: number | number[]) {
            if (id == 4601)
                this.updateRed();
        }

        public addEventListeners(): void {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["tab" + i], Laya.Event.CLICK, this, this.onTab, [i]);
            }
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
            BC.addEvent(this, EventManager, globalEvent.CLOTH_CHANGE, this, this.onChangeCloth);
            BC.addEvent(this, EventManager, globalEvent.RED_POINT_CHANGED, this, this.onRedChange);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);

        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "familyTailorModuleMake") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "firstCell") {
                    var obj: any;
                    obj = this.clothList.getCell(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (this[objName]) {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public init(array: data.ClothData[]): void {
            this._map = null;
            this._map = {};
            this._count = 0;
            this._total = array.length;
            this._tabIndex = -1;
            let suitId: number;
            let clothIds: number[] = [];
            /** 服饰（发型、上衣、下装、鞋子、翅膀）*/
            let cloths: number[] = [
                clientCore.CLOTH_TYPE.Hair,
                clientCore.CLOTH_TYPE.Cloth,
                clientCore.CLOTH_TYPE.Skirt,
                clientCore.CLOTH_TYPE.Shoe,
                clientCore.CLOTH_TYPE.Wing
            ];
            /** 饰品（手持、头饰、耳朵、项链、手饰、腰带、脚饰）*/
            let ornaments: number[] = [
                clientCore.CLOTH_TYPE.HandTool,
                clientCore.CLOTH_TYPE.Head,
                clientCore.CLOTH_TYPE.Ear,
                clientCore.CLOTH_TYPE.Necklace,
                clientCore.CLOTH_TYPE.Hand,
                clientCore.CLOTH_TYPE.Belt,
                clientCore.CLOTH_TYPE.Anklet
            ];
            /** 面妆（眉毛、眼睛、嘴巴、面饰）*/
            let faces: number[] = [
                clientCore.CLOTH_TYPE.Eyebrow,
                clientCore.CLOTH_TYPE.Eye,
                clientCore.CLOTH_TYPE.Mouth,
                clientCore.CLOTH_TYPE.Face
            ];

            _.forEach(array, (element: data.ClothData) => {
                let cloth: clientCore.ClothInfo = clientCore.ClothData.getCloth(element.xlsData.clothId);
                let type: number = cloth.clothType;
                let array: number[][] = [cloths, ornaments, faces];
                for (let i: number = 0; i < 3; i++) {
                    let ele: number[] = array[i];
                    if (ele.indexOf(type) != -1) {
                        this.addCloth(i + 1, element);
                        break;
                    }
                }
                clothIds.push(element.xlsData.clothId);
                clientCore.LocalInfo.checkHaveCloth(cloth.id) && this._count++;
                suitId = suitId || cloth.suitId;
            })
            this.updateRed();
            for (let i: number = 1; i <= 3; i++) {
                this["imgSuc" + i].visible = this.checkAllSuc(i);
                let tab: Laya.Image = this["tab" + i];
                tab.disabled = !this._map[i] || this._map[i].length == 0;
                this['tx_' + i].gray = !this._map[i] || this._map[i].length == 0;
            }

            //在服装圣殿显示套装名称
            if (this.boxName.visible) {
                this.txSuitName.text = array[0].xlsData.name;
            }

            this.showPerson(clothIds);
            this.txProgress.changeText("收集进度:" + this._count + "/" + this._total);
            this.onTab(Tab.CLOTH);

            Laya.timer.frameOnce(2, this, () => {
                this.popupOver();
            });
        }

        private checkCloth(type: number, array: number[]): boolean {
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let cloth: clientCore.ClothInfo = clientCore.ClothData.getCloth(array[i]);
                if (cloth && cloth.clothType == type) {
                    return true;
                }
            }
            return false;
        }

        private updateRed() {
            for (let i = 1; i <= 3; i++) {
                let clothArr = this._map[i] as data.ClothData[];
                this['imgRed_' + i].visible = _.findIndex(clothArr, (o) => {
                    return o.checkCanMake()
                }) > -1;
            }
            this.clothList.startIndex = this.clothList.startIndex;
        }

        public destroy(): void {
            this._person && this._person.destroy();
            this._person = this._map = null;
            super.destroy();
        }

        private addCloth(type: Tab, cls: data.ClothData): void {
            let array: data.ClothData[] = this._map[type];
            if (!array) {
                array = [];
                this._map[type] = array;
            }
            array.push(cls);
        }

        /**
         * 选择分页
         * @param type 1-服饰 2-头饰 3-面妆 
         */
        private onTab(type: Tab): void {
            if (this._tabIndex == type) return;
            for (let i: number = 1; i <= 3; i++) {
                this["tab" + i].skin = type == i ? "familyTailor/l_y_1.png" : "familyTailor/l_y_2.png";
            }
            this.clothList.array = this.sortCloths(this._map[type]);
            this.clothList.selectedIndex = -1;
            this.clothList.scrollBar.value = this.clothList.selectedIndex = 0;
            this._tabIndex = type;
        }

        private sortCloths(array: data.ClothData[]): data.ClothData[] {
            array = _.sortBy(array, (element) => {
                return clientCore.LocalInfo.checkHaveCloth(element.xlsData.clothId);
            })

            if (clientCore.GuideMainManager.instance.isGuideAction) {
                if (clientCore.GuideMainManager.instance.curGuideInfo.mainID == 4) {
                    for (let i = 0; i < array.length; i++) {
                        if (array[i].xlsData.clothId == 130920 || array[i].xlsData.clothId == 130929) {
                            let tmp = array[i];
                            array.splice(i, 1);
                            array.unshift(tmp);
                            break;
                        }
                    }
                }
                else if (clientCore.GuideMainManager.instance.curGuideInfo.mainID == 5) {
                    for (let i = 0; i < array.length; i++) {
                        if (array[i].xlsData.clothId == 130913 || array[i].xlsData.clothId == 130921) {
                            let tmp = array[i];
                            array.splice(i, 1);
                            array.unshift(tmp);
                            break;
                        }
                    }
                }
            }
            return array;
        }

        private clothRender(item: ui.familyTailor.item.ClothItemUI, index: number): void {
            let info: data.ClothData = this.clothList.array[index];
            let id: number = info.xlsData.clothId;
            item.txName.changeText(info.xlsData.kind);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.imgHas.visible = clientCore.LocalInfo.checkHaveCloth(id);
            item.imgSel.visible = this.clothList.selectedIndex == index;
            item.imgRed.visible = info.checkCanMake();
        }

        private clothSelect(index: number): void {
            if (index == -1) return;
            let info: data.ClothData = this.clothList.array[index];
            this._selectSuc = clientCore.LocalInfo.checkHaveCloth(info.xlsData.clothId);
            this.materialList.array = info.xlsData.materials;
            this.btnMake.visible = !this._selectSuc;
            this.boxCost.visible = !this._selectSuc && info.type != ShopType.TEMPLE && info.type != ShopType.TWINKLE;
            this.imgCom.visible = this._selectSuc;
            if (!this._selectSuc) {
                if (info.type == ShopType.TEMPLE) return; //服装圣殿不需要这个
                let pair: xls.pair = info.xlsData.pay;
                let has: number = clientCore.ItemsInfo.getItemNum(pair.v1);
                this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(pair.v1);
                this.txCost.changeText(pair.v2 + "");
                this.txCost.color = has < pair.v2 ? "#ef140b" : "#805329";
            } else {
                this.imgCom.skin = info.type == ShopType.TAILOR ? "familyTailor/wancheng.png" : "familyTailor/yy.png";
            }
        }

        private materialRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: xls.pair = this.materialList.array[index];
            let id: number = data.v1;
            // let htmlNum: Laya.HTMLDivElement = item.getChildByName("num") as Laya.HTMLDivElement;
            // htmlNum.visible = !this._selectSuc;
            // if (htmlNum.visible) {
            //     htmlNum.style.fontSize = 20;
            //     htmlNum.style.width = 98;
            //     htmlNum.style.align = "right";
            //     let has: number = clientCore.ItemsInfo.getItemNum(id);
            //     let color: string = has < data.v2 ? "#ef140b" : "#805329";
            //     htmlNum.innerHTML = util.StringUtils.getColorText2([has + "", color, "/" + data.v2, "#805329"]);
            // }
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            // item.txtName.text = clientCore.ItemsInfo.getItemName(id);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(id), data.v2);
            // (item.getChildByName("numBG") as Laya.Image).visible = htmlNum.visible;
            // (item.getChildByName("ico") as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(id);
            // (item.getChildByName("mName") as Laya.Label).changeText(clientCore.ItemsInfo.getItemName(id));
        }

        private materialSelect(index: number): void {
            if (index == -1) return;
            let info: data.ClothData = this.clothList.array[this.clothList.selectedIndex];
            if(!info)return;
            let data: xls.pair = this.materialList.getItem(index);
            clientCore.ToolTip.showTips(this.materialList.getCell(index),{ id: data.v1}, FamilyTailorModel.ins.shopType == ShopType.TEMPLE && !clientCore.LocalInfo.checkHaveCloth(info.xlsData.clothId) ? {
                id: data.v1,
                cnt: data.v2,
                mod: 45,
                tips: `兑换${info.xlsData.name}需要的${clientCore.ItemsInfo.getItemName(data.v1)}已集齐，是否要返回服装圣殿？`
            } : null);
            this.materialList.selectedIndex = -1;
        }

        /**
         * 检查一组是否全部完成了
         * @param type 
         */
        private checkAllSuc(type: Tab): boolean {
            let array: data.ClothData[] = this._map[type];
            if (!array) {
                return false;
            }
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                if (!clientCore.LocalInfo.checkHaveCloth(array[i].xlsData.clothId)) {
                    return false;
                }
            }
            return true;
        }

        private onMake(): void {
            let info: data.ClothData = this.clothList.array[this.clothList.selectedIndex];
            if (!info) return;
            let clothId: number = info.xlsData.clothId;
            info.type == ShopType.TAILOR ?
                net.sendAndWait(new pb.cs_create_family_suit_clothes({ clothesid: clothId })).then(() => {
                    alert.showDrawClothReward(clothId);
                    //更新面板内红点
                    this.updateRed();
                }) :
                net.sendAndWait(new pb.cs_create_tailor_temple_clothes({ clothesid: clothId })).then((data: pb.sc_create_tailor_temple_clothes) => {
                    if (130913 == data.clothesid || 130921 == data.clothesid) {
                        clientCore.GuideMainManager.instance.checkGuideByStageComplete(99999);
                    }
                    alert.showDrawClothReward(clothId);
                    util.RedPoint.reqRedPointRefresh(4601);
                });

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickMakeIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        /** 服装改变了*/
        private onChangeCloth(): void {
            let index: number = this.clothList.selectedIndex;
            let info: data.ClothData = this.clothList.array[index];
            if (info && clientCore.LocalInfo.checkHaveCloth(info.xlsData.clothId)) {
                this._count++;
                this.txProgress.changeText("收集进度:" + this._count + "/" + this._total);
                this["imgSuc" + this._tabIndex].visible = this.checkAllSuc(this._tabIndex);
                this.clothList.changeItem(index, info);
                this.clothSelect(index);
            }
        }

        private showPerson(cloths: number[]): void {
            if (!this._person) {
                this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
                this._person.scale(0.6, 0.6);
                this._person.pos(187, 360);
                this.addChildAt(this._person, 0);
            }
            this._person.replaceByIdArr(cloths);
        }
    }
}