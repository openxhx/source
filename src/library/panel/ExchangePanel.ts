
namespace library {
    /**
     * 兑换
     */
    export class ExchangePanel extends ui.library.panel.ExchangeUI implements IPanel {


        private _model: LibraryModel;
        private _tasks: string[];

        constructor(lv: number) {
            super();
            this._model = LibraryModel.ins;
            this.list.itemRender = ExchangeItem;
            this.list.renderHandler = Laya.Handler.create(this, this.itemRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.itemMouse, null, false);

            let array: xls.eventExchange[] = [];
            let task: string = this._model.getExchange(lv);
            if (task) {
                this._tasks = task.split(";");
                let len: number = this._tasks.length;
                for (let i: number = 1; i <= len; i++) {
                    let data: xls.eventExchange = xls.get(xls.eventExchange).get(parseInt(this._tasks[i - 1]));
                    !this._model.checkFinish(2, i) && array.push(data);
                }
            }
            this.list.array = array;
            this.imgFinish.visible = this.list.length <= 0;
        }

        show(): void {

        }

        dispose(): void {
            this._model = this._tasks = null;
        }

        private itemRender(item: ExchangeItem, index: number): void {
            item.data = this.list.array[index];
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            if (e.target instanceof component.HuaButton) {
                let data: xls.eventExchange = this.list.array[index];
                let pos: number = this._tasks.indexOf(data.id + "") + 1;
                if (!pos) return;
                if (!this._model.checkFinish(2, pos)) {
                    let item: any = this.list.getCell(index);
                    item.materials.length > 0 ? clientCore.MaterialsTip.showTips(item.materials, Laya.Handler.create(this, this.exchangeTask, [pos, data.id, index])) : this.exchangeTask(pos, data.id, index);
                }
            }
        }

        /** 去服务器兑换*/
        private exchangeTask(pos: number, id: number, index: number): void {
            LibrarySCommand.ins.exchange(pos, id, Laya.Handler.create(this, () => {
                this.list.deleteItem(index);
                this.imgFinish.visible = this.list.length <= 0;
            }))
        }
    }
}