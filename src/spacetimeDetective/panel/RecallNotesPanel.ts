namespace spacetimeDetective {
    /**
     * 回忆笔记
     */
    export class RecallNotesPanel extends ui.spacetimeDetective.panel.RecallNotesPanelUI {
        private _model: SpacetimeDetectiveModel;
        private _control: SpacetimeDetectiveControl;
        constructor(sign: number) {
            super();
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as SpacetimeDetectiveModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpacetimeDetectiveControl;
        }

        initOver(): void {
            this.lsNotes.vScrollBarSkin = "";
            this.lsNotes.renderHandler = new Laya.Handler(this, this.onRenderList);
            this.reset2UI();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [false]);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private reset2UI(): void {
            let arr: Array<INotesRenderVo> = [];
            let capterIndex: number = this._model.getCurrentCapter();
            let canRead: boolean;
            for (let i: number = 0; i < this._model.CAPTER_NAMEs.length; i++) {
                if (capterIndex == null) {
                    canRead = true;
                } else if (i < capterIndex) {
                    canRead = true;
                } else {
                    canRead = false;
                }
                arr.push({
                    index: i,
                    canRead: canRead
                });
            }
            BC.removeEvent(this.lsNotes);
            this.lsNotes.array = arr;
        }

        private getChinaNum(index: number): string {
            switch (index) {
                case 0: return `一`;
                case 1: return `二`;
                case 2: return `三`;
                case 3: return `四`;
                case 4: return `五`;
            }
        }

        private onRenderList(item: ui.spacetimeDetective.item.RecallNotesRenderUI, index: number): void {
            const data: INotesRenderVo = item.dataSource;
            item.labTitle.text = `时空旅记·${this.getChinaNum(data.index)}`;
            if (data.canRead) {
                item.btnRead.visible = true;
                item.stateUn.visible = false;
            } else {
                item.btnRead.visible = false;
                item.stateUn.visible = true;
            }
            BC.addEvent(this.lsNotes, item.btnRead, Laya.Event.CLICK, this, this.onReadHandler, [index]);
        }

        private onReadHandler(index: number): void {
            this.onClose(false);
            clientCore.AnimateMovieManager.showAnimateMovie(this._model.PLOTs[index], null, null);
        }

        private onClose(isSucc: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(SpacetimeDetectiveEventType.CLOSE_RecallNotesPanel, isSucc);
        }

        destroy(): void {
            this._model = this._control = null;
            BC.removeEvent(this.lsNotes);
            super.destroy();
        }
    }
}