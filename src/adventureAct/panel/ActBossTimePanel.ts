namespace adventureAct {
    export class ActBossTimePanel extends ui.adventureAct.panel.ActBossTimePanelUI {
        constructor() {
            super();
            this.panel.vScrollBarSkin = null;
            this.view.list.renderHandler = new Laya.Handler(this, this.onRwdListRender);
            let ids = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            this.view.list.dataSource = _.compact(_.map(ids, (id) => {
                return xls.get(xls.bossReward).get(id);
            }))
            this.view.list.repeatY = this.view.list.length;
        }

        show() {
            this.panel.vScrollBar.value = 0;
            clientCore.DialogMgr.ins.open(this);
        }

        private onRwdListRender(cell: ui.adventureAct.render.BossDetailRwdUI, idx: number) {
            let info = cell.dataSource as xls.bossReward;
            cell.boxRank.visible = idx < 3;
            cell.txtRank.visible = idx >= 3;
            cell.clipRank.index = idx;
            cell.txtRank.text = '第' + info.rank.v1 + '-' + info.rank.v2 + '名';
            let rwd = clientCore.LocalInfo.sex == 1 ? info.femaleReward : info.maleReward;
            cell.list.dataSource = _.map(rwd, (o) => {
                return {
                    id: o.v1,
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) },
                    imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) },
                    num: { value: o.v2.toString() },
                }
            });
            if (!cell.list.mouseHandler)
                cell.list.mouseHandler = new Laya.Handler(this, this.onItemMouse);
        }

        private onItemMouse(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget, { id: e.currentTarget['dataSource'].id })
            }
        }
        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}