namespace moneyShop {
    export class DawnPrevPanel extends ui.moneyShop.panel.DawnPreviewPanelUI {
        private _nowStar: number;
        constructor() {
            super();
            this.list.hScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.Logger.sendLog('2020年9月4日活动', '【付费】朝花夕拾', '点击服装一览')
            clientCore.DialogMgr.ins.open(this);
            this.onTabClick(2);
        }

        private onListRender(cell: ui.moneyShop.render.DawnPreviewRenderUI, idx: number) {
            let data = cell.dataSource as xls.dawnBlossoms;
            cell.imgIcon.skin = pathConfig.getSuitImg(data.suitId, clientCore.LocalInfo.sex);
            cell.listStar.repeatX = clientCore.SuitsInfo.getSuitInfo(data.suitId).suitInfo.quality;
            cell.txtName.text = data.suitName;
            cell.imgGet.visible = clientCore.SuitsInfo.getSuitInfo(data.suitId).allGet;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (this._closed)
                return;
            if (e.type == Laya.Event.CLICK) {
                alert.showPreviewModule(this.list.getItem(idx).suitId);
            }
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onTabClick(star: number) {
            this._nowStar = star == this._nowStar ? 0 : star;
            this.imgSelect.visible = this._nowStar > 0;
            if (this._nowStar == 0) {
                this.list.dataSource = xls.get(xls.dawnBlossoms).getValues();
            }
            else {
                this.list.dataSource = _.filter(xls.get(xls.dawnBlossoms).getValues(), o => clientCore.SuitsInfo.getSuitInfo(o.suitId).suitInfo.quality == this._nowStar);
                let o = this['tab_' + this._nowStar];
                Laya.Tween.clearTween(this.imgSelect);
                Laya.Tween.to(this.imgSelect, { x: o.x, y: o.y }, 100);
            }
            for (let i = 2; i < 5; i++) {
                this['tab_' + i].skin = `moneyShop/star${i}${i == this._nowStar ? '1' : '0'}.png`;
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            for (let i = 2; i < 5; i++) {
                BC.addEvent(this, this['tab_' + i], Laya.Event.CLICK, this, this.onTabClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            Laya.Tween.clearTween(this.imgSelect);
        }
    }
}