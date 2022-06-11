namespace moonStory {
    enum tabType {
        ljsy = 0,
        yyzc,
        gyfh,
        ssxy
    }
    export class MoonStoryModule extends ui.moonStory.MoonStoryModuleUI {
        private _model: MoonStoryModel;
        private _control: MoonStoryControl;

        private _ljsyPanel: MoonLjsyPanel;
        private _yyzcPanel: MoonYyzcBuyPanel | MoonYyzcPanel;
        private _gyfhPanel: MoonGyfhPanel;
        private _ssxyPanel: MoonSsxyPanel;
        private _buyPanel: MoonBuyPanel;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new MoonStoryModel(), new MoonStoryControl());
            this._model = clientCore.CManager.getModel(this.sign) as MoonStoryModel;
            this._control = clientCore.CManager.getControl(this.sign) as MoonStoryControl;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.godTreeCounter));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.medalChallenge));
            this.addPreLoad(xls.load(xls.rechargeToday));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(this.getDrawInfo());
            this.addPreLoad(this._model.getBuyMedal());
            this.listTab.visible = false;
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.tabRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "tab_ljsy", open: 0 }, { name: "tab_yyzc", open: 0 }, { name: "tab_gyfh", open: 0 }, { name: "tab_ssxy", open: 0 }];
            this.setVersion();
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年10月16日活动', '【付费】华彩月章', '打开活动面板');
            this._ljsyPanel = new MoonLjsyPanel(this.sign);
            this._yyzcPanel = new MoonYyzcPanel(this.sign);
            this._gyfhPanel = new MoonGyfhPanel(this.sign);
            this._ssxyPanel = new MoonSsxyPanel(this.sign);
            this._buyPanel = new MoonBuyPanel(this.sign);
            this.panelArr = [this._ljsyPanel, this._yyzcPanel, this._gyfhPanel, this._ssxyPanel];
            this.listTab.array = this.panelName;
            if (this._model.giftOpen == 0 || this._model.giftOpen.changeTime < clientCore.ServerManager.getWeekUpdataSec()) {
                this.btn_gift.onRedChange(true);
            } else {
                this.btn_gift.onRedChange(false);
            }
        }

        private setVersion() {
            this.img_new_ljsy.visible = true;
            this.img_new_yyzc.visible = clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec('2020-10-9 00:00:00');
            if (this.img_new_yyzc.visible) this.btn_yyzc.skin = "unpack/moonStory/yyzc_1.png";
            if (clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec('2020-10-8 00:00:00')) {
                this.btn_ljsy.skin = "unpack/moonStory/ljsy_" + clientCore.LocalInfo.sex + "_2.png";
            } else {
                this.btn_ljsy.skin = "unpack/moonStory/ljsy_" + clientCore.LocalInfo.sex + "_1.png";
            }
            this.btn_ssxy.skin = "unpack/moonStory/ssxy_" + clientCore.LocalInfo.sex + ".png";
        }

        popupOver() {
            this.checkOldCoin();
        }

        async getEventInfo() {
            let msg = await this._control.getInfo();
            this._model.activeValue = msg.activeValue;
            this._model.activeRewardStatus = msg.activeValueStatus;
            this._model.activeVIPRewardStatus = msg.extraReward;
            this._model.adBuyStatus = msg.isBuyFlag;
        }

        async getDrawInfo() {
            let msg = await this._control.getDrawInfo();
            this._model.drawCount = msg.totalTimes;
            this._model.drawCountRewardStatus = msg.totalTimesRewardStatus;
        }

        private checkOldCoin() {
            if (clientCore.ItemsInfo.getItemNum(1511008) > 0 || clientCore.ItemsInfo.getItemNum(1511009) > 0) {
                new MoonReplacePanel().show();
            }
        }

        /**页签 */
        private curPanel: number = -1;
        private panelName: { name: string, open: number }[];
        private panelArr: any[];
        private tabRender(item: ui.moonStory.render.MoonPanelTabUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgBg.skin = data.open == 1 ? "moonStory/tab_bg_1.png" : "moonStory/tab_bg_0.png";
            item.imgName.skin = `moonStory/${data.name}_${data.open}.png`;
            switch (index) {
                case tabType.ssxy:
                    item.imgRed.visible = util.RedPoint.checkShow([16902]);
                    break;
                case tabType.gyfh:
                    item.imgRed.visible = util.RedPoint.checkShow([16904, 16906]);
                    break;
                case tabType.ljsy:
                    item.imgRed.visible = util.RedPoint.checkShow([16903, 16905]);
                    break;
                default:
                    item.imgRed.visible = false;
            }
        }
        private tabMouse(idx: number) {
            if (idx < 0) return;
            if (this.curPanel >= 0) {
                this.panelArr[this.curPanel].hide();
                this.panelName[this.curPanel].open = 0;
            }
            this.panelName[idx].open = 1;
            this.listTab.refresh();
            this.curPanel = idx;
            this.panelArr[idx].onShow();
            if (this.panelArr[idx].parent) {
                this.panelArr[idx].visible = true;
            } else {
                this.boxView.addChild(this.panelArr[idx]);
            }
        }

        /**从广告页打开界面 */
        private showPanel(idx: number) {
            this.boxAd.visible = false;
            this.tabMouse(idx);
            this.listTab.visible = true;
            this.btnClose.skin = "commonBtn/btn_l_y_back.png";
        }

        /**返回广告页 */
        private backToAd() {
            this.listTab.visible = false;
            this.listTab.selectedIndex = -1;
            this.panelArr[this.curPanel].hide();
            this.boxAd.visible = true;
            this.panelName[this.curPanel].open = 0;
            this.listTab.refresh();
            this.curPanel = -1;
            this.btnClose.skin = "commonBtn/btn_l_y_home.png";
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!this.boxAd.visible) this.backToAd();
            else this.destroy();
        }

        /**购买 */
        private buy() {
            clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '点击特惠礼包按钮');
            if (this._model.giftOpen == 0 || this._model.giftOpen.changeTime < clientCore.ServerManager.getWeekUpdataSec()) {
                this.btn_gift.onRedChange(false);
                this._model.giftOpen.value = 1;
                this._model.giftOpen.changeTime = clientCore.ServerManager.curServerTime;
                clientCore.MedalManager.setMedal([{ id: MedalConst.MOONSTORY_GIFT_OPEN, value: 1 }]);
            }
            this._buyPanel.show();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTab.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.btn_gift, Laya.Event.CLICK, this, this.buy);
            BC.addEvent(this, this.btn_ljsy, Laya.Event.CLICK, this, this.showPanel, [0]);
            BC.addEvent(this, this.btn_yyzc, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.btn_gyfh, Laya.Event.CLICK, this, this.showPanel, [2]);
            BC.addEvent(this, this.btn_ssxy, Laya.Event.CLICK, this, this.showPanel, [3]);
            EventManager.on("MOONSTORY_BUY_YHZ", this, this.buy);
            EventManager.on("MOONSTORY_REFRESH_TAB", this, this.refreshTab);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("MOONSTORY_BUY_YHZ", this, this.buy);
            EventManager.off("MOONSTORY_REFRESH_TAB", this, this.refreshTab);
        }

        destroy() {
            super.destroy();
            if (!this.boxAd.visible) this.backToAd();
            this._ljsyPanel?.destroy();
            this._yyzcPanel?.destroy();
            this._gyfhPanel?.destroy();
            this._ssxyPanel?.destroy();
            this._buyPanel?.destroy();
            this.listTab.array = [];
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = this._ljsyPanel = this._yyzcPanel = this._gyfhPanel = this._ssxyPanel = this._buyPanel = null;
            this.panelArr = null;
            this.panelName = null;
        }
    }
}