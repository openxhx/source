namespace awakeSpring {
    export class AwakeSpringExchangePanel extends ui.awakeSpring.panel.AwakeSpringExchangeUI {
        private _model: AwakeSpringModel;
        private _control: AwakeSpringControl;
        constructor() {
            super();
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.eList.renderHandler = new Laya.Handler(this, this.eListRender, null, false);
            this.eList.mouseHandler = new Laya.Handler(this, this.eListMouse, null, false);
            this.rList.vScrollBarSkin = '';
            this.rList.renderHandler = new Laya.Handler(this, this.rListRender, null, false);
            this.rList.mouseHandler = new Laya.Handler(this, this.rListMouse, null, false);
        }
        show(sign: number): void {
            this._control = clientCore.CManager.getControl(sign) as AwakeSpringControl;
            this._model = clientCore.CManager.getModel(sign) as AwakeSpringModel;
            this.eList.vScrollBarSkin = "";
            this.eList.array = _.filter(xls.get(xls.commonAward).getValues(), (element: xls.commonAward) => { return element.type == this._model.ACTIVITY_ID; });
            this.rList.array = _.filter(xls.get(xls.eventExchange).getValues(), (element: xls.eventExchange) => { return element.type == this._model.ACTIVITY_ID; });
            this.onTab(0);
            clientCore.UIManager.setMoneyIds([this._model.EXCHANGE_ITEM_ID, this._model.AWARD_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }
        private onScroll() {
            let scroll = this.eList.scrollBar;
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
        }
        hide(): void {
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btn_0, Laya.Event.CLICK, this, this.onTab, [0]);
            BC.addEvent(this, this.btn_1, Laya.Event.CLICK, this, this.onTab, [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.eList.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onTab(index: number): void {
            this.ani1.index = index;
        }
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110303);
        }
        private eListRender(item: ui.awakeSpring.item.ExchangeItemUI, index: number): void {
            let data: xls.commonAward = this.eList.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let has: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
            clientCore.GlobalConfig.setRewardUI(item.vReward, { id: reward.v1, cnt: reward.v2, showName: false });
            item.numTxt.changeText(`x${data.num.v2}`);
            item.imgHas.visible = has;
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.num.v1);
            item.btnExchange.disabled = has || !clientCore.ItemsInfo.checkItemsEnough([{ itemID: data.num.v1, itemNum: data.num.v2 }]);
        }
        private eListMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.commonAward = this.eList.array[index];
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
                if (e.target instanceof component.HuaButton) {
                    this._control.exchangeReward(index + 1, data.id, new Laya.Handler(this, () => {
                        this.eList.changeItem(index, data);
                        util.RedPoint.reqRedPointRefresh(23502);
                    }));
                } else {
                    clientCore.ToolTip.showTips(e.target, { id: reward.v1 });
                }
            }
        }
        private rListRender(item: ui.awakeSpring.item.ExchangeItemUI, index: number): void {
            let data: xls.eventExchange = this.rList.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            let has: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
            clientCore.GlobalConfig.setRewardUI(item.vReward, { id: reward.v1, cnt: reward.v2, showName: false });
            item.numTxt.changeText(`x${data.cost[0].v2}`);
            item.imgHas.visible = has && data.repeat == 0;
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.cost[0].v1);
            item.btnExchange.disabled = item.imgHas.visible || !clientCore.ItemsInfo.checkItemsEnough([{ itemID: data.cost[0].v1, itemNum: data.cost[0].v2 }]);
        }
        private rListMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.eventExchange = this.rList.array[index];
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
                if (e.target instanceof component.HuaButton) {
                    this._control.exchange(data.id, this._model.ACTIVITY_ID, new Laya.Handler(this, () => { this.rList.refresh(); }));
                } else {
                    clientCore.ToolTip.showTips(e.target, { id: reward.v1 });
                }
            }
        }
    }
}