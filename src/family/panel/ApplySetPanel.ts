namespace family.panel {
    /**
     * 申请条件
     */
    export class ApplySetPanel extends ui.family.panel.ApplySetPanelUI {

        private _svrLv: number;
        private _svrAccept: number;

        constructor() {
            super();

            this.list.vScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.array = new Array(6);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this, this.btnCheckBox, Laya.Event.CLICK, this, this.onDefault);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        initOver(): void {
            this.list.selectedIndex = this._svrLv < 10 ? 0 : Math.floor(this._svrLv / 10);
            this.imgTick.visible = this._svrAccept == 1;
        }

        public show(): void {
            this.addPreLoad(this.getApplySet());
            clientCore.DialogMgr.ins.open(this);
        }

        public hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private listRender(item: Laya.Box, index: number): void {
            (item.getChildByName("num") as Laya.Label).changeText((index == 0 ? 1 : index * 10) + "");
            (item.getChildByName("sel") as Laya.Image).visible = this.list.selectedIndex == index;
        }

        private onScrollChange(): void {
            if (this.list.scrollBar.max <= 0) return;
            this.imgBar.y = 127 + (this.list.scrollBar.value / this.list.scrollBar.max) * 61;
        }

        private onDefault(): void {
            this.imgTick.visible = !this.imgTick.visible;
        }

        private onSure(): void {
            let lv: number = this.list.selectedIndex == 0 ? 1 : this.list.selectedIndex * 10;
            let auto: number = this.imgTick.visible ? 1 : 0;
            if (lv == this._svrLv && auto == this._svrAccept) return;
            FamilySCommand.ins.setApplyCondition(lv, auto, Laya.Handler.create(this, () => {
                this._svrLv = lv;
                this._svrAccept = auto;
            }));
        }

        private getApplySet(): Promise<void> {
            return new Promise((suc) => {
                FamilySCommand.ins.getApplySet(Laya.Handler.create(this, (msg: pb.sc_get_family_apply_condition) => {
                    this._svrLv = msg.minLvl;
                    this._svrAccept = msg.accept;
                    suc();
                }));
            })
        }
    }
}