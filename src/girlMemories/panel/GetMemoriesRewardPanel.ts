namespace girlMemories {
    /**
     * 领取回忆奖励面板
     */
    export class GetMemoriesRewardPanel extends ui.girlMemories.panel.GetMemoriesRewardPanelUI {
        private _model: GirlMemoriesModel;
        private _control: GirlMemoriesControl;
        //找茬从0开始
        private _index: number;
        private _effFly: clientCore.Bone;
        private _hasBtn: boolean;
        public constructor(sign: number, index: number, hasBtn: boolean) {
            super();
            this.sign = sign;
            this._index = index;
            this._hasBtn = hasBtn;
            this._model = clientCore.CManager.getModel(this.sign) as GirlMemoriesModel;
            this._control = clientCore.CManager.getControl(this.sign) as GirlMemoriesControl;
        }

        initOver(): void {
            this.imgContent.skin = `unpack/girlMemories/j_${this._index + 1}.png`;
            // //对按钮的处理
            if (!this._hasBtn) {
                this.btnGet.visible = false;
            }
            this.playEff();
            // const itemId: number = this._model.getJigSawItemId(this._index);
            // if (!clientCore.ItemsInfo.checkHaveItem(itemId)) {
            //     this.btnGet.visible = false;
            // }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [false]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private playEff(): void {
            this.clear2Eff();
            this._effFly = clientCore.BoneMgr.ins.play("res/animate/activity/zhuhuodongdonghua.sk", "flower", true, this);
            this._effFly.pos(350, 500);
        }

        private onClickHandler(e: Laya.Event): void {
            this.btnGet.mouseEnabled = false;
            this.onClose(true);
        }

        private clear2Eff(): void {
            if (this._effFly) {
                this._effFly.dispose();
                this._effFly = null;
            }
        }

        private onClose(isSucc: boolean): void {
            if (this._effFly != null) {
                isSucc = true;
            }
            EventManager.event(GirlMemoriesEventType.CLOSE_GetMemoriesRewardPanel, isSucc);
            clientCore.DialogMgr.ins.close(this);
        }

        destroy(): void {
            this._model = this._control = null;
            this.clear2Eff();
            super.destroy();
        }
    }
}