namespace searchCherryClues {
    /**
     * 少女回忆书 - 线索搜寻玩法
     * searchCherryClues.SearchCherryCluesModule
     */
    export class SearchCherryCluesModule extends ui.searchCherryClues.SearchCherryCluesModuleUI {
        private _model: SearchCherryCluesModel;
        private _control: SearchCherryCluesControl;
        private _curPanel: IPanel;//当前游戏面板
        init(data: clientCore.SearchClubsMapData): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new SearchCherryCluesModel(), new SearchCherryCluesControl());
            this._model = clientCore.CManager.getModel(this.sign) as SearchCherryCluesModel;
            this._control = clientCore.CManager.getControl(this.sign) as SearchCherryCluesControl;
            this._model.info = this._data;
        }
        initOver(): void {
            let type: PanelType;
            if (this._model.info.state == 0) {
                type = this._model.getPanelType();
            } else {
                type = PanelType.RotateCherryPanel;
            }
            this.showPanel(type);
        }

        private showPanel(type: PanelType): void {
            switch (type) {
                case PanelType.GiftBoxPanel:
                    this._curPanel = new GiftBoxPanel();
                    break;
                case PanelType.RotateCherryPanel:
                    this._curPanel = new RotateCherryPanel();
                    break;
            }
            this._curPanel.show(this, this.sign);
        }

        addEventListeners(): void {
            BC.addEvent(this, EventManager, SearchCherryCluesEventType.CLOSE_GiftBoxPanel, this, this.onCloseHandler, [SearchCherryCluesEventType.CLOSE_GiftBoxPanel])
            BC.addEvent(this, EventManager, SearchCherryCluesEventType.CLOSE_RotateCherryPanel, this, this.onCloseHandler, [SearchCherryCluesEventType.CLOSE_GiftBoxPanel])
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        //关闭处理
        private onCloseHandler(data: SearchCherryCluesEventType): void {
            this.destroy();
        }

        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }

        onClosed(): void {
            if (this._curPanel) {
                this._curPanel.dispose();
                this._curPanel = null;
            }
        }
    }
}