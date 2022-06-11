namespace halloweenShop {
    export enum panelType {
        min = 0,
        timeBuy,        //限时购买
        disCountBuy, //折扣购买
        disCountBuyNew, //折扣购买
        disCountDraw, //折扣抽取
        disCountDrawNew, //折扣抽取
        singlePanicBuy, //限时抢购
        turnTableDraw, //转盘
    }
    /**
 * 大充
 * halloweenShop.HalloweenShopModule
 */
    export class HalloweenShopModule extends ui.halloweenShop.HalloweenShopModuleUI {

        /**页签 */
        private curIdx: number = 0;
        private curPanel: panelType;
        private panelMap: util.HashMap<any>;
        private panelName: { name: string, open: number }[];
        private flag: number;

        constructor() {
            super();
        }

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
            // this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.HALLOWEEN_SHOP_OPEN]).then((msg: pb.ICommonData[]) => {
            //     this.flag = msg[0].value;
            // }));
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.giftBtn2.x = clientCore.LayerManager.stageWith - this.giftBtn2.width;
            clientCore.LayerManager.upMainLayer.addChild(this.giftBtn2);
            this.panelName = [{ name: "xian_shi_li_bao", open: 0 }, { name: "tang_chu_gui_mo", open: 0 }, { name: "nan_gua_yue_ding", open: 0 }, { name: "te_bie_zhu_fu", open: 0 }];
        }

        async onPreloadOver() {
            this.panelMap = new util.HashMap();
            this.panelName[0].open = 1;
            this.addPanel(panelType.timeBuy);
            this.tagList.repeatY = this.panelName.length;
            this.tagList.array = this.panelName;
            // if (this.flag == 0) {
            //     clientCore.MedalManager.setMedal([{ id: MedalConst.HALLOWEEN_SHOP_OPEN, value: 1 }]);
            //     alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的手提灯按照1：1的比例转换为银杏叶，快去参加活动吧~');
            // }
        }

        private tabRender(item: ui.halloweenShop.render.PanelTagItemUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgCur.visible = data.open == 1;
            item.imgTemp.visible = data.open == 0;
            item.imgName.skin = `halloweenShop/${data.name}${data.open}.png`;
        }

        private tabMouse(idx: number) {
            if (idx == this.curIdx) return;
            if (idx < 0) return;
            if (!HalloweenShopModel.instance.canChangePanel) {
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
                    this.addPanel(panelType.timeBuy);
                    break;
                case 1:
                    this.addPanel(panelType.disCountBuyNew);
                    break;
                case 2:
                    this.addPanel(panelType.disCountDrawNew);
                    break;
                case 3:
                    this.addPanel(panelType.turnTableDraw);
                    break;
            }
            this.tagList.selectedIndex = -1;
        }

        private async addPanel(type: panelType) {
            if (!HalloweenShopModel.instance.canChangePanel) return;
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                switch (type) {
                    case panelType.timeBuy:
                        await this.loadAtlas("TimeBuyPanel");
                        this.panelMap.add(type, new TimeBuyPanel());
                        break;
                    case panelType.disCountBuy:
                        await this.loadAtlas("DisCountBuyPanel");
                        this.panelMap.add(type, new DisCountBuyPanel());
                        break;
                    case panelType.disCountBuyNew:
                        await this.loadAtlas("DisCountBuyNewPanel");
                        this.panelMap.add(type, new DisCountBuyNewPanel());
                        break;
                    case panelType.disCountDraw:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel());
                        break;
                    case panelType.disCountDrawNew:
                        await this.loadAtlas("DisCountDrawNewPanel");
                        this.panelMap.add(type, new DisCountDrawNewPanel());
                        break;
                    case panelType.singlePanicBuy:
                        await this.loadAtlas("SinglePanicBuyPanel");
                        this.panelMap.add(type, new SinglePanicBuyPanel());
                        break;
                    case panelType.turnTableDraw:
                        await this.loadAtlas("TurnTableDrawPanel");
                        this.panelMap.add(type, new TurnTableDrawPanel());
                        break;
                }
            }
            this.panelMap.get(type).show();
            this.boxView.addChild(this.panelMap.get(type));
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/halloweenShop/${name}.atlas`, Laya.Loader.ATLAS);
            clientCore.LoadingManager.hideSmall(true);
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!HalloweenShopModel.instance.canChangePanel) return;
            this.destroy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        private async onGiftOpen() {
            HalloweenShopModel.instance.coinNotEnough();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.giftBtn2, Laya.Event.CLICK, this, this.onGiftOpen);
            EventManager.on("HalloweenShop_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("HalloweenShop_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        destroy() {
            super.destroy();
            clientCore.LayerManager.upMainLayer.removeChild(this.giftBtn2);
            this.tagList.array = [];
            let panels = this.panelMap.getValues();
            for (let i: number = 0; i < panels.length; i++) {
                panels[i].destroy();
            }
            this.panelMap.clear();
            this.panelMap = null;
            clientCore.UIManager.releaseCoinBox();
            this.panelName = null;
        }
    }
}