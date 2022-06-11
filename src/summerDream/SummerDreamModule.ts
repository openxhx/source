namespace summerDream {
    /**
     * 2021.4.30
     * 夏夜如梦
     * summerDream.SummerDreamModule
     */
    export class SummerDreamModule extends ui.summerDream.SummerDreamModuleUI {
        private _model: SummerDreamModel;
        private _control: SummerDreamControl;

        private _actBuyPanel: ActBuy1Panel;
        private _actSixPanel: ActSixBuyPanel;
        private _actShopPanel: ActShopPanel;
        private _actGiftPanel: ActGiftPanel;
        private _actRollPanel: ActRoll1Panel;
        private _actLimitPanel: ActLimitPanel;

        private _first: boolean;
        init() {
            this.sign = clientCore.CManager.regSign(new SummerDreamModel(), new SummerDreamControl());
            this._model = clientCore.CManager.getModel(this.sign) as SummerDreamModel;
            this._control = clientCore.CManager.getControl(this.sign) as SummerDreamControl;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.rechargeEvent));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.rouletteDraw));
            this.addPreLoad(xls.load(xls.rouletteDrawReward));
            this.addPreLoad(xls.load(xls.rouletteDrawCost));
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.SUMMER_DREAM_OPEN]).then((msg: pb.ICommonData[]) => {
                this._first = msg[0].value == 0;
            }));
            this.listTab.visible = false;
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.tabRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "fu_sheng_ruo_meng", open: 0 }, { name: "xing_yu_xin_yuan", open: 0 }, { name: "chu_ju_hua_yu", open: 0 }, { name: "six_buy", open: 0 }, { name: "xia_ri_qing_ning", open: 0 }, { name: "xiu_xian_yi_xia", open: 0 }];
            this.listTab.repeatX = this.panelName.length;
            this.listTab.array = this.panelName;
        }

        onPreloadOver() {
            this._actBuyPanel = new ActBuy1Panel();
            this._actLimitPanel = new ActLimitPanel();
            this._actSixPanel = new ActSixBuyPanel();
            this._actShopPanel = new ActShopPanel();
            this._actGiftPanel = new ActGiftPanel(this.sign);
            this._actRollPanel = new ActRoll1Panel(this.sign);
            this.panelArr = [this._actBuyPanel, this._actRollPanel, this._actLimitPanel, this._actSixPanel, this._actShopPanel, this._actGiftPanel];
        }

        popupOver(): void {
            if (this._first) {
                this._first = false;
                clientCore.MedalManager.setMedal([{ id: MedalConst.SUMMER_DREAM_OPEN, value: 1 }]);
                alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的诗句按照1：1的比例转换为星之语，快去集齐最新的“星语心愿”套装吧~');
            }
        }
        ///////页签
        private curPanel: number = -1;
        private panelName: { name: string, open: number }[];
        private panelArr: any[];
        private tabRender(item: ui.summerDream.item.ActPanelTabUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgDi.skin = data.open == 1 ? "summerDream/xuan_zhong_xiao_guo.png" : "summerDream/wei_xuan_zhong_xiao_guo.png";
            item.imgName.skin = `summerDream/${data.name}${data.open}.png`;
            item.imgNew.visible = [0, 1, 3].includes(index);
            switch (index) {
                case 5:
                    item.imgRed.visible = util.RedPoint.checkShow([26201]);
                    break;
                default:
                    item.imgRed.visible = false;
            }
        }
        private tabMouse(idx: number) {
            if (this._model.lockPanel) return;
            if (idx < 0) return;
            if (this.curPanel == idx) return;
            this.listTab.selectedIndex = -1;
            if (this.curPanel >= 0) {
                this.panelArr[this.curPanel].hide();
                this.panelName[this.curPanel].open = 0;
            }
            this.panelName[idx].open = 1;
            this.listTab.refresh();
            this.curPanel = idx;
            if (!this.panelArr[idx].parent) {
                this.panelPoint.addChild(this.panelArr[idx]);
            }
            this.panelArr[idx].show();
        }
        //////////////////////////////

        /**
         * 打开活动
         */
        private openActivity(idx: number) {
            this.tabMouse(idx);
            this.listTab.visible = true;
        }

        /**返回广告页 */
        private backToAd() {
            this.listTab.visible = false;
            this.listTab.selectedIndex = -1;
            this.panelName[this.curPanel].open = 0;
            this.listTab.refresh();
            this.curPanel = -1;
        }

        /**
         * 跳转异域王座
         */
        private jump() {
            this.destroy();
            clientCore.ModuleManager.open("rechargeActivity.RechargeActivityModule", 5);
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTab.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.jump);
            BC.addEvent(this, this.btnActBuy, Laya.Event.CLICK, this, this.openActivity, [0]);
            BC.addEvent(this, this.btnActSix, Laya.Event.CLICK, this, this.openActivity, [3]);
            BC.addEvent(this, this.btnActGift, Laya.Event.CLICK, this, this.openActivity, [5]);
            BC.addEvent(this, this.btnActLimit, Laya.Event.CLICK, this, this.openActivity, [2]);
            BC.addEvent(this, this.btnActShop, Laya.Event.CLICK, this, this.openActivity, [4]);
            BC.addEvent(this, this.btnActRool, Laya.Event.CLICK, this, this.openActivity, [1]);
            EventManager.on("SUMMER_DREAM_CLOSE_ACTIVITY", this, this.backToAd);
            EventManager.on("SUMMER_DREAM_REFRESH_TAB", this, this.refreshTab);
            EventManager.on('SUMMER_DREAM_OPEN_PANEL', this, this.tabMouse);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("SUMMER_DREAM_CLOSE_ACTIVITY", this, this.backToAd);
            EventManager.off("SUMMER_DREAM_REFRESH_TAB", this, this.refreshTab);
            EventManager.off('SUMMER_DREAM_OPEN_PANEL', this, this.tabMouse);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this._actBuyPanel?.destroy();
            this._actLimitPanel?.destroy();
            this._actSixPanel?.destroy();
            this._actGiftPanel?.destroy();
            this._actShopPanel?.destroy();
            this._actRollPanel?.destroy();
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
    }
}