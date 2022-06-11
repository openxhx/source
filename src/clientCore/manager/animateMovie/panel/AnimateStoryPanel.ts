namespace clientCore {
    export class AnimateStoryPanel extends ui.animateMovie.panel.StoryHistoryPanelUI {
        constructor() {
            super();
            this.sideClose = false;
            this.isDialog = true;
            this.anchorY = this.anchorX = 0.5;
            this.box.vScrollBarSkin = null;
            this.init();
        }
        init() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.box.vScrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
        }

        show(arr: Array<{ name: string, content: string }>) {
            let y = 0;
            this.box.removeChildren();
            for (const obj of arr) {
                let cell = this.createCell(obj);
                cell.y = y;
                y += cell.height + 10;
                this.box.addChild(cell);
            }
            this.pos(Laya.stage.width / 2, Laya.stage.height / 2);
            this.scale(1, 1);
            Laya.Tween.from(this, { x: Laya.stage.width / 2, y: Laya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut);
        }


        private createCell(obj: { name: string, content: string }) {
            let cell = new ui.animateMovie.comp.HistoryRenderUI();
            cell.txtTitle.text = obj.name;
            cell.txtContent.text = obj.content;
            cell.height = cell.txtContent.y + cell.txtContent.height;
            return cell;
        }

        private onScrollChange(): void {
            let scroll = this.box.vScrollBar;
            this.imgScroll.y = _.clamp(scroll.value / scroll.max, 0, 1) * 457 + 75;
        }

        private onClose() {
            Laya.Tween.to(this, { x: Laya.stage.width / 2, y: Laya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, () => {
                this.removeSelf();
                this.event(Laya.Event.CLOSE);
            }));
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}