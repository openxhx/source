namespace ginkgoOath {
    enum tabType {
        xyhl = 0,
        qycg,
        mxzg,
        yxhz,
        hcqt
    }
    export class GinkgoOathModule extends ui.ginkgoOath.GinkgoOathModuleUI {
        private _model: GinkgoOathModel;
        private _control: GinkgoOathControl;

        private _xyhlPanel: GinkgoOathXyhlPanel;
        private _qycgPanel: GinkgoOathQycgPanel;
        private _mxzgPanel: GinkgoOathMxzgPanel;
        private _yxhzPanel: GinkgoOathYxhzPanel;
        private _hcqtPanel: GinkgoOathHcqtPanel;
        private _buyPanel: GinkgoOathBuyPanel;

        private ani: clientCore.Bone;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new GinkgoOathModel(), new GinkgoOathControl());
            this._model = clientCore.CManager.getModel(this.sign) as GinkgoOathModel;
            this._control = clientCore.CManager.getControl(this.sign) as GinkgoOathControl;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.giftSell));
            this.addPreLoad(xls.load(xls.godTreeCounter));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.medalChallenge));
            this.addPreLoad(xls.load(xls.rechargeToday));
            this.addPreLoad(xls.load(xls.itemCallback));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(this.getDrawInfo());
            this.addPreLoad(this._model.getBuyMedal());
            this.listTab.visible = false;
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.tabRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "tab_xyhl", open: 0, scale: 1 }, { name: "tab_qycg", open: 0, scale: -1 }, { name: "tab_mxzg", open: 0, scale: 1 }, { name: "tab_yxhz", open: 0, scale: -1 }, { name: "tab_hcqt", open: 0, scale: 1 }];
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年11月6日活动', '【付费】淘乐节·银杏誓约', '打开活动面板');
            this._xyhlPanel = new GinkgoOathXyhlPanel();
            this._qycgPanel = new GinkgoOathQycgPanel(this.sign);
            this._mxzgPanel = new GinkgoOathMxzgPanel(this.sign);
            this._yxhzPanel = new GinkgoOathYxhzPanel(this.sign);
            this._hcqtPanel = new GinkgoOathHcqtPanel();
            this._buyPanel = new GinkgoOathBuyPanel(this.sign);
            this.panelArr = [this._xyhlPanel, this._qycgPanel, this._mxzgPanel, this._yxhzPanel, this._hcqtPanel];
            this.listTab.array = this.panelName;
            this.img_xyhl.skin = `unpack/ginkgoOath/img_xyhl_${clientCore.LocalInfo.sex}.png`;
            this.img_qycg.skin = `unpack/ginkgoOath/img_qycg_${clientCore.LocalInfo.sex}.png`;
            this.img_yxhz.skin = `unpack/ginkgoOath/img_yxhz_${clientCore.LocalInfo.sex}.png`;
            this.ani = clientCore.BoneMgr.ins.play("res/animate/ginkgoOath/gingko leaf.sk", "animation", true, this.box_ani);
            this.ani.pos(667, 750);
            this.red_gift.visible = this._model.giftOpen == 0;
            this.showPanel(4);
        }

        popupOver() {
            this.checkOldCoin();
        }

        async getEventInfo() {
            let msg = await this._control.getInfo();
            this._model.activeValue = msg.activeValue;
            this._model.activeRewardStatus = msg.activeValueStatus;
            this._model.activeVIPRewardStatus = msg.extraReward;
            // this._model.adBuyStatus = msg.isBuyFlag;
            this._model.costRewardStatus = msg.costStatus;
        }

        async getDrawInfo() {
            let msg = await this._control.getDrawInfo();
            this._model.drawCount = msg.totalTimes;
            this._model.drawCountRewardStatus = msg.totalTimesRewardStatus;
        }

        private checkOldCoin() {
            if (clientCore.ItemsInfo.getItemNum(1511010) > 0 || clientCore.ItemsInfo.getItemNum(1511011) > 0) {
                new GinkgoOathReplacePanel().show();
            }
        }

        /**页签 */
        private curPanel: number = -1;
        private panelName: { name: string, open: number, scale: number }[];
        private panelArr: any[];
        private tabRender(item: ui.ginkgoOath.render.PanelTagItemUI, index: number) {
            let data: { name: string, open: number, scale: number } = item.dataSource;
            item.imgBg.skin = data.open == 1 ? "ginkgoOath/tag_1.png" : "ginkgoOath/tag_0.png";
            item.imgBg.scaleX = data.scale;
            item.imgName.skin = `ginkgoOath/${data.name}.png`;
            switch (index) {
                case tabType.yxhz:
                    item.imgRed.visible = util.RedPoint.checkShow([19302]);
                    break;
                case tabType.qycg:
                    item.imgRed.visible = util.RedPoint.checkShow([19303]);
                    break;
                case tabType.xyhl:
                    item.imgRed.visible = util.RedPoint.checkShow([19304]);
                    break;
                case tabType.hcqt:
                    item.imgRed.visible = util.RedPoint.checkShow([19305]);
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
                this.box_panel.addChild(this.panelArr[idx]);
            }
        }

        /**从广告页打开界面 */
        private showPanel(idx: number) {
            this.box_main.visible = false;
            this.box_panel.visible = true;
            this.tabMouse(idx);
            this.listTab.visible = true;
            this.btnClose.skin = "commonBtn/btn_l_y_back.png";
        }

        /**返回广告页 */
        private backToAd() {
            this.listTab.visible = false;
            this.listTab.selectedIndex = -1;
            this.panelArr[this.curPanel].hide();
            this.box_main.visible = true;
            this.box_panel.visible = false;
            this.panelName[this.curPanel].open = 0;
            this.listTab.refresh();
            this.curPanel = -1;
            this.btnClose.skin = "commonBtn/btn_l_y_home.png";
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!this.box_main.visible) this.backToAd();
            else this.destroy();
        }

        /**购买 */
        private async buy() {
            clientCore.Logger.sendLog('2020年11月6日活动', '【付费】淘乐节·银杏誓约', '点击特惠礼包按钮');
            this._buyPanel.show();
            clientCore.DialogMgr.ins.open(this._buyPanel);
            if (this._model.giftOpen == 0) {
                this.red_gift.visible = false;
                this._model.giftOpen = 1;
                await clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GINKGOOATH_DAILY_ALL_GIFT, value: 1 }]);
                clientCore.UIManager.refreshMoney();
                EventManager.event(globalEvent.SPECIAL_DAILY_MEDAL, MedalDailyConst.GINKGOOATH_DAILY_ALL_GIFT);
            }
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTab.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.btn_gift, Laya.Event.CLICK, this, this.buy);
            BC.addEvent(this, this.btn_xyhl, Laya.Event.CLICK, this, this.showPanel, [0]);
            BC.addEvent(this, this.btn_qycg, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.btn_mxzg, Laya.Event.CLICK, this, this.showPanel, [2]);
            BC.addEvent(this, this.btn_yxhz, Laya.Event.CLICK, this, this.showPanel, [3]);
            BC.addEvent(this, this.btn_hcqt, Laya.Event.CLICK, this, this.showPanel, [4]);
            BC.addEvent(this, this.kuang_xyhl, Laya.Event.CLICK, this, this.showPanel, [0]);
            BC.addEvent(this, this.kuang_qycg, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.kuang_mxzg, Laya.Event.CLICK, this, this.showPanel, [2]);
            BC.addEvent(this, this.kuang_yxhz, Laya.Event.CLICK, this, this.showPanel, [3]);
            EventManager.on("GINKGOOATH_REFRESH_TAB", this, this.refreshTab);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("GINKGOOATH_REFRESH_TAB", this, this.refreshTab);
        }

        destroy() {
            super.destroy();
            if (!this.box_main.visible) this.backToAd();
            this._buyPanel?.destroy();
            this._xyhlPanel?.destroy();
            this._qycgPanel?.destroy();
            this._mxzgPanel?.destroy();
            this._yxhzPanel?.destroy();
            this._hcqtPanel?.destroy();
            this.ani?.dispose();
            this.listTab.array = [];
            clientCore.CManager.unRegSign(this.sign);
            this._hcqtPanel = this.ani = this._model = this._control = this._yxhzPanel = this._xyhlPanel = this._qycgPanel = this._mxzgPanel = this._buyPanel = null;
            this.panelArr = null;
            this.panelName = null;
        }
    }
}