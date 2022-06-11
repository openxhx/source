namespace timeAmbulatory {
    enum tabType {
        evidence = 0,
        identify,
        yun,
        gift
    }
    /**
     * timeAmbulatory.TimeAmbulatoryModule
     * 2021.1.15
     * 光阴回廊
     */
    export class TimeAmbulatoryModule extends ui.timeAmbulatory.TimeAmbulatoryModuleUI {
        private _model: TimeAmbulatoryModel;
        private _control: TimeAmbulatoryControl;

        private _identifyPanel: TimeIdentifyPanle;
        private _evidencePanel: TimeEvidencePanle;
        private _yunPanel: TimeYunPanel;
        private _letterPanel: TimeLetterPanel;
        private _giftPanel: TimeGiftPanel;

        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new TimeAmbulatoryModel(), new TimeAmbulatoryControl());
            this._model = clientCore.CManager.getModel(this.sign) as TimeAmbulatoryModel;
            this._control = clientCore.CManager.getControl(this.sign) as TimeAmbulatoryControl;
            this._control._model = this._model;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.medalChallenge));
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.commonCompose));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.rechargeEvent));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(this.getMedalInfo());
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "zheng", open: 1 }, { name: "jian", open: 0 }, { name: "yun", open: 0 }, { name: "li", open: 0 }];
        }

        async onPreloadOver() {
            this._identifyPanel = new TimeIdentifyPanle(this.sign);
            this._evidencePanel = new TimeEvidencePanle();
            this._yunPanel = new TimeYunPanel();
            this._letterPanel = new TimeLetterPanel(this.sign);
            this._giftPanel = new TimeGiftPanel(this.sign);
            this._model.medalBuyStatus = clientCore.ItemsInfo.checkHaveItem(9900122) ? 1 : 0;
            this.panelArr = [this._evidencePanel, this._identifyPanel, this._yunPanel, this._giftPanel];
            this.list.array = this.panelName;
            this.tabMouse(0);
        }

        async getEventInfo() {
            let msg = await this._control.getInfo();
            this._model.activeValue = msg.activeValue;
            this._model.activeRewardStatus = msg.activeValueStatus;
            this._model.activeVIPRewardStatus = msg.extraReward;
            this._model.costRewardStatus = msg.costStatus;
            this._model.activeExtraRewardStatus = msg.extraExtraReward;
        }

        async getMedalInfo() {
            let msg = await clientCore.MedalManager.getMedal([MedalConst.TIME_LETTER_FIRST]);
            this._model.letterRed = msg[0].value;
        }

        /**页签 */
        private curPanel: number = -1;
        private panelName: { name: string, open: number }[];
        private panelArr: any[];
        private tabRender(item: ui.timeAmbulatory.render.TimeTabRenderUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.bg.skin = `timeAmbulatory/di_tab_${data.open}.png`;
            item.img.skin = `timeAmbulatory/${data.name}_${data.open}.png`;
            switch (index) {
                // case tabType.letter:
                //     item.red.visible = util.RedPoint.checkShow([22401]) || this._model.letterRed == 0;
                //     break;
                case tabType.gift:
                    item.red.visible = util.RedPoint.checkShow([22402, 22403]);
                    break;
                default:
                    item.red.visible = false;
            }
        }
        private tabMouse(index: number) {
            let param = "" + index;
            let idx = parseInt(param);
            if (idx < 0) return;
            if (this._model.disPanelChange) {
                this.list.selectedIndex = -1;
                return;
            }
            if (this.curPanel >= 0) {
                this.panelArr[this.curPanel].hide();
                this.panelName[this.curPanel].open = 0;
            }
            this.panelName[idx].open = 1;
            this.list.refresh();
            this.curPanel = idx;
            this.panelArr[idx].onShow();
            if (this.panelArr[idx].parent) {
                this.panelArr[idx].visible = true;
            } else {
                this.boxPanel.addChild(this.panelArr[idx]);
            }
        }

        /**点击主页按钮 */
        private onHomeClick() {
            this.destroy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.list.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            EventManager.on("TIME_REFRESH_TAB", this, this.refreshTab);
            EventManager.on(globalEvent.SEND_PARAM_TO_MODULE, this, this.tabMouse);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("TIME_REFRESH_TAB", this, this.refreshTab);
            EventManager.off(globalEvent.SEND_PARAM_TO_MODULE, this, this.tabMouse);
        }

        destroy() {
            super.destroy();
            this._identifyPanel?.destroy();
            this._letterPanel?.destroy();
            this._evidencePanel?.destroy();
            // this._yunPanel?.destroy();
            this._giftPanel?.destroy();
            this.list.array = [];
            clientCore.CManager.unRegSign(this.sign);
            this._identifyPanel = this._model = this._control = this._letterPanel = this._evidencePanel = this._yunPanel = this._giftPanel = null;
            this.panelArr = null;
            this.panelName = null;
        }
    }
}