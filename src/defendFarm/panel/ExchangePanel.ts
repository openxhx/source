namespace defendFarm {
    export class ExchangePanel extends ui.defendFarm.panel.ExchangePanelUI {
        public readonly EVENT_SHOWCOINBOX: string = "showCoinBox";//刷新货币列表

        private _pageItemNum: number = 8;
        private _pageIndex: number;
        private _pageMax: number;
        private _dataArr: Array<xls.commonAward>;

        private _sign: number;

        private _model: DefendFarmModel;
        private _control: DefendFarmControl;
        private _cls: xls.commonBuy;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this._sign) as DefendFarmModel;
            this._control = clientCore.CManager.getControl(this._sign) as DefendFarmControl;

            this._pageIndex = 0;
            this._dataArr = this._model.getRewardArr();
            this._pageMax = Math.ceil(this._dataArr.length / this._pageItemNum) - 1;

            this.list.renderHandler = new Laya.Handler(this, this.onTaskRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onTaskMouse);

            this.imgMan.visible = clientCore.LocalInfo.sex == 2;
            this.imgWoman.visible = clientCore.LocalInfo.sex == 1;

            clientCore.UIManager.setMoneyIds([this._model.item_id2]);

            this.update();
        }

        private update(): void {
            this.list.dataSource = _.slice(this._dataArr, this._pageIndex * this._pageItemNum, (this._pageIndex + 1) * this._pageItemNum);
        }

        private onTaskRender(cell: ui.defendFarm.render.RewardExchangeRenderUI, idx: number) {
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cell.dataSource.femaleAward[0] : cell.dataSource.maleAward[0];
            clientCore.GlobalConfig.setRewardUI(cell.rewardView, { id: reward.v1, cnt: reward.v2, showName: false });

            let expend: xls.pair = cell.dataSource.num;
            cell.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(expend.v1);
            cell.costTxt.text = "x" + expend.v2;

            cell.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            (cell.getChildByName('exchange') as component.HuaButton).disabled = clientCore.ItemsInfo.checkHaveItem(reward.v1) || clientCore.ItemsInfo.getItemNum(expend.v1) < expend.v2;
        }

        private onTaskMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.dataSource[idx];
                if (e.target.name == "exchange") {
                    this._control.exchangeAward(
                        this._pageIndex * this._pageItemNum + idx + 1,
                        Laya.Handler.create(this, (msg: pb.sc_defend_farm_exchange) => {
                            this.list.refresh();
                            alert.showReward(msg.items);
                        }));
                } else {
                    let itemId = 0;
                    if (clientCore.LocalInfo.sex == 1) {
                        itemId = data.femaleAward[0].v1;
                    } else {
                        itemId = data.maleAward[0].v1;
                    }
                    clientCore.ToolTip.showTips(e.target, { id: itemId });
                }
            }
        }

        close() {
            this.event(this.EVENT_SHOWCOINBOX);
            clientCore.DialogMgr.ins.close(this);
        }

        private onLast(): void {
            this._pageIndex--;
            if (this._pageIndex < 0) {
                this._pageIndex = 0;
            }
            this.update();
        }

        private onNext(): void {
            this._pageIndex++;
            if (this._pageIndex > this._pageMax) {
                this._pageIndex = this._pageMax;
            }
            this.update();
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.onLast);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onNext);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
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