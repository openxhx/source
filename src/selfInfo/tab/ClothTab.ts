namespace selfInfo {
    export class ClothTab implements IselfInfoTabModule {
        public tab: number;
        private _mainUI: ui.selfInfo.tab.clothTabUI;
        private _model: SelfInfoModel;
        private _userBaseInfo: pb.IUserBase;
        constructor(ui: ui.selfInfo.tab.clothTabUI, sign: number) {
            this._mainUI = ui;
            this._model = clientCore.CManager.getModel(sign) as SelfInfoModel;
            this._userBaseInfo = this._model.userBaseInfo;
            this.initTab();
            this.addEventListeners();
        }

        private initTab() {
            this._mainUI.clothList.renderHandler = new Laya.Handler(this, this.onClothListRender);
            this._mainUI.clothList.mouseHandler = new Laya.Handler(this, this.onClothListMouse);
            this._mainUI.clothList.dataSource = _.filter(this._userBaseInfo.curClothes, (id) => { return clientCore.ClothData.getCloth(id) != void 0 });

            let bgId = clientCore.BgShowManager.filterDecoIdByType(this._userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Bg)
            let stageId = clientCore.BgShowManager.filterDecoIdByType(this._userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Stage)
            let riderId = clientCore.BgShowManager.filterDecoIdByType(this._userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Rider)
            this._mainUI.imgBg.skin = clientCore.ItemsInfo.getItemIconUrl(bgId);
            this._mainUI.imgStage.skin = clientCore.ItemsInfo.getItemIconUrl(stageId);
            this._mainUI.imgRider.skin = clientCore.ItemsInfo.getItemIconUrl(riderId);
            clientCore.ToolTip.addTips(this._mainUI.imgBg, { id: bgId });
            clientCore.ToolTip.addTips(this._mainUI.imgStage, { id: stageId });
            clientCore.ToolTip.addTips(this._mainUI.imgRider, { id: riderId });
            this.flushClothPageNum();
        }

        private flushClothPageNum() {
            this._mainUI.txtClothPageNum.text = (this._mainUI.clothList.page + 1) + '/' + this._mainUI.clothList.totalPage;
        }

        private onClothListRender(cell: ui.selfInfo.render.clothRenderUI, idx: number) {
            cell.img.skin = `res/cloth/icon/${cell.dataSource}.png`;
            cell.txtClothType.text = clientCore.CLOTH_TYPE_NAME_OBJ[xls.get(xls.itemCloth).get(cell.dataSource).kind];
        }

        private onClothListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(this._mainUI.clothList.getCell(idx), { id: this._mainUI.clothList.getItem(idx) });
            }
        }

        private onOpenClothChange() {
            if (this._userBaseInfo.userid == clientCore.LocalInfo.uid) {
                clientCore.ToolTip.gotoMod(6)
            }
        }

        private addEventListeners() {
            BC.addEvent(this, this._mainUI.btnLeftClothPage, Laya.Event.CLICK, this, this.onLeftClothPage);
            BC.addEvent(this, this._mainUI.btnRightClothPage, Laya.Event.CLICK, this, this.onRightClothPage);
            BC.addEvent(this, this._mainUI.bgShow, Laya.Event.CLICK, this, this.onOpenClothChange);
            BC.addEvent(this, this._mainUI.stageShow, Laya.Event.CLICK, this, this.onOpenClothChange);
            BC.addEvent(this, this._mainUI.riderShow, Laya.Event.CLICK, this, this.onOpenClothChange);
        }

        private onLeftClothPage(e: Laya.Event) {
            this._mainUI.clothList.page = this._mainUI.clothList.page > 0 ? this._mainUI.clothList.page - 1 : 0;
            this.flushClothPageNum();
        }

        private onRightClothPage(e: Laya.Event) {
            this._mainUI.clothList.page = this._mainUI.clothList.page > this._mainUI.clothList.totalPage ? this._mainUI.clothList.totalPage : this._mainUI.clothList.page + 1;
            this.flushClothPageNum();
        }

        show() {
            this._mainUI.visible = true;
        }

        hide() {
            this._mainUI.visible = false;
        }

        destroy() {
            BC.removeEvent(this);
            clientCore.ToolTip.removeTips(this._mainUI.imgBg);
            clientCore.ToolTip.removeTips(this._mainUI.imgStage);
            clientCore.ToolTip.removeTips(this._mainUI.imgRider);
        }
    }
}