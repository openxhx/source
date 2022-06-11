namespace searchCherryClues {
    /**
     * 奖励盒子
     */
    export class GiftBoxPanel extends ui.searchCherryClues.panel.GiftBoxPanelUI implements IPanel {
        private _model: SearchCherryCluesModel;
        private _control: SearchCherryCluesControl;
        show(parent: Laya.Sprite, sign: number): void {
            if (!this.parent) {
                parent.addChild(this);
            }
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as SearchCherryCluesModel;
            this._control = clientCore.CManager.getControl(this.sign) as SearchCherryCluesControl;
        }

        createChildren(): void {
            super.createChildren();
            this.addEventListeners();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnOpen, Laya.Event.CLICK, this, this.onClickHandler);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnClose:
                    this.hide();
                    break;
                case this.btnOpen:
                    this._control.finishSearchCule(this._model.info.index + 1).then(msg => {
                        this._control.getSearchCuleReward(this._model.info.index + 1, 2).then(data => {
                            //领取了奖励
                            alert.showReward(data.item);
                            this._model.info.state = 2;
                            EventManager.event(globalEvent.GIRLMOMORIES_CLEAR_CLUE, this._model.info);
                            this.hide();//关闭
                        });
                    });
                    break;
            }
        }

        hide(): void {
            EventManager.event(SearchCherryCluesEventType.CLOSE_GiftBoxPanel);
        }
        dispose(): void {
            this.removeEventListeners();
            this._model = this._control = null;
            this.removeSelf();
        }
    }
}