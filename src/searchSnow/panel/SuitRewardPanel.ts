namespace searchSnow {
    export class SuitRewardPanel extends ui.searchSnow.panel.SuitRewardPanelUI {
        private _model: SearchSnowModel;
        private _control: SearchSnowControl;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this.sign) as SearchSnowModel;
            this._control = clientCore.CManager.getControl(this.sign) as SearchSnowControl;

            this.list.renderHandler = new Laya.Handler(this, this.onRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onMouse);

            this.list.dataSource = this._model.getRewardArr2();
        }

        public onShow(): void {
            clientCore.UIManager.releaseCoinBox();
        }

        private onRender(cell: ui.searchSnow.render.SuitRewardRenderUI, idx: number) {
            let data: xls.eventExchange = cell.dataSource;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];

            let arr = [reward].concat(data.cost);
            for (var i = 0; i < arr.length; i++) {
                let item = cell["item" + i];
                let id = arr[i].v1;
                let cnt = arr[i].v2;
                clientCore.GlobalConfig.setRewardUI(item, { id: id, cnt: cnt, showName: false });
                if (i > 0) {
                    item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(id), cnt);
                    item.num.visible = true;
                }
                BC.addEvent(this, item, Laya.Event.CLICK, this, this.onTips, [item, id]);
                item.visible = true;
            }
            for (i; i < 4; i++) {
                let item = cell["item" + i];
                item.visible = false;
            }

            let isExchange = data.repeat == 0 && clientCore.ItemsInfo.checkHaveItem(reward.v1);
            cell.btnExchange.visible = !isExchange;
            cell.imgExchange.visible = isExchange
        }

        private onMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "exchange") {
                    let data = this.list.dataSource[idx];
                    for (let i = 0; i < data.cost.length; i++) {
                        let cost = data.cost[i];
                        if (clientCore.ItemsInfo.getItemNum(cost.v1) < cost.v2) {
                            alert.showFWords('所需道具数量不足，无法兑换~');
                            return;
                        }
                    }
                    this._control.commonExchange(data.id, Laya.Handler.create(this, (msg: pb.sc_common_exchange) => {
                        this.list.refresh();
                        alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                    }))
                }
            }
        }

        private onTips(cell: any, itemId: number): void {
            clientCore.ToolTip.showTips(cell, { id: itemId });
        }

        destroy() {
            this._model = null;
            this._control = null;
            super.destroy();
        }
    }
}