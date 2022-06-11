namespace seventhMoonNight {
    /**
     * 放花灯控制面板
     */
    export class PlayFlowerLightHandlerPanel extends ui.seventhMoonNight.panel.PlayFlowerLightHandlerPanelUI {
        private _model: SeventhMoonNightModel;
        private _control: SeventhMoonNightControl;
        private _curStatus: PlayFlowerLightHandlerPanelStatusType;
        private _listData: IPlayFlowerListVo;

        constructor(sign: number) {
            super();
            this.sign = sign;
            this._curStatus = PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER;
            this._model = clientCore.CManager.getModel(this.sign) as SeventhMoonNightModel;
            this._control = clientCore.CManager.getControl(this.sign) as SeventhMoonNightControl;
            this._model._curPlayFlower = this._model._curPlayItems = null;//初始无选择
        }

        initOver() {
            this.init2Ls();
            this.init2Pho();
            this.reset2LanguageTips();
            this.reset2BoxShow();
            this.reset2List();
            this.reset2SelectedFlowerLight();
        }

        //#region 初始化
        private init2Ls(): void {
            this.lsItems.hScrollBarSkin = "";
            this.lsItems.vScrollBarSkin = "";
            this.lsItems.scrollBar.touchScrollEnable = false;
            this.lsItems.scrollBar.mouseWheelEnable = false;
            this.lsItems.itemRender = PlayFlowerLightRender;
            this.lsItems.renderHandler = new Laya.Handler(this, this.onRenderList);
        }

        private init2Pho(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/seventhMoonNight/pho_${sex}.png`;
        }

        //#endregion

        private reset2LanguageTips(): void {
            this.labTips.text = this._model.LanBase_Game[this._curStatus - 1];
        }

        private reset2BoxShow(): void {
            switch (this._curStatus) {
                case seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER:
                    this.bFlower.visible = true;
                    this.bItems.visible = false;
                    break;
                case seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS:
                    this.bFlower.visible = false;
                    this.bItems.visible = true;
                    break;
            }
        }

        private reset2List(): void {
            this._listData = this._model.getPlayFlowerLightListData(this._curStatus);
            this.lsItems.array = this._listData.info;
        }

        private reset2SelectedFlowerLight(): void {
            if (!this._model._curPlayFlower) {
                this.imgFlower.visible = false;
                return;
            }
            this.imgFlower.visible = true;
            this.imgFlower.skin = clientCore.ItemsInfo.getItemIconUrl(this._model._curPlayFlower.id);
        }

        addEventListeners() {
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.PLAYFLOWERLIGHT_SELECTED_FLOWER, this, this.onSelectedHandler);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.PLAYFLOWERLIGHT_SELECTED_ITEM, this, this.onSelectedHandler);
            BC.addEvent(this, this.btnPray, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.playGo, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnEnter, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private changeStatus(): void {
            if (this._curStatus == PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS) {
                this._curStatus = PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER;
            } else {
                this._curStatus = PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS;
            }
            this.reset2LanguageTips();
            this.reset2BoxShow();
            this.reset2List();
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnPray:
                    if (!this.checkIsHasFlowerLight()) return;
                    if (!this._model._curPlayFlower) {
                        alert.showFWords("请选择一盏灯!");
                        return;
                    }
                    this.changeStatus();
                    break;
                case this.playGo:
                    if (!this.checkIsHasFlowerLight()) return;
                    if (!this._model._curPlayFlower) {
                        alert.showFWords("请选择一盏灯!");
                        return;
                    }
                    this.enterSmallGame(0);
                    break;
                case this.btnEnter:
                    if (!this._model._curPlayItems) {
                        alert.showFWords("请选择一种祝祷材料!");
                        return;
                    }
                    this.enterSmallGame(1);
                    break;
                case this.btnBack:
                    this.changeStatus();
                    break;
                case this.btnClose:
                    this._model._curPlayFlower = null;
                    this._model._curPlayItems = null;
                    this.onClose(false);
                    break;
            }
        }


        private checkIsHasFlowerLight(): boolean {
            let isHas: boolean = this._model.isHasAnyFlowerLight();
            if (!isHas) {
                alert.showFWords("快去找小花宝制作一盏花灯，再来放花灯哦");
                this.onClose(false);
            }
            return isHas;
        }

        // 0: 无祈祷 , 1: 有祈祷
        private enterSmallGame(ty: number): void {
            clientCore.Logger.sendLog('2021年8月13日活动', '【主活动】七夕情人夜', '打开游戏界面');
            const gotoPlay: () => void = () => {
                this.onClose(true);
            };
            if (ty == 1) {
                this._control.useMaterialsPlayFlowerLight(this._model._curPlayItems.index).then(msg => {
                    gotoPlay();
                });
            } else {
                gotoPlay();
            }
        }

        //选择回调操作
        private onSelectedHandler(data: IPlayFlowerUsingItemVo): void {
            switch (data.status) {
                case seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER:
                    if (data.cnt > 0) {
                        this._model._curPlayFlower = data;
                        this.reset2SelectedFlowerLight();
                    } else {
                        alert.showFWords(`没有${clientCore.ItemsInfo.getItemName(data.id)}花灯!`);
                    }
                    break;
                case seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS:
                    if (clientCore.ItemsInfo.getItemNum(data.id) >= data.cnt) {
                        this._model._curPlayItems = data;
                        this.reset2List();//重置List表现
                    } else {
                        alert.showFWords(`抱歉,${clientCore.ItemsInfo.getItemName(data.id)}数量不足!`);
                    }
                    break;
            }
        }

        private onRenderList(item: PlayFlowerLightRender, index: number): void {
            const data: IPlayFlowerUsingItemVo = this.lsItems.array[index];
            item.resetUI(data);
        }

        private onClose(isSucc: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(SeventhMoonNightEventType.CLOSE_PlayFlowerLightHandlerPanel, isSucc);
        }


        destroy() {
            this._model = this._control = null;
            this.lsItems.renderHandler = null;
            let cell: PlayFlowerLightRender;
            for (let i: number = 0, j: number = this.lsItems.cells.length; i < j; i++) {
                cell = <PlayFlowerLightRender><any>this.lsItems.cells[i];
                if (cell) {
                    cell.clear();
                }
            }
            super.destroy();
        }
    }
}