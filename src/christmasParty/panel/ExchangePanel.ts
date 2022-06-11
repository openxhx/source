namespace christmasParty {
    export class ExchangePanel extends ui.christmasParty.panel.ExchangePanelUI {
        private _specialPanel: SpecialRewardPanel;
        private _suitPanel: SuitRewardPanel;

        public updateHanlder: Laya.Handler;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this.onTab(0);
        }

        close() {
            this.event("ON_CLOSE");
            this.updateHanlder.run();
            clientCore.DialogMgr.ins.close(this);
        }

        private onTab(index: number): void {
            this.tab1.skin = index == 0 ? "christmasParty/clip_l_w_1.png" : "christmasParty/clip_l_w_2.png";
            this.tab2.skin = index == 1 ? "christmasParty/clip_l_w_1.png" : "christmasParty/clip_l_w_2.png";

            if (index == 0) {
                this.showSpecialPanel();
                if (this._suitPanel) {
                    this._suitPanel.visible = false;
                }
            } else if (index == 1) {
                this.showSuitPanel();
                if (this._specialPanel) {
                    this._specialPanel.visible = false;
                }
            }
        }

        private showSpecialPanel(): void {
            if (!this._specialPanel) {
                this._specialPanel = new SpecialRewardPanel(this.sign);
                this._specialPanel.init();
                this.boxPanel.addChild(this._specialPanel);
            }
            this._specialPanel.onShow();
            this._specialPanel.visible = true;
        }

        private showSuitPanel(): void {
            if (!this._suitPanel) {
                this._suitPanel = new SuitRewardPanel(this.sign);
                this._suitPanel.init();
                this.boxPanel.addChild(this._suitPanel);
            }
            this._suitPanel.onShow();
            this._suitPanel.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.onTab, [0]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.onTab, [1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}