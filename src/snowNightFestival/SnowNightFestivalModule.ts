namespace snowNightFestival {
    enum tabType {
        xnyj = 0,
        slcc,
        jxhx,
        fyzc,
        xyzj,
        yymd
    }
    /**
     * snowNightFestival.SnowNightFestivalModule
     * 2020.12.18
     * 雪夜梦幻祭
     */
    export class SnowNightFestivalModule extends ui.snowNightFestival.SnowNightFestivalModuleUI {
        private _model: SnowNightFestivalModel;
        private _control: SnowNightFestivalControl;

        private _fyzcPanel: NightFesFyzcPanel;
        private _JxhxPanel: NightFesJxhxPanel;
        private _slccPanel: NightFesSlccPanel;
        private _xyzjPanel: NightFesXyzjPanel;
        private _yymdPanel: NightFesYymdPanel;
        private _xnyjPanel: NightFesXnyjPanel;

        private ani: clientCore.Bone;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new SnowNightFestivalModel(), new SnowNightFestivalControl());
            this._model = clientCore.CManager.getModel(this.sign) as SnowNightFestivalModel;
            this._control = clientCore.CManager.getControl(this.sign) as SnowNightFestivalControl;
            this._control._model = this._model;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.giftSell));
            this.addPreLoad(xls.load(xls.godTreeCounter));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.medalChallenge));
            this.addPreLoad(xls.load(xls.rechargeToday));
            this.addPreLoad(xls.load(xls.itemCallback));
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.rechargeShopOffical));
            this.addPreLoad(xls.load(xls.rouletteDraw));
            this.addPreLoad(xls.load(xls.rouletteDrawReward));
            this.addPreLoad(xls.load(xls.rouletteDrawCost));
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(this.getEventInfo());
            // this.addPreLoad(this._model.getBuyMedal());
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.tabRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "tab_xnyj", open: 0 }, { name: "tab_slcc", open: 0 }, { name: "tab_jxhx", open: 0 }, { name: "tab_fyzc", open: 0 }, { name: "tab_xyzj", open: 0 }, { name: "tab_yymd", open: 0 }];
            this.boxPanel.visible = false;
            let sex = clientCore.LocalInfo.sex;
            this.img_fyzc.skin = `snowNightFestival/img_fyzc_${sex}.png`;
            this.img_slcc.skin = `snowNightFestival/img_slcc_${sex}.png`;
            this.img_yymd.skin = `snowNightFestival/img_yymd_${sex}.png`;
            this.img_xyzj.skin = `snowNightFestival/img_xyzj_${sex}.png`;
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年12月31日活动', '【付费】雪夜梦幻祭', '打开活动面板');
            this._fyzcPanel = new NightFesFyzcPanel(this.sign);
            this._JxhxPanel = new NightFesJxhxPanel(this.sign);
            this._slccPanel = new NightFesSlccPanel();
            this._xyzjPanel = new NightFesXyzjPanel(this.sign);
            this._yymdPanel = new NightFesYymdPanel();
            this._xnyjPanel = new NightFesXnyjPanel();
            // this._buyPanel = new GinkgoOathBuyPanel(this.sign);
            this.panelArr = [this._xnyjPanel, this._slccPanel, this._JxhxPanel, this._fyzcPanel, this._xyzjPanel, this._yymdPanel];
            this.listTab.array = this.panelName;
            // this.ani = clientCore.BoneMgr.ins.play("res/animate/snowNightFestival/gingko leaf.sk", "animation", true, this.box_ani);
            // this.ani.pos(667, 750);
            // this.red_gift.visible = this._model.giftOpen == 0;
            // this.showPanel(4);
        }

        popupOver() {
        }

        async getEventInfo() {
            // let msg = await this._control.getInfo();
            // this._model.activeValue = msg.activeValue;
            // this._model.activeRewardStatus = msg.activeValueStatus;
            // this._model.activeVIPRewardStatus = msg.extraReward;
            // this._model.adBuyStatus = msg.isBuyFlag;
            // this._model.costRewardStatus = msg.costStatus;
        }

        /**页签 */
        private curPanel: number = -1;
        private panelName: { name: string, open: number }[];
        private panelArr: any[];
        private tabRender(item: ui.snowNightFestival.render.PanelTagItemUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgSelect.visible = data.open == 1;
            item.imgName.skin = `snowNightFestival/${data.name}.png`;
            switch (index) {
                case tabType.yymd:
                    item.imgRed.visible = util.RedPoint.checkShow([21301, 21302]);
                    break;
                case tabType.slcc:
                    item.imgRed.visible = util.RedPoint.checkShow([21303, 21306]);
                    break;
                case tabType.xyzj:
                    item.imgRed.visible = util.RedPoint.checkShow([21304, 21307]);
                    break;
                case tabType.fyzc:
                    item.imgRed.visible = util.RedPoint.checkShow([21305, 21308]);
                    break;
                default:
                    item.imgRed.visible = false;
            }
        }
        private tabMouse(idx: number) {
            if (idx < 0) return;
            if (this._model.disPanelChange) {
                this.listTab.selectedIndex = -1;
                return;
            }
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
                this.boxPanel.addChild(this.panelArr[idx]);
                this.panelArr[idx].x = 220;
            }
        }

        /**从广告页打开界面 */
        private showPanel(idx: number) {
            this.box_main.visible = false;
            this.boxPanel.visible = true;
            this.tabMouse(idx);
            this.btnClose.skin = "commonBtn/btn_l_y_back.png";
        }

        /**返回广告页 */
        private backToAd() {
            this.listTab.selectedIndex = -1;
            this.panelArr[this.curPanel].hide();
            this.box_main.visible = true;
            this.boxPanel.visible = false;
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

        /**更新tab状态 */
        private refreshTab() {
            this.listTab.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.img_fyzc, Laya.Event.CLICK, this, this.showPanel, [3]);
            BC.addEvent(this, this.img_jxhx, Laya.Event.CLICK, this, this.showPanel, [2]);
            BC.addEvent(this, this.img_slcc, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.img_xyzj, Laya.Event.CLICK, this, this.showPanel, [4]);
            BC.addEvent(this, this.img_yymd, Laya.Event.CLICK, this, this.showPanel, [5]);
            BC.addEvent(this, this.img_xnyj, Laya.Event.CLICK, this, this.showPanel, [0]);
            BC.addEvent(this, this.btn_fyzc, Laya.Event.CLICK, this, this.showPanel, [3]);
            BC.addEvent(this, this.btn_jxhx, Laya.Event.CLICK, this, this.showPanel, [2]);
            BC.addEvent(this, this.btn_slcc, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.btn_xyzj, Laya.Event.CLICK, this, this.showPanel, [4]);
            BC.addEvent(this, this.btn_yymd, Laya.Event.CLICK, this, this.showPanel, [5]);
            BC.addEvent(this, this.btn_xnyj, Laya.Event.CLICK, this, this.showPanel, [0]);
            EventManager.on("NIGHTFES_REFRESH_TAB", this, this.refreshTab);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("NIGHTFES_REFRESH_TAB", this, this.refreshTab);
        }

        destroy() {
            super.destroy();
            if (!this.box_main.visible) this.backToAd();
            // this._buyPanel?.destroy();
            this._fyzcPanel?.destroy();
            this._JxhxPanel?.destroy();
            this._slccPanel?.destroy();
            this._xyzjPanel?.destroy();
            this._yymdPanel?.destroy();
            this.ani?.dispose();
            this.listTab.array = [];
            clientCore.CManager.unRegSign(this.sign);
            this._yymdPanel = this.ani = this._model = this._control = this._xyzjPanel = this._fyzcPanel = this._JxhxPanel = this._slccPanel = null;
            this.panelArr = null;
            this.panelName = null;
        }
    }
}