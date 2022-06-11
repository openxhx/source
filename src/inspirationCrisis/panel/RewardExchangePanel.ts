namespace inspirationCrisis {
    export class RewardExchangePanel extends ui.inspirationCrisis.panel.RewardExchangePanelUI {
        private _sign: number;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init() {
            let model = clientCore.CManager.getModel(this._sign) as InspirationCrisisModel;
            this.listTask.renderHandler = new Laya.Handler(this, this.onTaskRender);
            this.listTask.mouseHandler = new Laya.Handler(this, this.onTaskMouse);

            this.listTask.dataSource = model.getSuitList();
        }

        private update(): void {
        }

        private onTaskRender(cell: ui.inspirationCrisis.render.RewardExchangeRenderUI, idx: number) {
            let itemId = 0;
            if (clientCore.LocalInfo.sex == 1) {
                itemId = cell.dataSource.femaleAward[0].v1;
            } else {
                itemId = cell.dataSource.maleAward[0].v1;
            }
            cell.icon.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
            let isHas = clientCore.ItemsInfo.getItemNum(itemId) > 0;
            cell.labName.text = clientCore.ItemsInfo.getItemName(itemId);
            cell.imgExchange.visible = isHas;
            cell.labNum.text = cell.dataSource.num.v2;
        }

        private onTaskMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.listTask.dataSource[idx];
                let itemId = 0;
                if (clientCore.LocalInfo.sex == 1) {
                    itemId = data.femaleAward[0].v1;
                } else {
                    itemId = data.maleAward[0].v1;
                }
                clientCore.ToolTip.showTips(e.target, { id: itemId });
            }
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            super.destroy();
        }
    }
}