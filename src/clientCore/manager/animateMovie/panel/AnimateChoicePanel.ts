namespace clientCore {
    export class AnimateChoicePanel extends ui.animateMovie.panel.ChoicePanelUI {
        private _historySelect: number[];//每次开剧情只初始化一次（为了兼容多次选择的情况
        private _haveSelect: number[];//本次选择，已经选过的选项
        private _cellWidth: number;
        constructor() {
            super();
            this._historySelect = [];
            this.sideClose = false;
            this.isDialog = true;
            this.list.vScrollBarSkin = null;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.anchorY = this.anchorX = 0.5;
        }

        /**本次剧情中所有选择的 */
        get selectArr() {
            return this._historySelect.slice();
        }

        show(haveSelectArr: number[][], arr: string[]) {
            this._haveSelect = haveSelectArr.length > this._historySelect.length ? haveSelectArr[this._historySelect.length] : [];
            //计算宽度
            this._cellWidth = 400;
            for (const str of arr) {
                let txt = new Laya.Label(str);
                txt.fontSize = 24;
                txt.font = '汉仪中圆简';
                this._cellWidth = Math.max(txt.width + 144, this._cellWidth);
            }

            this.list.dataSource = arr;
            this.pos(Laya.stage.width / 2, Laya.stage.height / 2);
            this.scale(1, 1);
            Laya.Tween.from(this, { x: Laya.stage.width / 2, y: Laya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut);
        }

        private onListRender(cell: Laya.Box, idx: number) {
            (cell.getChildByName('txtContent') as Laya.Label).text = cell.dataSource;
            let haveSelect = this._haveSelect.indexOf(idx) > -1;
            (cell.getChildByName('imgSelect') as Laya.Image).visible = haveSelect;
            cell.alpha = haveSelect ? 0.5 : 1;
            cell.width = this._cellWidth;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (this.list.getCell(idx).alpha == 1) {
                    this._historySelect.push(idx);
                    this.onClose();
                }
            }
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