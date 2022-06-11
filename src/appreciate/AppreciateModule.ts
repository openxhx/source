
namespace appreciate {
    /**
     * 2020.11.19
     * 欣赏模式
     * appreciate.AppreciateModule
     */
    export class AppreciateModule extends ui.appreciate.AppreciateModuleUI {
        static readonly ITEM_ON_OPERATION: string = 'ITEM_ON_OPERATION';
        static readonly ITEM_CLOSE: string = 'ITEM_CLOSE';

        private readonly ZHUANGSHI_NUMMAX: number = 7;  //装饰上限
        private _currTab: number = -1;      //当前选中tab页
        private _currPage: number = 0;      //当前list页
        private _currPageMax: number = 0;   //当前list页最大值
        private _currBgId: number = -1;     //当前选中底图id
        private _currXiangceId: number = -1;//当前选中相册id
        private _currShowId: number = -1;   //当前选中背景秀id
        private _currStageId: number = -1;  //当前选中舞台id
        private _currRiderId: number = -1;  //当前选中坐骑id
        private _userShowId: number = 0;    //玩家装备背景秀id
        private _userStageId: number = 0;   //玩家装备舞台id
        private _userRiderId: number = 0;   //玩家装备坐骑id
        private _isShowView: boolean;
        private _isOperationShow: boolean;
        private _moshi: string;
        private _currUIData: any;
        private _hengUIData: any;       //横屏_默认状态_UI数据
        private _hengUIData2: any;      //横屏_关闭列表状态_UI数据
        private _shuUIData: any;        //竖屏_默认状态_UI数据
        private _shuUIData2: any;       //竖屏_关闭列表状态_UI数据

        private _currListArr: ShowData[];

        private _operationItem: OperationItem;
        private _roleItem: RoleItem;                    //人物展示item
        private _otherItem: RoleItem;                   //人物展示item
        private _showItem: BgItem;                      //背景秀展示item
        private _stageItem: BgItem;                     //舞台展示item
        private _photoFrameItem: PhotoFrameItem;        //相框展示item
        private _zhuangshiItems: ArrangeItem[];         //装饰展示item
        private _friendsPanel: FriendsPanel;

        private _model: AppreciateModel;
        private _control: AppreciateControl;

        init(data: any) {
            Laya.MouseManager.multiTouchEnabled = true;//打开多指模式
            this.addPreLoad(net.sendAndWait(new pb.cs_get_share_award_info()).then((msg: pb.sc_get_share_award_info) => {
                clientCore.ShareManager._isReward = util.getBit(msg.flag, 1) == 1;
            }));
            this._isShowView = true;
            this._isOperationShow = true;
            this._zhuangshiItems = [];

            this.sign = clientCore.CManager.regSign(new AppreciateModel(), new AppreciateControl());
            this._control = clientCore.CManager.getControl(this.sign) as AppreciateControl;
            this._model = clientCore.CManager.getModel(this.sign) as AppreciateModel;
            this._control.model = this._model;

            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.boxNativeBtn.visible = clientCore.GlobalConfig.isShowShare;
            // this.boxNativeBtn.visible = true;
            this.panelTab.hScrollBarSkin = "";
            let stageWidth = this.stage.width;
            let stageheight = this.stage.height;
            this.width = stageWidth;
            this.height = stageheight;
            this._hengUIData = {
                "box": { width: stageWidth, height: stageheight, x: 0, y: 0, rotation: 0 },
                "boxShow": { x: 350, y: stageheight / 2 },
                "boxPhotoFrame": { width: stageWidth, height: stageheight },
                "boxOperation": { x: stageWidth - this.boxOperation.width, y: stageheight - this.boxOperation.height, width: this.boxOperation.width, height: this.boxOperation.height },
                "operationBg": { width: this.operationBg.width, height: this.operationBg.height },
                "list": { repeatX: 4, repeatY: 3, spaceX: 20, x: 30 },
                "btnOperationShow": { x: 0, y: 92, rotation: 0 },
                "boxCaozuo": { x: this.boxCaozuo.x, y: stageheight - this.boxCaozuo.height, rotation: 0 },
                "boxTitle": { x: stageWidth / 2, y: -30 },
                "boxNativeBtn": { x: stageWidth - this.boxNativeBtn.width, y: stageheight - this.boxNativeBtn.height }
            }
            this._hengUIData2 = {
                "boxOperation": { x: stageWidth }
            }
            this._shuUIData = {
                "box": { width: stageheight, height: stageWidth, x: 0, y: this.box.height, rotation: -90 },
                "boxShow": { x: stageheight / 2, y: 500 },
                "boxPhotoFrame": { width: stageheight, height: stageWidth },
                "boxOperation": { x: 0, y: stageWidth - 510, width: stageheight, height: 510 },
                "operationBg": { width: stageheight + 8, height: 455 },
                "list": { repeatX: 5, repeatY: 2, spaceX: 10, x: 5 },
                "btnOperationShow": { x: this.btnOperationShow.pivotY, y: this.operationBg.y + 4, rotation: 90 },
                "boxCaozuo": { x: stageheight - this.boxCaozuo.width, y: this.boxCaozuo.x },
                "boxTitle": { x: stageheight / 2, y: -30 },
                "panelTab": { x: this.btnOperationShow.width + 3 },
                "boxNativeBtn": { x: stageheight - this.boxNativeBtn.width, y: stageWidth - this.boxNativeBtn.height }
            }
            this._shuUIData2 = {
                "boxOperation": { y: stageWidth - this._shuUIData["btnOperationShow"].y }
            }

            this.showHeng();

            this.addPreLoad(xls.load(xls.collocation));
            this.addPreLoad(xls.load(xls.bgshow));
            clientCore.Logger.sendLog('2020年11月20日活动', '欣赏模式', '进入欣赏模式');
        }

        async onPreloadOver() {
            const data = await this._control.getUserBaseInfo();
            let userBaseInfo = data.userInfos[0];
            this._roleItem = new RoleItem();
            this._roleItem.init({ type: ITEM_NAME.ROLE, scaleMin: 0.7, scaleMax: 2 });
            this._roleItem.update(userBaseInfo.sex, userBaseInfo.curClothes);
            this._currRiderId = this._userRiderId = clientCore.BgShowManager.instance.currRider;
            this._roleItem.changeRider(this._userRiderId);
            this.boxShowItem.addChildAt(this._roleItem, 0);

            this._userShowId = clientCore.BgShowManager.filterDecoIdByType(userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Bg);
            if (this._userShowId > 0) {
                this.addShowItem(this._model.getShowDataById(this._userShowId));
            }

            this._userStageId = clientCore.BgShowManager.filterDecoIdByType(userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Stage);
            if (this._userStageId > 0) {
                this.addStageItem(this._model.getStageDataById(this._userStageId));
            }

            this._operationItem = new OperationItem();

            this.onTab(ITEM_TYPE.DITU);
            this.updateReward();
        }

        private updateReward() {
            this.imgReward.visible = !clientCore.ShareManager._isReward;
        }

        private updateList(): void {
            let len = this.list.repeatX * this.list.repeatY;
            this.list.dataSource = this._currListArr.slice(this._currPage * len, (this._currPage + 1) * len);
        }

        private onListRender(cell: ui.appreciate.render.PendantRenderUI, idx: number) {
            let data: ShowData = cell.dataSource;
            if (data.type == ITEM_TYPE.DITU) {
                cell.imgSelect.visible = data.id == this._currBgId || (data.PropsUnlock == -1 && this._currBgId <= 0);
            } else if (data.type == ITEM_TYPE.XIANGKUANG) {
                cell.imgSelect.visible = data.id == this._currXiangceId || (data.PropsUnlock == -1 && this._currXiangceId <= 0);
            } else if (data.type == ITEM_TYPE.BEIJINGXIU) {
                cell.imgSelect.visible = data.id == this._currShowId || (data.PropsUnlock == -1 && this._currShowId <= 0);
            } else if (data.type == ITEM_TYPE.WUTAI) {
                cell.imgSelect.visible = data.id == this._currStageId || (data.PropsUnlock == -1 && this._currStageId <= 0);
            } else if (data.type == ITEM_TYPE.ZUOQI) {
                cell.imgSelect.visible = data.id == this._currRiderId || (data.PropsUnlock == -1 && this._currRiderId <= 0);
            } else {
                cell.imgSelect.visible = false;
            }
            cell.img.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            cell.labName.text = data.name;
            if ((data.PropsUnlock == 1 || data.PropsUnlock == 2) && !clientCore.ItemsInfo.checkHaveItem(data.id)) {
                cell.img.gray = true;
            } else {
                cell.img.gray = false;
            }
            cell.imgVip.visible = data.vipLimit > 0;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: ShowData = e.currentTarget["dataSource"];
                if (data.PropsUnlock == 2 && !clientCore.ItemsInfo.checkHaveItem(data.id)) {
                    if (clientCore.FlowerPetInfo.petType < data.vipLimit) {
                        alert.showFWords('奇妙花宝玩家才可以购买');
                        return;
                    }
                    alert.alertQuickBuy(data.id, 1, true, Laya.Handler.create(this, (msg: clientCore.GoodsInfo[]) => {
                        alert.showFWords('购买成功');
                        clientCore.UIManager.releaseCoinBox();
                    })
                        , Laya.Handler.create(this, () => {
                            clientCore.UIManager.releaseCoinBox();
                        })
                    );
                    clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
                    clientCore.UIManager.showCoinBox();
                    return;
                }
                if (data.PropsUnlock == 1 && !clientCore.ItemsInfo.checkHaveItem(data.id)) {
                    clientCore.ToolTip.showTips(e.target, { id: data.id });
                    return;
                }
                if (data.PropsUnlock == 0 && clientCore.FlowerPetInfo.petType < data.vipLimit) {
                    alert.showFWords('奇妙花宝可以免费使用');
                    return;
                }
                if (data.type == ITEM_TYPE.DITU) {
                    this.addBgItem(data);
                } else if (data.type == ITEM_TYPE.BEIJINGXIU) {
                    this.addShowItem(data);
                } else if (data.type == ITEM_TYPE.ZHUANGSHI) {
                    if (this._zhuangshiItems.length >= this.ZHUANGSHI_NUMMAX) {
                        alert.showFWords('可使用装饰数量已达上限');
                    } else {
                        this.addZhuangshiItem(data);
                    }
                } else if (data.type == ITEM_TYPE.XIANGKUANG) {
                    this.addXiangkuangItem(data);
                } else if (data.type == ITEM_TYPE.WUTAI) {
                    this.addStageItem(data);
                } else if (data.type == ITEM_TYPE.ZUOQI) {
                    this.changeRider(data.id);
                }
            }
        }

        /**添加底图 */
        private addBgItem(data: ShowData): void {
            this._currBgId = data.id;
            this.imgBg.skin = clientCore.ItemsInfo.getItemUIUrl(data.id);
            this.list.refresh();
        }

        /**添加背景秀 */
        private addShowItem(data: ShowData): void {
            this._currShowId = data.id;
            if (data.PropsUnlock == -1) {
                this._showItem?.onClose();
            } else {
                let cfg: xls.bgshow = xls.get(xls.bgshow).get(data.id);
                let path: string = clientCore.ItemsInfo.getItemUIUrl(data.id);
                if (cfg.fullScreen) {
                    this._showItem?.onClose();
                    clientCore.BgShowManager.instance.createFullScreenBgShow(this, path, this.imgBgShow);
                } else {
                    clientCore.BgShowManager.instance.hideFullScreenBgShow();
                    if (!this._showItem) {
                        this._showItem = new BgItem();
                        this._showItem.init({ type: ITEM_NAME.BEIJINGXIU, scaleMin: 0.7, scaleMax: 1.7 });
                    }
                    this._showItem.update(data.id, data.posData);
                    if (!this._showItem.parent) {
                        this.boxShowBg.addChildAt(this._showItem, 0);
                        this._showItem.pos(0, 0);
                        this._showItem.onReset();
                    }
                }
            }
            this.list.refresh();
        }

        /**添加舞台 */
        private addStageItem(data: ShowData): void {
            this._currStageId = data.id;
            clientCore.BgShowManager.instance.hideDynamicStage();
            if (data.PropsUnlock == -1) {
                this._stageItem?.onClose();
            } else {
                if (!this._stageItem) {
                    this._stageItem = new BgItem();
                    this._stageItem.init({ type: ITEM_NAME.WUTAI, scaleMin: 0.7, scaleMax: 1.7 });
                }
                this._stageItem.update(data.id, data.posData);
                if (!this._stageItem.parent) {
                    this.boxShowBg.addChild(this._stageItem);
                    this._stageItem.pos(0, 0);
                    this._stageItem.onReset();
                }
            }
            this.list.refresh();
        }

        /**添加装饰品 */
        private addZhuangshiItem(data: ShowData): void {
            let item = new ArrangeItem();
            item.init({ type: ITEM_NAME.ZHUANGSHI, scaleMin: data.zoomOutLimit, scaleMax: data.zoomInLimit, hasAni: data.dynamic == 1, aniPos: data.coordinate, side: data.side });
            item.update(data.id);
            if (data.side == 1) {
                this.boxShowItem.addChild(item);
            } else {
                this.boxShowItem.addChildAt(item, 0);
            }
            this._zhuangshiItems.push(item);
        }

        /**添加相册 */
        private addXiangkuangItem(data: ShowData): void {
            this._currXiangceId = data.id;
            if (data.PropsUnlock == -1) {
                this._photoFrameItem?.onClose();
            } else {
                let url = clientCore.ItemsInfo.getItemUIUrl(data.id);
                url = _.replace(url, '.png', '/');
                if (!this._photoFrameItem) {
                    this._photoFrameItem = new PhotoFrameItem();
                }
                this._photoFrameItem.update(url);
                if (!this._photoFrameItem.parent) {
                    this.boxShowItem.addChild(this._photoFrameItem);
                    this._photoFrameItem.width = this.box.width;
                    this._photoFrameItem.height = this.box.height;
                    this._photoFrameItem.x = -this.boxShow.x;
                    this._photoFrameItem.y = -this.boxShow.y;
                }
            }
            this.list.refresh();
        }

        /**添加其他人 */
        private onAddRole(data: any): Promise<any> {
            if (!data || !data.userBaseInfo) {
                return;
            }
            if (this._otherItem && this._otherItem.parent) {
                alert.showFWords('当前已经邀请了好友');
                return;
            }
            this.addPreLoad(this.onAddRole2(data));
        }

        /**更换坐骑 */
        private changeRider(id: number) {
            id = id == 3850000 ? 0 : id;
            this._currRiderId = id;
            this._roleItem.changeRider(id);
            this.list.refresh();
        }

        private async onAddRole2(data: any): Promise<any> {
            await clientCore.UserInfoDataBase.reqUserInfo([data.friendUid], true);
            let userBaseInfo = clientCore.UserInfoDataBase.getUserInfo(data.friendUid);
            if (!this._otherItem) {
                this._otherItem = new RoleItem();
                this._otherItem.init({ type: ITEM_NAME.ROLE2, scaleMin: 0.7, scaleMax: 2 });
            }
            this._otherItem.update(userBaseInfo.sex, userBaseInfo.curClothes);
            let riderId = clientCore.BgShowManager.filterDecoIdByType(userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Rider);
            this._otherItem.changeRider(riderId);
            if (!this._otherItem.parent) {
                this.boxShowItem.addChild(this._otherItem);
                this._otherItem.pos(0, 0);
                this._otherItem.onReset();
            }
            this._friendsPanel.onClose();
        }

        /**点击切换屏幕模式按钮 */
        private onQieHuan(): void {
            clientCore.Logger.sendLog('2020年11月20日活动', '欣赏模式', '点击切换横竖屏按钮');
            alert.showSmall(`切换屏幕显示后会清除当前所有装饰，是否确认切换？`, {
                callBack: {
                    funArr: [this.onQieHuanTure],
                    caller: this,
                },
                needClose: false,
                needMask: true,
                clickMaskClose: false
            })
        }

        /**确认点击切换屏幕模式 */
        private onQieHuanTure(): void {
            if (this._moshi == clientCore.MODE.HENG) {
                this.showShu();
                this._operationItem.deviationAngle = 90;
                this._friendsPanel?.changeDir(1);
            } else if (this._moshi == clientCore.MODE.SHU) {
                this.showHeng();
                this._operationItem.deviationAngle = 0;
                this._friendsPanel?.changeDir(2);
            }
            this.resetBoxShow();
        }

        /**切换横屏屏幕模式 */
        private showHeng(): void {
            this._moshi = clientCore.LayerManager.moshi = clientCore.MODE.HENG;

            if (this._isOperationShow) {
                this.updateUI(this._hengUIData);
            } else {
                this.updateUI(this._hengUIData, this._hengUIData2);
            }
        }

        /**切换竖屏屏幕模式 */
        private showShu(): void {
            this._moshi = clientCore.LayerManager.moshi = clientCore.MODE.SHU;

            if (this._isOperationShow) {
                this.updateUI(this._shuUIData);
            } else {
                this.updateUI(this._shuUIData, this._shuUIData2);
            }
        }

        /**切换屏幕模式时UI状态 */
        private updateUI(data: any, operationShowData?: any): void {
            this._currUIData = data;
            for (let name in data) {
                for (let name2 in data[name]) {
                    this[name][name2] = data[name][name2];
                }
            }
            if (operationShowData) {
                for (let name in operationShowData) {
                    for (let name2 in operationShowData[name]) {
                        this[name][name2] = operationShowData[name][name2];
                    }
                }
            }
        }

        /**重置显示容器 */
        private resetBoxShow(): void {
            this.clearBoxShow();

            this._roleItem.pos(0, 0);
            this._roleItem.onReset()

            this._otherItem?.onClose();

            if (this._userShowId > 0) {
                this.addShowItem(this._model.getShowDataById(this._userShowId));
                this._showItem.pos(0, 0);
                this._showItem.onReset();
            } else {
                this._showItem?.onClose();
                this._currShowId = -1;
            }

            if (this._userStageId > 0) {
                this.addStageItem(this._model.getStageDataById(this._userStageId));
                this._stageItem.pos(0, 0);
                this._stageItem.onReset();
            } else {
                this._stageItem?.onClose();
                this._currStageId = -1;
            }

            this.changeRider(this._userRiderId);

            this._photoFrameItem?.onClose();
            this._currXiangceId = -1;

            this._currPage = 0;
            let len = this.list.repeatX * this.list.repeatY;
            this._currPageMax = Math.ceil(this._currListArr.length / len);
            this.updateList();
        }

        /**清理所有装饰，相框元素 */
        private clearBoxShow(): void {
            let len = this._zhuangshiItems.length;
            for (let i = len - 1; i >= 0; i--) {
                let item: ArrangeItem = this._zhuangshiItems[i] as ArrangeItem;
                item?.destroy();
            }
            this._zhuangshiItems = [];
        }

        /**显示UI操作界面 */
        private onShowView(): void {
            this.mouseEnabled = false;

            Laya.Tween.clearAll(this.btnShow);
            Laya.Tween.clearAll(this.btnQie);
            Laya.Tween.clearAll(this.btnClear);
            Laya.Tween.clearAll(this.btnFriends);
            Laya.Tween.clearAll(this.boxOperation);
            Laya.Tween.clearAll(this.boxTitle);
            Laya.Tween.clearAll(this.btnClose);
            Laya.Tween.clearAll(this.boxNativeBtn);

            this.btnQie.visible = true;
            this.boxOperation.visible = true;
            this.boxTitle.visible = true;
            this.btnClose.visible = true;
            this.boxNativeBtn.visible = clientCore.GlobalConfig.isShowShare;
            Laya.Tween.to(this.btnShow, { y: 39 }, 300);
            Laya.Tween.to(this.btnQie, { y: 119, alpha: 1 }, 300);
            Laya.Tween.to(this.btnClear, { y: 199, alpha: 1 }, 300);
            Laya.Tween.to(this.btnFriends, { y: 279, alpha: 1 }, 300);

            Laya.Tween.to(this.boxOperation, { alpha: 1 }, 300);
            Laya.Tween.to(this.boxTitle, { alpha: 1 }, 300);
            Laya.Tween.to(this.btnClose, { alpha: 1 }, 300);
            Laya.Tween.to(this.boxNativeBtn, { alpha: 1 }, 300);

            this.timerOnce(300, this, () => {
                this.mouseEnabled = true;
                this.btnShow.skin = "appreciate/yin_cangicon.png";
            });
        }

        /**隐藏UI操作界面 */
        private onHideView(): void {
            this.mouseEnabled = false;

            Laya.Tween.clearAll(this.btnShow);
            Laya.Tween.clearAll(this.btnQie);
            Laya.Tween.clearAll(this.btnClear);
            Laya.Tween.clearAll(this.btnFriends);
            Laya.Tween.clearAll(this.boxOperation);
            Laya.Tween.clearAll(this.boxTitle);
            Laya.Tween.clearAll(this.btnClose);
            Laya.Tween.clearAll(this.boxNativeBtn);

            if (this._moshi == clientCore.MODE.HENG) {
                Laya.Tween.to(this.btnShow, { y: 279 }, 300);
                Laya.Tween.to(this.btnQie, { y: 279, alpha: 0 }, 300);
                Laya.Tween.to(this.btnClear, { y: 279, alpha: 0 }, 300);
                Laya.Tween.to(this.btnFriends, { y: 279, alpha: 0 }, 300);
            } else {
                Laya.Tween.to(this.btnShow, { y: 39 }, 300);
                Laya.Tween.to(this.btnQie, { y: 39, alpha: 0 }, 300);
                Laya.Tween.to(this.btnClear, { y: 39, alpha: 0 }, 300);
                Laya.Tween.to(this.btnFriends, { y: 39, alpha: 0 }, 300);
            }
            Laya.Tween.to(this.boxOperation, { alpha: 0 }, 300);
            Laya.Tween.to(this.boxTitle, { alpha: 0 }, 300);
            Laya.Tween.to(this.btnClose, { alpha: 0 }, 300);
            Laya.Tween.to(this.boxNativeBtn, { alpha: 0 }, 300);

            this.timerOnce(300, this, () => {
                this.mouseEnabled = true;
                this.btnShow.skin = "appreciate/yin_cangicon2.png";
                this.btnQie.visible = false;
                this.boxOperation.visible = false;
                this.boxTitle.visible = false;
                this.btnClose.visible = false;
                this.boxNativeBtn.visible = false;
            });
        }

        /**显示列表界面 */
        private onShowOperation(): void {
            Laya.Tween.clearAll(this.boxOperation);
            this.btnOperationShow.skin = "appreciate/btn_shouhui.png";
            this.panelTab.visible = true;
            this.btnShare.visible = this.btnDownLoad.visible = false;
            if (this._moshi == clientCore.MODE.HENG) {
                Laya.Tween.to(this.boxOperation, { x: this._currUIData["boxOperation"].x }, 300);
            } else {
                Laya.Tween.to(this.boxOperation, { y: this._currUIData["boxOperation"].y }, 300);
            }
        }

        /**隐藏列表界面 */
        private onHideOperation(): void {
            Laya.Tween.clearAll(this.boxOperation);
            this.btnOperationShow.skin = "appreciate/btn_zhankai.png";
            if (this._moshi == clientCore.MODE.HENG) {
                Laya.Tween.to(this.boxOperation, this._hengUIData2["boxOperation"], 300);
            } else {
                Laya.Tween.to(this.boxOperation, this._shuUIData2["boxOperation"], 300);
            }
            this.timerOnce(300, this, () => {
                this.panelTab.visible = false;
                this.btnShare.visible = true;
                this.btnDownLoad.visible = Laya.Browser.onAndroid; //暂时在安卓里面可以用
            });
        }

        /**切换标签页 */
        private onTab(type: number): void {
            if (this._currTab == type) {
                return;
            }
            this.btnDt.skin = type == ITEM_TYPE.DITU ? "appreciate/clip_l_y_1.png" : "appreciate/clip_l_y_2.png";
            this.btnBjx.skin = type == ITEM_TYPE.BEIJINGXIU ? "appreciate/clip_l_y_1.png" : "appreciate/clip_l_y_2.png";
            this.btnZs.skin = type == ITEM_TYPE.ZHUANGSHI ? "appreciate/clip_l_y_1.png" : "appreciate/clip_l_y_2.png";
            this.btnXk.skin = type == ITEM_TYPE.XIANGKUANG ? "appreciate/clip_l_y_1.png" : "appreciate/clip_l_y_2.png";
            this.btnWt.skin = type == ITEM_TYPE.WUTAI ? "appreciate/clip_l_y_1.png" : "appreciate/clip_l_y_2.png";
            this.btnRider.skin = type == ITEM_TYPE.ZUOQI ? "appreciate/clip_l_y_1.png" : "appreciate/clip_l_y_2.png";
            this._currTab = type;

            let arr = this._model.getCollocation(this._currTab).concat();
            arr = _.filter(arr, (element: xls.collocation) => {
                return !(element.PropsUnlock == 1 && !clientCore.ItemsInfo.checkHaveItem(element.id));
            });
            arr.sort(this.sortItem);
            if (type == ITEM_TYPE.DITU) {
                if (this._currBgId == -1) {
                    this.addBgItem(arr[0]);
                }
            }
            this._currListArr = arr;

            if (type == ITEM_TYPE.BEIJINGXIU && arr.length == 0) {
                this.labNoShow.visible = true;
            } else {
                this.labNoShow.visible = false;
            }

            this._currPage = 0;
            let len = this.list.repeatX * this.list.repeatY;
            this._currPageMax = Math.ceil(this._currListArr.length / len);
            this.updateList();
        }

        /**排序 */
        private sortItem(a: xls.collocation, b: xls.collocation) {
            if (a.PropsUnlock == -1) {
                return -1;
            } else if (b.PropsUnlock == -1) {
                return 1;
            }
            let has1: boolean = false;
            let has2: boolean = false;
            if (a.PropsUnlock == 0) {
                has1 = true;
            } else if (a.PropsUnlock > 0) {
                has1 = clientCore.ItemsInfo.checkHaveItem(a.id);
            }
            if (b.PropsUnlock == 0) {
                has2 = true;
            } else if (b.PropsUnlock > 0) {
                has2 = clientCore.ItemsInfo.checkHaveItem(b.id);
            }
            if (has1 && !has2) {
                return -1;
            } else if (!has1 && has2) {
                return 1;
            } else if (a.PropsUnlock != b.PropsUnlock) {
                return b.PropsUnlock - a.PropsUnlock;
            } else if (a.vipLimit != b.vipLimit) {
                return a.vipLimit - b.vipLimit;
            }
            return a.id - b.id;
        }

        /**点击显示/隐藏列表界面按钮  */
        private onOperationShow(): void {
            this._isOperationShow = !this._isOperationShow;
            if (this._isOperationShow) {
                this.onShowOperation();
            } else {
                this.onHideOperation();
            }
        }

        /**点击清理界面按钮  */
        private onClearBox(): void {
            clientCore.Logger.sendLog('2020年11月20日活动', '欣赏模式', '点击一键清空按钮');
            alert.showSmall(`是否确认清除当前所有装饰？`, {
                callBack: {
                    funArr: [this.resetBoxShow],
                    caller: this,
                },
                needClose: false,
                needMask: true,
                clickMaskClose: false
            })
        }

        /**点击清理界面按钮  */
        private onFriends(): void {
            clientCore.Logger.sendLog('2020年11月20日活动', '欣赏模式', '点击邀请好友按钮');
            if (!this._friendsPanel) {
                this._friendsPanel = new FriendsPanel();
                this._friendsPanel.changeDir(this._moshi == clientCore.MODE.HENG ? 2 : 1);
                BC.addEvent(this, this._friendsPanel, this._friendsPanel.ON_ADD_ROLE, this, this.onAddRole);
            }
            clientCore.DialogMgr.ins.open(this._friendsPanel);
        }

        /**点击指定item，将操作item绑定该item */
        private onClickArrange(mc: ArrangeItem): void {
            this._operationItem.init(mc);
        }

        /**移除指定item显示 */
        private onRemoveArrange(mc: ArrangeItem, data: any): void {
            if (data.type == ITEM_NAME.ROLE) {
            } else if (data.type == ITEM_NAME.ROLE2) {
                this._otherItem.onClose();
            } else if (data.type == ITEM_NAME.DITU) {
            } else if (data.type == ITEM_NAME.BEIJINGXIU) {
                this._currShowId = -1;
                this.list.refresh();
                mc.onClose();
            } else if (data.type == ITEM_NAME.ZHUANGSHI) {
                let index = this._zhuangshiItems.indexOf(mc);
                if (index >= 0) {
                    this._zhuangshiItems.splice(index, 1);
                }
                mc.destroy();
            } else if (data.type == ITEM_NAME.XIANGKUANG) {
            } else if (data.type == ITEM_NAME.WUTAI) {
                this._currStageId = -1;
                this.list.refresh();
                mc.onClose();
            }
        }

        /**点击显示/隐藏UI操作界面按钮 */
        private onShow(): void {
            clientCore.Logger.sendLog('2020年11月20日活动', '欣赏模式', '点击隐藏按钮');
            this._isShowView = !this._isShowView;
            if (this._isShowView) {
                this.onShowView();
            } else {
                this.onHideView();
            }
        }

        /** change by chen*/
        /**显示上一页列表 */
        private onLast(): void {
            let page: number = this._currPage - 1;
            if (page < 0) return;
            this._currPage--;
            this.updateList();
        }

        /** change by chen*/
        /**显示下一页列表 */
        private onNext(): void {
            let page: number = this._currPage + 1;
            if (page >= this._currPageMax) return;
            this._currPage++;
            this.updateList();
        }

        private async onShare() {
            this.boxOperation.visible = false;
            this.boxCaozuo.visible = false;
            this.boxNativeBtn.visible = false;
            this.boxTitle.visible = false;
            this.btnClose.visible = false;
            await clientCore.ShareManager.showShare(this._moshi == clientCore.MODE.HENG ? 'horizontal' : 'vertical');
            this.boxOperation.visible = true;
            this.boxCaozuo.visible = true;
            this.boxNativeBtn.visible = true;
            this.boxTitle.visible = true;
            this.btnClose.visible = true;
        }

        private async onDownload() {
            this.boxOperation.visible = false;
            this.boxCaozuo.visible = false;
            this.boxNativeBtn.visible = false;
            this.boxTitle.visible = false;
            this.btnClose.visible = false;
            await clientCore.ShareManager.saveScreenShot(clientCore.LayerManager.moshi == clientCore.MODE.HENG ? 'horizontal' : 'vertical');
            this.boxOperation.visible = true;
            this.boxCaozuo.visible = true;
            this.boxNativeBtn.visible = true;
            this.boxTitle.visible = true;
            this.btnClose.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnQie, Laya.Event.CLICK, this, this.onQieHuan);
            BC.addEvent(this, this.btnDt, Laya.Event.CLICK, this, this.onTab, [ITEM_TYPE.DITU]);
            BC.addEvent(this, this.btnBjx, Laya.Event.CLICK, this, this.onTab, [ITEM_TYPE.BEIJINGXIU]);
            BC.addEvent(this, this.btnZs, Laya.Event.CLICK, this, this.onTab, [ITEM_TYPE.ZHUANGSHI]);
            BC.addEvent(this, this.btnXk, Laya.Event.CLICK, this, this.onTab, [ITEM_TYPE.XIANGKUANG]);
            BC.addEvent(this, this.btnWt, Laya.Event.CLICK, this, this.onTab, [ITEM_TYPE.WUTAI]);
            BC.addEvent(this, this.btnRider, Laya.Event.CLICK, this, this.onTab, [ITEM_TYPE.ZUOQI]);
            BC.addEvent(this, this.btnOperationShow, Laya.Event.CLICK, this, this.onOperationShow);
            BC.addEvent(this, this.btnClear, Laya.Event.CLICK, this, this.onClearBox);
            BC.addEvent(this, this.btnFriends, Laya.Event.CLICK, this, this.onFriends);
            BC.addEvent(this, this.btnShow, Laya.Event.CLICK, this, this.onShow);
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.onLast);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onNext);
            BC.addEvent(this, this.btnShare, Laya.Event.CLICK, this, this.onShare);
            BC.addEvent(this, this.btnDownLoad, Laya.Event.CLICK, this, this.onDownload);
            BC.addEvent(this, EventManager, AppreciateModule.ITEM_ON_OPERATION, this, this.onClickArrange);
            BC.addEvent(this, EventManager, AppreciateModule.ITEM_CLOSE, this, this.onRemoveArrange);
            BC.addEvent(this, EventManager, globalEvent.COLLOCATION_CHANGE, this, this.updateList);
            EventManager.on(globalEvent.FIRST_SHARE_BACK, this, this.updateReward);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
            EventManager.off(globalEvent.FIRST_SHARE_BACK, this, this.updateReward);
        }

        destroy(): void {
            Laya.MouseManager.multiTouchEnabled = false;//关闭多指模式
            clientCore.LayerManager.moshi = clientCore.MODE.HENG;
            clientCore.UIManager.releaseCoinBox();
            Laya.Tween.clearAll(this.btnShow);
            Laya.Tween.clearAll(this.btnQie);
            Laya.Tween.clearAll(this.btnClear);
            Laya.Tween.clearAll(this.btnFriends);
            Laya.Tween.clearAll(this.boxOperation);
            Laya.Tween.clearAll(this.boxTitle);
            Laya.Tween.clearAll(this.btnClose);
            this._currUIData = null;
            this._hengUIData = null;
            this._shuUIData = null;
            this.clearBoxShow();
            this._operationItem?.dispose();
            this._operationItem = null;
            this._roleItem?.dispose();
            this._roleItem = null;
            this._otherItem?.dispose();
            this._otherItem = null;
            this._showItem?.destroy();
            this._showItem = null;
            this._stageItem?.destroy();
            this._stageItem = null;
            this._photoFrameItem?.destroy();
            this._photoFrameItem = null;
            super.destroy();
        }
    }
}