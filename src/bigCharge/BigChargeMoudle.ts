namespace bigCharge {
    export enum panelType {
        min = 0,
        doubleVipBuy,//直购，两件都是根据花宝等级折扣
        doubleVipOffBuy,//直购，两件都是根据花宝等级折扣，第二件额外优惠
        doubleVipBagBuy,//直购，两件都是根据花宝等级折扣，可以打包
        vipBagBuy,//直购，一件根据花宝打折，一件打包
        bagOffBuy,//直购，多件打折
        draw,//普通抽奖
        pageDraw,//带有角色的抽奖
        rollCard,//翻牌子
        remakeBuy,//套装复刻，直购
        remakeDraw,//套装复刻，抽奖
        freeGift,//累计消费奖励
        coinDraw,//代币抽奖
        shop,//散件商店
        rollOff,//直购，折扣靠抽
        singlePanicBuy,//单套抢购
        rollColection,//单套抽奖，有集齐奖励
        sign,//签到
        max
    }
    export enum rollColetionCharge {
        /**木槌礼包 */
        muchui,
        /**召唤礼包 */
        call,
        /**箜篌礼包 */
        konghou,
        /**扑克礼包 */
        puke,
        /**魔法礼包 */
        mofa,
        /**藤萝礼包 */
        tengluo,
        /**棉糖礼包 */
        miantang,
        /**青羽礼包 */
        qingyu,
        /**树枝礼包 */
        shuzhi,
    }
    /**
     * 大充
     * bigCharge.BigChargeModule
     */
    export class BigChargeModule extends ui.bigCharge.BigChargeModuleUI {
        constructor() {
            super();
        }
        private _first: boolean;
        private _first5: boolean;
        init(data: any) {
            this._data = data;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.rouletteDraw));
            this.addPreLoad(xls.load(xls.rouletteDrawCost));
            this.addPreLoad(xls.load(xls.rouletteDrawReward));
            this.addPreLoad(xls.load(xls.rechargeEvent));
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.SUMMER_CHARGE_SI_OPEN, MedalConst.SUMMER_CHARGE_WU_OPEN]).then((msg: pb.ICommonData[]) => {
                this._first = msg[0].value == 0;
                this._first5 = msg[1].value == 0;
            }));
            this.addPreLoad(this.getEventInfo());
            this.boxView.visible = this.boxTag.visible = false;
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "shen_zhi_ni_nan", open: 0 }, { name: "mian_tang_cha_hui", open: 0 }, { name: "xing_yun_zhuan_pan", open: 0 }, { name: "jue_ban_fu_chu", open: 0 }, { name: "xia_ri_xiao_pu", open: 0 }, { name: "xia_ri_zeng_li", open: 0 }];
        }

        onPreloadOver() {
            this.tagList.repeatY = this.panelName.length;
            this.tagList.array = this.panelName;
            this.panelMap = new util.HashMap();
            this.checkSign();
            if (this._data) {
                this.showPanel(parseInt(this._data));
            }
        }

        popupOver(): void {
            if (this._first) {
                this._first = false;
                clientCore.MedalManager.setMedal([{ id: MedalConst.SUMMER_CHARGE_SI_OPEN, value: 1 }]);
                alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的月之华以及放大镜按照1：1的比例转换为黑玫瑰，快去参加活动吧~');
            }
            if (this._first5) {
                this._first5 = false;
                clientCore.MedalManager.setMedal([{ id: MedalConst.SUMMER_CHARGE_WU_OPEN, value: 1 }]);
                this.goGiftBuy();
            }
        }

        private getEventInfo() {
            return net.sendAndWait(new pb.cs_summer_recharge_active_panel()).then((msg: pb.sc_summer_recharge_active_panel) => {
                BigChargeModel.instance.signDay = msg.signinDays;
                BigChargeModel.instance.costCnt = msg.costNum;
                BigChargeModel.instance.isSign = msg.signFlag;
                BigChargeModel.instance.costAllCnt = msg.totalCostNum;
                BigChargeModel.instance.isSignReward = msg.isGetReward;
            })
        }

        private checkSign() {
            let day = Math.floor((clientCore.ServerManager.curServerTime - util.TimeUtil.formatTimeStrToSec("2021/7/2 00:00:00")) / 86400);
            if (BigChargeModel.instance.signDay <= day && !BigChargeModel.instance.isSign) {
                this.openSignPanel();
            }
        }

        /**页签 */
        private curIdx: number;
        private curPanel: panelType;
        private panelMap: util.HashMap<any>;
        private panelName: { name: string, open: number }[];
        private tabRender(item: ui.bigCharge.render.PanelTagItemUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgCur.visible = data.open == 1;
            item.imgName.skin = `bigCharge/${data.name}${data.open}.png`;
            switch (data.name) {
                default:
                    item.imgRed.visible = false;
            }
        }

        private tabMouse(idx: number) {
            if (idx == this.curIdx) return;
            if (idx < 0) return;
            if (!BigChargeModel.instance.canChangePanel) {
                this.tagList.selectedIndex = -1;
                return;
            }
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
                this.panelName[this.curIdx].open = 0;
                this.curPanel = 0;
            }
            this.panelName[idx].open = 1;
            this.tagList.refresh();
            this.curIdx = idx;
            switch (this.curIdx) {
                case 0:
                    this.addPanel(panelType.vipBagBuy);
                    break;
                case 1:
                    this.addPanel(panelType.rollColection);
                    break;
                case 2:
                    this.addPanel(panelType.rollOff);
                    break;
                case 3:
                    this.addPanel(panelType.remakeDraw);
                    break;
                case 4:
                    this.addPanel(panelType.shop);
                    break;
                case 5:
                    this.addPanel(panelType.freeGift);
                    break;
            }
            this.tagList.selectedIndex = -1;
        }

        private async addPanel(type: panelType) {
            if (!BigChargeModel.instance.canChangePanel) return;
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                switch (type) {
                    case panelType.doubleVipBuy:
                        await this.loadAtlas("DoubleVipBuyPanel");
                        this.panelMap.add(type, new DoubleVipBuyPanel());
                        break;
                    case panelType.coinDraw:
                        await this.loadAtlas("CoinDrawPanel");
                        this.panelMap.add(type, new CoinDrawPanel());
                        break;
                    case panelType.draw:
                        await this.loadAtlas("DrawPanel");
                        this.panelMap.add(type, new DrawPanel());
                        break;
                    case panelType.freeGift:
                        await this.loadAtlas("FreeGiftPanel");
                        this.panelMap.add(type, new FreeGiftPanel());
                        break;
                    case panelType.remakeBuy:
                        await this.loadAtlas("RemakeBuyPanel");
                        this.panelMap.add(type, new RemakeBuyPanel());
                        break;
                    case panelType.remakeDraw:
                        await this.loadAtlas("RemakeDrawPanel");
                        this.panelMap.add(type, new RemakeDrawPanel());
                        break;
                    case panelType.shop:
                        await this.loadAtlas("ShopPanel");
                        this.panelMap.add(type, new ShopPanel());
                        break;
                    case panelType.doubleVipOffBuy:
                        await this.loadAtlas("DoubleVipOffBuyPanel");
                        this.panelMap.add(type, new DoubleVipOffBuyPanel());
                        break;
                    case panelType.rollOff:
                        await this.loadAtlas("RollOffPanel");
                        this.panelMap.add(type, new RollOffPanel());
                        break;
                    case panelType.doubleVipBagBuy:
                        await this.loadAtlas("DoubleVipBagBuyPanel");
                        this.panelMap.add(type, new DoubleVipBagBuyPanel());
                        break;
                    case panelType.singlePanicBuy:
                        await this.loadAtlas("SinglePanicBuyPanel");
                        this.panelMap.add(type, new SinglePanicBuy());
                        break;
                    case panelType.rollColection:
                        await this.loadAtlas("RollColectionPanel");
                        this.panelMap.add(type, new RollColectionPanel());
                        break;
                    case panelType.rollCard:
                        await this.loadAtlas("RollCardPanel");
                        this.panelMap.add(type, new RollCardPanel());
                        break;
                    case panelType.bagOffBuy:
                        await this.loadAtlas("BagOffBuyPanel");
                        this.panelMap.add(type, new BagOffBuyPanel());
                        break;
                    case panelType.pageDraw:
                        await this.loadAtlas("PageDrawPanel");
                        this.panelMap.add(type, new PageDrawPanel());
                        break;
                    case panelType.vipBagBuy:
                        await this.loadAtlas("VipBagBuyPanel");
                        this.panelMap.add(type, new VipBagBuyPanel());
                        break;
                }
            }
            this.panelMap.get(type).show();
            this.boxView.addChild(this.panelMap.get(type));
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/bigCharge/${name}.atlas`, Laya.Loader.ATLAS);
            if (name == "RollOffPanel") {
                await net.sendAndWait(new pb.cs_star_sakura).then((data: pb.sc_star_sakura) => {
                    BigChargeModel.instance.currPrice = data.num;
                    BigChargeModel.instance.refreshTimes = data.times;
                })
            }
            clientCore.LoadingManager.hideSmall(true);
        }

        /**从广告页打开界面 */
        private showPanel(idx: number) {
            this.boxMain.visible = false;
            this.tabMouse(idx);
            this.boxView.visible = this.boxTag.visible = true;
        }

        /**返回广告页 */
        private backToAd() {
            this.boxView.visible = this.boxTag.visible = false;
            this.panelMap.get(this.curPanel).hide();
            this.boxMain.visible = true;
            this.panelName[this.curIdx].open = 0;
            this.tagList.refresh();
            this.curIdx = -1;
            this.curPanel = 0;
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!BigChargeModel.instance.canChangePanel) return;
            if (!this.boxMain.visible) this.backToAd();
            else this.destroy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        /**打开签到面板 */
        private async openSignPanel() {
            let signPanel = this.panelMap.get(panelType.sign);
            if (!signPanel) {
                await this.loadAtlas('SignPanel');
                signPanel = new SignPanel();
                this.panelMap.add(panelType.sign, signPanel);
            }
            clientCore.DialogMgr.ins.open(signPanel);
        }

        /**跳转18元礼包 */
        private goGiftBuy() {
            // clientCore.DialogMgr.ins.closeAllDialog();
            // clientCore.ModuleManager.closeAllOpenModule();
            // clientCore.Logger.sendLog('2021年8月20日活动', '【付费】夏日终曲第八期', '打开面板');
            clientCore.ToolTip.gotoMod(53);
        }

        /**跳转一元购 */
        private goPetBuy() {
            // clientCore.DialogMgr.ins.closeAllDialog();
            // clientCore.ModuleManager.closeAllOpenModule();
            // clientCore.ModuleManager.open("rechargeActivity.RechargeActivityModule", 5);
            clientCore.ToolTip.gotoMod(295);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.btnEvent1, Laya.Event.CLICK, this, this.showPanel, [0]);
            BC.addEvent(this, this.btnEvent2, Laya.Event.CLICK, this, this.showPanel, [1]);
            BC.addEvent(this, this.btnEvent3, Laya.Event.CLICK, this, this.showPanel, [3]);
            BC.addEvent(this, this.btnEvent4, Laya.Event.CLICK, this, this.showPanel, [2]);
            BC.addEvent(this, this.btnSign, Laya.Event.CLICK, this, this.openSignPanel);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.goGiftBuy);
            BC.addEvent(this, this.btn_jump, Laya.Event.CLICK, this, this.goPetBuy);
            EventManager.on("BIGCHARGE_REFRESH_TAB", this, this.refreshTab);
            EventManager.on("BIG_CHARGE_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("BIGCHARGE_REFRESH_TAB", this, this.refreshTab);
            EventManager.off("BIG_CHARGE_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        destroy() {
            super.destroy();
            this.tagList.array = [];
            let panels = this.panelMap.getValues();
            for (let i: number = 0; i < panels.length; i++) {
                panels[i].destroy();
            }
            this.panelMap.clear();
            this.panelMap = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.CManager.unRegSign(this.sign);
            this.panelName = null;
        }
    }
}