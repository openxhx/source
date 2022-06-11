
namespace library {
    /**
     * 收集
     */
    export class CollectPanel extends ui.library.panel.CollectUI implements IPanel {

        constructor() {
            super();

            this.list.itemRender = CollectItem;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.itemRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.itemMouse, null, false);
            this.imgReward.skin = clientCore.LocalInfo.sex == 1 ? "unpack/library/woman.png" : "unpack/library/man.png";

            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnStory, Laya.Event.CLICK, this, this.onStory);
        }

        show(): void {
            this.list.array = this.sortArr(xls.get(xls.rebuildAward).getValues());
        }

        dispose(): void {
            this.list.destroy();
            // this.list.renderHandler = null;
            BC.removeEvent(this);
        }

        private onScroll(): void {
            this.bar.y = 58 + 412 * (this.list.scrollBar.value / this.list.scrollBar.max);
        }

        private itemRender(item: CollectItem, index: number): void {
            item.setData(this.list.array[index]);
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK && e.target instanceof component.HuaButton) {
                let data: xls.rebuildAward = this.list.array[index];
                if (data && !LibraryModel.ins.checkFinish(1, data.id)) {
                    LibrarySCommand.ins.getReward(data.id, Laya.Handler.create(this, () => { this.list.array = this.sortArr(this.list.array); }))
                }
            }
        }

        private sortArr(value: xls.rebuildAward[]): xls.rebuildAward[] {
            return _.sortBy(value, (element) => {
                return LibraryModel.ins.checkFinish(1, element.id);
            });
        }

        private onStory(): void {
            let cls: xls.rebuild = xls.get(xls.rebuild).get(1);
            clientCore.AnimateMovieManager.showAnimateMovie(cls.story + "", this, () => { });
        }
    }
}