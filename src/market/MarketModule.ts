

namespace market {
    /**
     * 花田集市
     */
    export class MarketModule extends ui.market.MarketModuleUI {
        private _tab: number;
        private _panel: core.BaseModule;
        private _map: core.BaseModule[] = [];
        private _tip: TipPanel;
        constructor() { super(); }


        init(): void {
            clientCore.UIManager.showCoinBox();
            this.sign = clientCore.CManager.regSign(new MarketModel(), new MarketControl());
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.godTree));
        }

        addEventListeners(): void {
            BC.addEvent(this, this.tab0, Laya.Event.CLICK, this, this.onShowTab, [0]);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.onShowTab, [1]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.onShowTab, [2]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTip, Laya.Event.CLICK, this, this.onTip);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        onPreloadOver(): void {
            clientCore.Logger.sendLog('2020年6月12日活动', '【付费】童话漫游物语', '打开活动面板');
            this.onShowTab(2);
        }

        destroy(): void {
            clientCore.UIManager.releaseCoinBox();
            _.forEach(this._map, (ele) => { ele?.destroy(); })
            this._map.length = 0;
            this._tip = this._map = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }

        private onTip(): void {
            let ruleId = channel.ChannelControl.ins.isOfficial ? 1017 : 1020;
            switch (this._tab) {
                case 0:
                    alert.showRuleByID(ruleId);
                    break;
                case 1:
                    alert.showRuleByID(1018);
                    break;
                case 2:
                    alert.showRuleByID(1024);
                    break;
                default:
                    break;
            }
            return;
        }

        private onShowTab(tab: number): void {
            this.ani1.gotoAndStop(tab);
            this._panel?.removeSelf();
            this._panel = this._map[tab];
            if (!this._panel) {
                this._panel = [new DesertPanel(this.sign), new FlowerPanel(this.sign), new MoonPanel(this.sign)][tab];
                this._map[tab] = this._panel;
            }
            this._tab = tab;
            this._panel.init(null);
            this.addChildAt(this._panel, 1);
        }
    }
}