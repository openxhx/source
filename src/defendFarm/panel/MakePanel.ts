namespace defendFarm {
    export class MakePanel extends ui.defendFarm.panel.MakePanelUI {
        public readonly EVENT_MAKECOOKE: string = "makeCooke";  //成功制作饼干
        public readonly EVENT_SHOWCOINBOX: string = "showCoinBox";//刷新货币列表

        private _sign: number;

        private _model: DefendFarmModel;
        private _control: DefendFarmControl;

        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listSelect)
        }

        init() {
            this._model = clientCore.CManager.getModel(this._sign) as DefendFarmModel;
            this._control = clientCore.CManager.getControl(this._sign) as DefendFarmControl;

            let arr: xls.pair[] = [{ v1: this._model.item_id3, v2: 10 }, { v1: this._model.item_id4, v2: 10 }, { v1: this._model.item_id5, v2: 5 }];
            this.list.array = arr;
            this.list.repeatX = arr.length;
        }

        private listSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let reward: xls.pair = this.list.array[index];
                if (reward) {
                    clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
                };
            }
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
            item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(reward.v1), reward.v2);
        }

        private onExchange(): void {
            let arr: xls.pair[] = []
            for (let i = 0; i < this.list.array.length; i++) {
                let data = this.list.array[i];
                let hasNum = clientCore.ItemsInfo.getItemNum(data.v1);
                if (hasNum < data.v2) {
                    arr.push(data);
                }
            }
            if (arr.length > 0) {
                alert.mtrNotEnough(arr, Laya.Handler.create(this, this.makeCooke));
            } else {
                this.makeCooke();
            }
        }

        private makeCooke(): void {
            this._control.makeCooke(Laya.Handler.create(this, (msg: pb.sc_common_buy) => {
                this.event(this.EVENT_MAKECOOKE);
                this.close();
            }));
        }

        close() {
            this.event(this.EVENT_SHOWCOINBOX);
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            this._control = null;
            super.destroy();
        }
    }
}