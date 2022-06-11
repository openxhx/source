

namespace library {
    /**
     * 图书馆重建计划
     */
    export class LibraryModule extends ui.library.LibraryModuleUI {

        private _model: LibraryModel;
        private _sCommand: LibrarySCommand;
        private _rule: RulePanel;

        private _shopT: time.GTime;
        /** 图书馆商店持续时间*/
        private _lastT: number;
        private _tab: number;

        /** 兑换界面的服务器等级*/
        private _lv: number;

        constructor() { super(); }

        init(data?: number): void {
            super.init(data);
            this._model = new LibraryModel();
            this._sCommand = new LibrarySCommand();

            //加入UI
            clientCore.UIManager.setMoneyIds([9900018, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();

            //加载配表
            this.addPreLoad(xls.load(xls.rebuild))
            this.addPreLoad(xls.load(xls.rebuildAward));
            this.addPreLoad(xls.load(xls.rebuildChange));
            this.addPreLoad(xls.load(xls.eventPurchase));
            this.addPreLoad(xls.load(xls.eventExchange));
            //获取服务器的刷新等级 因为兑换界面服务器是按照当日第一次打开面板来记录的
            this.addPreLoad(this.getLv());
        }

        getLv(): Promise<void> {
            return new Promise((suc, fail) => {
                clientCore.MedalManager.getMedal([MedalDailyConst.LIBRARY_OPEN_LV]).then((data: pb.ICommonData[]) => {
                    this._lv = data[0].value || clientCore.LocalInfo.getLvInfo().lv;
                    suc();
                }).catch(() => {
                    this._lv = clientCore.LocalInfo.getLvInfo().lv;
                    fail();
                })
            })
        }

        onPreloadOver(): void {
            this._sCommand.getLibraryInfo(Laya.Handler.create(this, () => {
                this._lastT = xls.get(xls.rebuild).get(1).time * 60;
                this.vStack.setItems([new CollectPanel(), new ExchangePanel(this._lv), new ShopPanel()]);
                this.updateShop();
                this.onShowTabs(1);
            }))
        }

        addEventListeners(): void {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["tab" + i], Laya.Event.CLICK, this, this.onShowTabs, [i]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy, [true]);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            net.listen(pb.sc_rebuild_library_plan_strike_mysterious_merchant, this, this.onUpdateShop);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
            net.unListen(pb.sc_rebuild_library_plan_strike_mysterious_merchant, this, this.onUpdateShop);
        }

        destroy(): void {

            _.forEach(this.vStack.items, (element: IPanel) => { element.dispose(); })

            this._shopT?.dispose();
            this._model?.dispose();
            this._sCommand?.dispose();
            this._shopT = this._rule = this._model = this._sCommand = null;

            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        private onUpdateShop(msg: pb.sc_rebuild_library_plan_strike_mysterious_merchant): void {
            alert.showFWords('神秘商人出现，带来你可能感兴趣的东西~');
            this._model.shopTime = msg.startTime;
            // this._model.resetShop();
            // this.vStack.items[2]?.updateShop();
            this.updateShop();
        }

        private onShowTabs(tab: number): void {
            let index: number = tab - 1;
            this.ani1.gotoAndStop(index);
            this.vStack.selectedIndex = index;
            this.btnRule.visible = tab != 3;
            this._tab = tab;
            let panel: IPanel = this.vStack.items[index];
            panel?.show();
        }

        private onRule(): void {
            this._rule = this._rule || new RulePanel();
            this._rule.show();
        }

        /** 神秘商场更新*/
        private updateShop(): void {
            this._shopT?.dispose();
            let shopTime: number = this._model.shopTime + this._lastT;
            let dt: number = shopTime - clientCore.ServerManager.curServerTime;
            this.boxShop.visible = dt > 0;
            if (this.boxShop.visible) {
                this._shopT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onShop);
                this._shopT.start();
            }
        }

        private onShop(): void {
            let ct: number = clientCore.ServerManager.curServerTime;
            let st: number = this._model.shopTime + this._lastT;
            let dt: number = st - ct;
            if (dt <= 0) {
                this._shopT.dispose();
                this.boxShop.visible = false;
                this._tab == 3 && this.onShowTabs(1);
                return;
            }
            this.txTime.changeText(util.StringUtils.getDateStr2(dt, '{min}:{sec}'));
        }
    }
}