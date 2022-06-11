namespace christmasParty {
    export class SpecialRewardPanel extends ui.christmasParty.panel.SpecialRewardPanelUI {
        private _tokenNum: number;

        private _model: ChristmasPartyModel;
        private _control: ChristmasPartyControl;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this.sign) as ChristmasPartyModel;
            this._control = clientCore.CManager.getControl(this.sign) as ChristmasPartyControl;

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;

            this.list.renderHandler = new Laya.Handler(this, this.onRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onMouse);

            this.list.dataSource = this._model.getRewardArr();

            this.addEventListeners();
        }

        public onShow(): void {
            this._tokenNum = clientCore.ItemsInfo.getItemNum(this._model.tokenId);
            this.list.refresh();
            this.list.page = 0;
            clientCore.UIManager.setMoneyIds([this._model.tokenId]);
            clientCore.UIManager.showCoinBox();
        }

        private onRender(cell: ui.christmasParty.render.SpecialRewardRenderUI, idx: number) {
            let itemId = 0;
            if (clientCore.LocalInfo.sex == 1) {
                itemId = cell.dataSource.femaleAward[0].v1;
            } else {
                itemId = cell.dataSource.maleAward[0].v1;
            }
            cell.icon.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
            let isHas = clientCore.ItemsInfo.getItemNum(itemId) > 0;
            cell.imgExchange.visible = isHas;
            cell.btnExchange.disabled = isHas || this._tokenNum < cell.dataSource.num.v2;
            cell.labNum.text = 'x' + cell.dataSource.num.v2;
        }

        private onMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.dataSource[idx];
                if (e.target.name == "exchange") {
                    this._control.exchange(data.id, idx + 1, Laya.Handler.create(this, (msg: pb.sc_drama_actor_exchange) => {
                        this.list.getCell(idx)["imgExchange"].visible = true;
                        this.list.getCell(idx)["btnExchange"].disabled = true;
                        alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                    }))
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

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onLast(): void {
            this.list.page--;
        }

        private onNext(): void {
            this.list.page++;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.onLast);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onNext);
        }

        destroy() {
            this._model = null;
            this._control = null;
            super.destroy();
        }
    }
}