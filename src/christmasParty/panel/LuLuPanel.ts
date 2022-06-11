namespace christmasParty {
    export class LuLuPanel extends ui.christmasParty.panel.LuLuPanelUI {
        private numMax: number = 0;

        private _model: ChristmasPartyModel;
        private _control: ChristmasPartyControl;

        public updateHanlder: Laya.Handler;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this.sign) as ChristmasPartyModel;
            this._control = clientCore.CManager.getControl(this.sign) as ChristmasPartyControl;

            this.numMax = this._model.getChrisNum1();
            this.list.renderHandler = new Laya.Handler(this, this.onRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onMouse);
            this.list.selectedIndex = 0;
            this.list.dataSource = this._model.getChrisRange1();

            this.updateView();
            clientCore.GlobalConfig.setRewardUI(this.itemAward, { id: this._model.tokenId, cnt: 30, showName: false });
            clientCore.UIManager.releaseCoinBox();
        }

        private updateView(): void {
            this.iabNum.text = this._model.llSubTimes + "/" + this.numMax;
            this.btnSubmit.disabled = this._model.llSubTimes == this.numMax;
            this.btnGet.disabled = this._model.llSubTimes < this.numMax;
            this.list.refresh();
        }

        private onRender(cell: ui.christmasParty.render.ConvertItemUI, idx: number) {
            let itemId = cell.dataSource;
            let cnt = clientCore.ItemsInfo.getItemNum(itemId);
            cell.imgSel.visible = idx == this.list.selectedIndex;
            clientCore.GlobalConfig.setRewardUI(cell.mcRward, { id: itemId, cnt: cnt, showName: false });
            cell.mcRward.num.value = cnt + "";
            cell.mcRward.num.visible = true;
        }

        private onMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this.list.selectedIndex = idx;
            }
        }

        private onClose() {
            this.event("ON_CLOSE");
            clientCore.DialogMgr.ins.close(this);
        }

        private onSubmit(): void {
            let itemId = this.list.selectedItem;
            let itemCnt = Math.min(Math.min(clientCore.ItemsInfo.getItemNum(itemId), 20), this.numMax - this._model.llSubTimes)
            if (itemCnt <= 0) {
                alert.showFWords('所需道具数量不足，无法提交~');
                return;
            }
            this._control.subItem(0, itemId, itemCnt, Laya.Handler.create(this, (msg: pb.sc_christmas_party_sub_item) => {
                this._model.llSubTimes += itemCnt;
                this.updateView();
            }))
        }

        private onGet(): void {
            this._control.subGetReward(0, Laya.Handler.create(this, (msg: pb.sc_christmas_party_sub_get_reward) => {
                this.updateHanlder.run();
                alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                this.onClose();
            }))
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            super.destroy();
        }
    }
}