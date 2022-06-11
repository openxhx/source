namespace whiteNightTheory {
    /**
     * 作业单元
     */
    export class TheoryRender extends ui.whiteNightTheory.item.TheoryRenderUI {
        private _info: IItemRenderVo;
        private _model: WhiteNightTheoryModel;
        private _isInitialed: boolean;

        constructor() {
            super();
            this._isInitialed = false;
        }

        createChildren(): void {
            super.createChildren();
            this.addEvent();
        }

        public initModel(model: WhiteNightTheoryModel): void {
            if (!this._isInitialed) {
                this._model = model;
                this._isInitialed = true;
            }
        }


        public updateUI(data: IItemRenderVo): void {
            this._info = data;
            if (this._info.isFlag) {
                this.renderFlag();
            } else {
                this.renderItem();
            }
        }

        private async renderItem(): Promise<void> {
            return new Promise<void>(resolve => {
                this.bh.visible = false;
                this.i_imgBg.skin = `whiteNightTheory/item_${this._info.index + 1}.png`;
                this.i_imgFinished.visible = this._info.isFinished;
                resolve();
            });
        }
        private async renderFlag(): Promise<void> {
            return new Promise<void>(resolve => {
                this.bI.visible = false;
                if (!this._info.isFinished) {
                    this.h_imgBg.skin = `whiteNightTheory/doing_bg.png`;
                    let target: IItemVo = this._model.getNextDoingItem();
                    //还剩离下一个
                    this.labMoney.text = `${target.moneyNum}`;
                    this.btnDo.mouseEnabled = true;
                } else {
                    this.h_imgBg.skin = `whiteNightTheory/all_over.png`;
                    this.hIcon.visible = this.btnDo.visible = this.labMoney.visible = false;
                }
                resolve();
            });
        }
        private addEvent(): void {
            BC.addEvent(this, this.btnDo, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.i_imgBg, Laya.Event.CLICK, this, this.onClickHandler);
        }
        private removeEvent(): void {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnDo://修业
                    let target: IItemVo = this._model.getNextDoingItem();
                    if (clientCore.MoneyManager.getNumById(this._model.MONEY_ID) >= target.moneyNum) {
                        this.btnDo.mouseEnabled = false;
                        EventManager.event(WhiteNightTheoryEventType.CLICK_STUDY);
                    } else {
                        alert.showFWords(`真相天平不足!`);
                    }
                    break;
                case this.i_imgBg://
                    if (!this._info || !this._info.itemId) return;
                    clientCore.ToolTip.showContentTips(this, 0, [{ v1: this._info.itemId, v2: 1 }]);
                    break;
            }
        }

        public clear(): void {
            this.removeEvent();
            this._model = null;
        }

        destroy(): void {
            this.clear();
            super.destroy();
        }
    }
}