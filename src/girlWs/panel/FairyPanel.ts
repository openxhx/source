namespace girlWs {
    /**
     * 森之物语
     */
    export class FairyPanel implements IPanel {
        private _control: GirlWsControl;
        private _model: GirlWsModel;
        private _ui: ui.girlWs.panel.FairyPanelUI;
        init(sign: number, ui: ui.girlWs.panel.FairyPanelUI): void {
            this._model = clientCore.CManager.getModel(sign) as GirlWsModel;
            this._control = clientCore.CManager.getControl(sign) as GirlWsControl;
            this._ui = ui;
            this._ui.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this._ui.list.mouseHandler = new Laya.Handler(this, this.listMouse, null, false);
            this._ui.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this._ui.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.addEvents();
            this.updatePrices();
            this.updateView();
        }
        show(): void {

        }
        dispose(): void {
            this.removeEvents();
            this._model = this._control = this._ui = null;
        }
        private addEvents(): void {
            BC.addEvent(this, this._ui.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this._ui.btnBuy, Laya.Event.CLICK, this, this.onSuitBuy);
            BC.addEvent(this, this._ui.btnPack, Laya.Event.CLICK, this, this.onPackBuy);
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.FARIY_SUIT_ID);
        }
        /** 套装购买*/
        private onSuitBuy(): void {
            let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(2501);
            alert.showSmall(`是否花费${clientCore.ItemsInfo.getItemName(cfg.cost[0].v1)} x${cfg.cost[0].v2} 购买套装？`, {
                callBack: {
                    funArr: [() => {
                        this._control.buy(2501, this._model.ACTIVITY_ID, new Laya.Handler(this, () => {
                            this.updateSuit();
                            this._ui.btnPack.disabled = true;
                        }));
                    }],
                    caller: this
                }
            })
        }
        /** 打包购买*/
        private onPackBuy(): void {
            let type: number = clientCore.FlowerPetInfo.petType;
            let id: number = type == 0 ? 2502 : (type == 1 ? 2503 : 2504);
            let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(id);
            alert.showSmall(`是否花费${clientCore.ItemsInfo.getItemName(cfg.cost[0].v1)} x${cfg.cost[0].v2} 打包购买？`, {
                callBack: {
                    funArr: [() => {
                        this._control.buy(id, this._model.ACTIVITY_ID, new Laya.Handler(this, () => {
                            this._ui.list.refresh();
                            this.updateSuit();
                            this._ui.btnPack.disabled = true;
                        }));
                    }],
                    caller: this
                }
            })
        }
        private updateSuit(): void {
            let hasSuit: boolean = clientCore.SuitsInfo.getSuitInfo(this._model.FARIY_SUIT_ID).allGet;
            this._ui.btnBuy.visible = !hasSuit;
            this._ui.imgSuitHas.visible = hasSuit;
        }
        private updatePrices(): void {
            let base: number = 2502;
            for (let i: number = 0; i < 3; i++) {
                let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(base + i);
                this._ui[`txPrice_${i + 1}`].changeText(cfg.cost[0].v2);
            }
        }
        private updateView(): void {
            let base: number = 2495;
            let isBuy: boolean = false; //是否买过任何散件
            let isFemale: boolean = clientCore.LocalInfo.sex == 1;
            let type: number = clientCore.FlowerPetInfo.petType;
            this._ui.imgGou.y = type == 0 ? 482 : (type == 1 ? 508 : 539);
            this._ui.list.array = _.map(new Array(6), (element, index) => {
                let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(base + index);
                let reward: xls.pair = isFemale ? cfg.femaleProperty[0] : cfg.maleProperty[0];
                if (!isBuy && clientCore.ItemsInfo.checkHaveItem(reward.v1)) isBuy = true;
                return cfg;
            });
            this._ui.btnPack.disabled = isBuy;
            this.updateSuit();
        }
        private listRender(item: ui.girlWs.item.ShopItemUI, index: number): void {
            let cfg: xls.eventExchange = this._ui.list.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleProperty[0] : cfg.maleProperty[0];
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgAdd.visible = !has;
            item.imgHas.visible = has;
            item.imgCloth.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            item.nameTxt.changeText(clientCore.ItemsInfo.getItemName(reward.v1));
            item.priceTxt.changeText(cfg.cost[0].v2 + '');
        }
        private listMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let cfg: xls.eventExchange = this._ui.list.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleProperty[0] : cfg.maleProperty[0];
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            if (has) return;
            alert.showSmall(`是否消耗灵豆x${cfg.cost[0].v2}购买？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        this._control.buy(cfg.id, this._model.ACTIVITY_ID, new Laya.Handler(this, () => {
                            this._ui.list.changeItem(index, cfg);
                            this._ui.btnPack.disabled = true;
                        }));
                    }]
                }
            })
        }
    }
}