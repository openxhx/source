namespace girlMemories {
    /**
     * 线索搜寻
     */
    export class SearchClubsPanel extends ui.girlMemories.panel.SearchClubsPanelUI {
        private _model: GirlMemoriesModel;
        private _control: GirlMemoriesControl;
        public constructor(sign: number) {
            super();
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as GirlMemoriesModel;
            this._control = clientCore.CManager.getControl(this.sign) as GirlMemoriesControl;
        }

        initOver(): void {
            this.reset2Park();
            this.reset2JigSaw();
        }

        private reset2Park(): void {
            const finished: number = this._model.getStatisticsClueFinish();
            this.labProgress.text = `${finished}/${this._model.DAILY_CULE_NUM}`;
        }

        private reset2JigSaw(): void {
            const needsIndex: number = this._model.getJigSawIndex();
            if (needsIndex != null) {
                const needs: number = this._model.NEED_CLUES[needsIndex];
                const money: number = clientCore.MoneyManager.getNumById(this._model.MONEY_ID);
                if (money >= needs) {
                    this.labPP.text = "已经有足够的线索可以检视了";
                } else {
                    this.labPP.text = `拼凑下个线索还需 ${money}/${needs}`;
                }
            } else {
                //TODO 已完成
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [false]);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        //点击事件处理
        private onClickHandler(e: Laya.Event): void {
            this.onClose(false);
            clientCore.MapManager.enterWorldMap(clientCore.SearchClubsMapManager.ins.MAP_ID);//进入到相关地图
            clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击线索搜寻面板前往按钮');
        }

        private onClose(isDestroy: boolean): void {
            EventManager.event(GirlMemoriesEventType.CLOSE_SearchClubsPanel, isDestroy);
            clientCore.DialogMgr.ins.close(this);
        }

        public destroy(): void {
            this._model = this._control = null;
            super.destroy();
        }
    }
}