namespace cp {
    export class CpTitlePanel extends ui.cp.panel.CpTitlePanelUI {
        private _tmpSelect: number;
        private _cpNick: string;
        constructor() {
            super();
            this._cpNick = clientCore.CpManager.instance.cpInfo?.userBase?.nick ?? '??';
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.dataSource = xls.get(xls.cpCommonDate).get(1).cpCardShow.split(';');
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            this._tmpSelect = clientCore.LocalInfo.srvUserInfo.cpShowType;
            this.updateView();
        }

        private updateView() {
            this.imgGou.visible = this._tmpSelect != 0;
            this.list.startIndex = this.list.startIndex;
            this.btnSure.disabled = this._tmpSelect == clientCore.LocalInfo.srvUserInfo.cpShowType;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onListRender(cell: ui.cp.render.CpTitleRenderUI, idx: number) {
            let id = parseInt(cell.dataSource.split('/')[0]);
            let color = cell.dataSource.split('/')[1];
            cell.txt.text =  '你的花缘 & 你的昵称';
            cell.txt.color = '#' + color;
            cell.imgIcon.skin = pathConfig.getCpTitle(id);
            cell.imgSelect.visible = this.imgGou.visible && this._tmpSelect == id;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && this.imgGou.visible) {
                this._tmpSelect = parseInt(this.list.getItem(idx).split('/')[0]);
                this.updateView();
            }
        }

        private onSure() {
            clientCore.CpManager.setCpTitle(this._tmpSelect).then(() => {
                this._tmpSelect = clientCore.LocalInfo.srvUserInfo.cpShowType;
                this.updateView();
            })
        }

        private onSelect() {
            this._tmpSelect = this._tmpSelect == 0 ? 1 : 0;
            this.updateView();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.imgSelect, Laya.Event.CLICK, this, this.onSelect);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}