namespace operaDrama {
    export class OperaAfterTalkPanel extends ui.operaDrama.panel.OperaAfterTalkPanelUI {
        private _lastSelectId: number;
        private _filter: Laya.ColorFilter;
        private _aniId = {
            '401': 80340,
            '402': 80343,
            '403': 80345,
            '404': 80342,
            '405': 80341,
            '406': 80344,
            '407': 80346
        }
        constructor() {
            super();
            this.list1.renderHandler = this.list2.renderHandler = this.list3.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list1.mouseHandler = this.list2.mouseHandler = this.list3.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this._filter = new Laya.ColorFilter();
            this._filter.setColor('#546e8b');
            this.list1.dataSource = clientCore.OperaManager.instance.getEndingIdByRoleId(1);
            this.list2.dataSource = clientCore.OperaManager.instance.getEndingIdByRoleId(2);
            this.list3.dataSource = clientCore.OperaManager.instance.getEndingIdByRoleId(3);
        }

        show() {
            this._lastSelectId = -1;
            this.list1.startIndex = this.list1.startIndex;
            this.list2.startIndex = this.list2.startIndex;
            this.list3.startIndex = this.list3.startIndex;
        }

        private onListRender(cell: ui.operaDrama.render.OperaEndTabRenderUI, idx: number) {
            let endId = cell.dataSource;
            cell.imgSelect.visible = endId == this._lastSelectId;
            cell.imgTitle.skin = endId == 407 ? `operaDrama/trueEnd.png` : `operaDrama/end_${idx}.png`;
            cell.imgTitle.filters = endId != this._lastSelectId ? [this._filter] : [];
            cell.imgLock.visible = !clientCore.OperaManager.instance.checkRouteJumped(endId);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let endId = e.currentTarget['dataSource']
                if (clientCore.OperaManager.instance.checkRouteJumped(endId)) {
                    this._lastSelectId = endId;
                    clientCore.AnimateMovieManager.showAnimateMovie(this._aniId[endId.toString()], this, this.onAniOver);
                }
                else {
                    alert.showFWords('尚未解锁该结局')
                }
            }
        }

        private onAniOver() {
            this.list1.startIndex = this.list1.startIndex;
            this.list2.startIndex = this.list2.startIndex;
            this.list3.startIndex = this.list3.startIndex;
        }
    }
}