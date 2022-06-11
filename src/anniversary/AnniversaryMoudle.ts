namespace anniversary {
    enum tabType {
        sqzy = 0,
        hkjd,
        hyzc,
        hzly,
        mtfh
    }
    /**
     * 花恋流年
     * anniversary.AnniversaryModule
     */
    export class AnniversaryModule extends ui.anniversary.AnniversaryModuleUI {
        private _model: AnniversaryModel;
        private _control: AnniversaryControl;

        private _hkjdPanel: AnniversaryHkjdPanel;
        private _hzlyPanel: AnniversaryHzlyPanel;
        private _mtfhPanel: AnniversaryMtfhPanel;
        private _sqzyPanel: AnniversarySqzyPanel;
        private _xyzcPanel: AnniversaryXyzcPanel;
        private _buyPanel: ADBuyPanel;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new AnniversaryModel(), new AnniversaryControl());
            this._model = clientCore.CManager.getModel(this.sign) as AnniversaryModel;
            this._control = clientCore.CManager.getControl(this.sign) as AnniversaryControl;
            this._control.listenCode();
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
            this.panelName = [{ name: "神祈之佑", open: 0 }, { name: "花开几度", open: 0 }, { name: "许愿之池", open: 0 }, { name: "花之恋语", open: 0 }, { name: "满庭芳华", open: 0 }];
            if (clientCore.LocalInfo.sex == 1) {
                this.imgFemaleAd.visible = true;
                this.imgMaleAd.visible = false;
                this.btnMtfh.skin = "unpack/anniversary/满庭芳华女.png";
                this.btnHkjd.skin = "unpack/anniversary/花开几度女.png";
            } else {
                this.imgFemaleAd.visible = false;
                this.imgMaleAd.visible = true;
                this.btnMtfh.skin = "unpack/anniversary/满庭芳华男.png";
                this.btnHkjd.skin = "unpack/anniversary/花开几度男.png";
            }
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '打开主面板');
            // this.imgNewHua.visible = this._model.hkjdOpen == 0;
            // this.imgNewChi.visible = this.redHyzc.visible = this._model.xyzcOpen == 0;
            this.redHyzc.visible = this._model.xyzcOpen == 0;
            // this.imgNewHzly.visible = this._model.hzlyOpen == 0;
            this._hkjdPanel = new AnniversaryHkjdPanel(this.sign);
            this._hzlyPanel = new AnniversaryHzlyPanel(this.sign);
            this._mtfhPanel = new AnniversaryMtfhPanel(this.sign);
            this._sqzyPanel = new AnniversarySqzyPanel(this.sign);
            this._xyzcPanel = new AnniversaryXyzcPanel(this.sign);
            this._buyPanel = new ADBuyPanel(this.sign);
            this.panelArr = [this._sqzyPanel, this._hkjdPanel, this._xyzcPanel, this._hzlyPanel, this._mtfhPanel];
            this.listTab.array = this.panelName;
        }

        async getEventInfo() {
            let msg = await this._control.getInfo();
            this._model.activeValue = msg.activeValue;
            this._model.activeRewardStatus = msg.activeValueStatus;
            this._model.activeVIPRewardStatus = msg.extraReward;
            this._model.totalCost = msg.costCnt;
            this._model.costRewardStatus = msg.costStatus;
            this._model.code = msg.magicPasswd;
            this._model.adBuyStatus = msg.isBuyFlag;
            await util.RedPoint.reqRedPointRefresh(11805);
        }

        async getDrawInfo() {
            let msg = await this._control.getDrawInfo();
            this._model.drawCount = msg.totalTimes;
            this._model.drawCountRewardStatus = msg.totalTimesRewardStatus;
        }

        /**页签 */
        private curPanel: number = -1;
        private panelName: { name: string, open: number }[];
        private panelArr: any[];
        private tabRender(item: ui.anniversary.render.PanelTabItemUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgBg.skin = data.open == 1 ? "anniversary/选中页签.png" : "anniversary/未选择页签 .png";
            item.imgName.skin = `anniversary/${data.name}${data.open}.png`;
            switch (index) {
                case tabType.mtfh:
                    item.imgRed.visible = util.RedPoint.checkShow([11802]);
                    break;
                case tabType.hzly:
                    item.imgRed.visible = util.RedPoint.checkShow([11803, 11804, 10806]);
                    break;
                case tabType.hyzc:
                    item.imgRed.visible = this._model.xyzcOpen == 0;
                    break;
                case tabType.hkjd:
                    item.imgRed.visible = util.RedPoint.checkShow([9903]);
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
            if (idx == tabType.hyzc && this._model.xyzcOpen == 0) {
                this._model.xyzcOpen = 1;
                this.redHyzc.visible = false;
                clientCore.MedalManager.setMedal([{ id: MedalConst.ANNIVERSARY_OPEN_XYZC_2, value: 1 }]);
            }
            // if (idx == tabType.hkjd && this._model.hkjdOpen == 0) {
            //     this._model.hkjdOpen = 1;
            //     this.imgNewHua.visible = false;
            //     clientCore.MedalManager.setMedal([{ id: MedalConst.ANNIVERSARY_OPEN_HKJD_2, value: 1 }]);
            // }
            // if (idx == tabType.hzly && this._model.hzlyOpen == 0) {
            //     this._model.hzlyOpen = 1;
            //     this.imgNewHzly.visible = false;
            //     clientCore.MedalManager.setMedal([{ id: MedalConst.ANNIVERSARY_OPEN_HZLY_2, value: 1 }]);
            // }
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
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!this.boxAd.visible) this.backToAd();
            else this.destroy();
        }

        /**购买 */
        private buy() {
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '点击特惠礼包按钮');
            this._buyPanel.show();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTab.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.btnGigt, Laya.Event.CLICK, this, this.buy);
            BC.addEvent(this, this.btnHkjd, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.btnSqzy, Laya.Event.CLICK, this, this.showPanel, [0]);
            BC.addEvent(this, this.btnMtfh, Laya.Event.CLICK, this, this.showPanel, [4]);
            BC.addEvent(this, this.btnHzly, Laya.Event.CLICK, this, this.showPanel, [3]);
            BC.addEvent(this, this.btnXyzc, Laya.Event.CLICK, this, this.showPanel, [2]);
            EventManager.on("ANNIVERSARY_BUY_MONEY", this, this.buy);
            EventManager.on("ANNIVERSARY_REFRESH_TAB", this, this.refreshTab);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("ANNIVERSARY_BUY_MONEY", this, this.buy);
            EventManager.off("ANNIVERSARY_REFRESH_TAB", this, this.refreshTab);
        }

        destroy() {
            super.destroy();
            if (!this.boxAd.visible) this.backToAd();
            this._sqzyPanel?.destroy();
            this._hkjdPanel?.destroy();
            this._xyzcPanel?.destroy();
            this._mtfhPanel?.destroy();
            this._hzlyPanel?.destroy();
            this._control.cancleListenCode();
            this.listTab.array = [];
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = this._sqzyPanel = this._hkjdPanel = this._xyzcPanel = this._hzlyPanel = this._mtfhPanel = null;
            this.panelArr = null;
            this.panelName = null;
        }
    }
}