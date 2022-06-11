namespace familyTailor.panel {

    export class ShowPanel extends ui.familyTailor.panel.ShowPanelUI {
        /** 服饰对象*/
        private _clothMap: util.HashMap<data.ClothData[]>;
        private _currentIndex: number;

        constructor() {
            super();

            this.pos(4.5, 102);
            this.list.hScrollBarSkin = "";
            this.list.itemRender = item.TailorItem;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
            this.analysicCloths();
        }

        public init(): void {
            this.list.array = this.sort(this._clothMap.getValues());
            this.refreshUnlockIdx()
            this.updateBtn();

            Laya.timer.frameOnce(2, this, () => {
                if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "familyTailorShowPanelOpen") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            });
        }

        private onRedChange(id: number | number[]) {
            if (id == 4601) {
                this.refreshUnlockIdx();
            }
        }

        private refreshUnlockIdx() {
            this.list.startIndex = this.list.startIndex;
            for (let i = 0; i < this.list.length; i++) {
                let render = this.list.getCell(i);
                if (render) {
                    if (!render['getIsOpen'](this.list.array[i])) {
                        FamilyTailorModel.ins.unLockIndex = i;
                        break;
                    }
                }
            }
            this.list.startIndex = this.list.startIndex;
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onDirection, [0]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onDirection, [1]);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.updateBtn);
            BC.addEvent(this, EventManager, globalEvent.CLOTH_CHANGE, this, this.onChangeCloth);
            BC.addEvent(this, EventManager, globalEvent.RED_POINT_CHANGED, this, this.onRedChange);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "familyTailorModuleShow") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "firstClothCell") {
                    var obj: any;
                    obj = this.list.getCell(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            let array: data.ClothData[][] = this._clothMap.getValues();
            _.forEach(array, (element: data.ClothData[]) => {
                _.forEach(element, (ele: data.ClothData) => {
                    ele.dispose();
                })
            })
            this._clothMap.clear();
            this._clothMap = null;
            super.destroy();
        }

        private listRender(item: item.TailorItem, index: number): void {
            item.setInfo(this.list.array[index], index);
        }

        private listSelect(index: number): void {
            if (index == -1) return;
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "templeClothSelect") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            let data: data.ClothData[] = this.list.array[index];
            let ret: number = this.checkOpen(data[0].xlsData.openRequire);
            if (ret != 0) {
                if (FamilyTailorModel.ins.shopType == ShopType.TAILOR) {
                    switch (ret) {
                        case 1:
                            alert.showFWords('裁缝小铺等级不足');
                            break;
                        case 2:
                            alert.showSmall('您的等级不够无法解锁当前服装，是否要前往订单快速升级？', {
                                callBack: {
                                    caller: this,
                                    funArr: [() => { clientCore.ToolTip.gotoMod(13); }]
                                }
                            })
                            break;
                        default:
                            alert.showFWords("当前图纸尚未解锁~");
                            break;
                    }
                }
                else {
                    switch (ret) {
                        case 1:
                            alert.showSmall('您的等级不够无法解锁当前服装，是否要前往订单快速升级？', {
                                callBack: {
                                    caller: this,
                                    funArr: [() => { clientCore.ToolTip.gotoMod(13); }]
                                }
                            })
                            break;
                        case 2:
                            alert.showFWords('您尚未解锁前一套服装，无法解锁当前服装~');
                            break;
                        case 3:
                            alert.showFWords('花灵餐厅等级不足');
                            break;
                        case 4:
                            alert.showFWords('未通过相应的闪耀章节~');
                            break;
                        default:
                            alert.showFWords("当前图纸尚未解锁~");
                            break;
                    }
                }
                return;
            }
            this._currentIndex = index;
            this.list.selectedIndex = -1;
            (this.parent as FamilyTailorModule).showPanel(ViewType.MAKE, this.list.array[index]);
        }

        private onDirection(type: number): void {
            let index: number = type == 0 ? this.list.startIndex + 1 : this.list.startIndex - 1;
            this.list.tweenTo(index, 200, Laya.Handler.create(this, this.updateBtn));
        }

        private updateBtn(): void {
            this.btnLeft.visible = this.list.startIndex > 0;
            this.btnRight.visible = this.list.startIndex + 4 < this.list.length;
        }

        public analysicCloths(): void {
            this._clothMap = new util.HashMap<data.ClothData[]>();
            let array: any;
            if (FamilyTailorModel.ins.shopType == ShopType.TAILOR) {
                array = xls.get(xls.familyClothStore).getValues();
            } else {
                array = _.filter(xls.get(xls.clothTemple).getValues(), (o) => { return o.type == FamilyTailorModel.ins.shopType; });
            }
            _.forEach(array, (element: xls.familyClothStore | xls.clothTemple) => {
                let array: data.ClothData[] = this._clothMap.get(element.priority);
                if (!array) {
                    array = [];
                    this._clothMap.add(element.priority, array);
                }
                if (element.sex == clientCore.LocalInfo.sex || element.sex == 0) { //性别相同或者通用
                    let info: data.ClothData = data.ClothData.create();
                    info.type = FamilyTailorModel.ins.shopType;
                    info.xlsData = element;
                    array.push(info);
                }
            })
        }

        private sort(array: data.ClothData[][]): data.ClothData[][] {
            return _.sortBy(array, (element) => {
                if (this.checkOpen(element[0].xlsData.openRequire) == 0) {
                    if (this.getCompleteCount(element) != element.length) return -1;
                    return 1;
                }
                return 0;
            })
        }

        private checkOpen(array: xls.pair[]): number {
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = array[i];
                //餐厅和服装圣殿走下面
                if (FamilyTailorModel.ins.shopType == ShopType.TAILOR) {
                    switch (element.v1) {
                        case 1: //裁缝小铺等级
                            if (FamilyTailorModel.ins.tailorLevel < element.v2) return 1;
                            break;
                        case 2: //玩家等级
                            if (clientCore.LocalInfo.userLv < element.v2) return 2;
                            break;
                    }
                }
                else {
                    switch (element.v1) {
                        case 1: //等级
                            if (clientCore.LocalInfo.userLv < element.v2) return 1;
                            break;
                        case 2: //服装
                            if (!clientCore.SuitsInfo.getSuitInfo(element.v2).allGet) return 2;
                            break;
                        case 3: //花灵
                            if (FamilyTailorModel.ins.restaurantLevel < element.v2 && FamilyTailorModel.ins.shopType == ShopType.EATGOT) return 3;
                            break;
                        case 4: //闪耀
                            if (!FamilyTailorModel.ins.checkTwinkleFinish(element.v2) && FamilyTailorModel.ins.shopType == ShopType.TWINKLE) return 4;
                            break;
                    }
                }
            }
            return 0;
        }

        private getCompleteCount(array: data.ClothData[]): number {
            let count: number = 0;
            _.forEach(array, (element: data.ClothData) => {
                clientCore.LocalInfo.checkHaveCloth(element.xlsData.clothId) && count++;
            })
            return count;
        }

        private onChangeCloth(): void {
            let info: xls.familyClothStore[] = this.list.array[this._currentIndex];
            if (!info) return;
            this.list.changeItem(this._currentIndex, info);
        }
    }
}