namespace snowSeason {
    export enum panelType {
        min = 0,
        timeBuy,  //限时购买
        disCountDraw, //折扣抽取
        disCountDrawNew,
        pieceBuy,    //碎片购买
        pieceBuyNew,
        rollCard,     //抽卡
        disCountBuy,
        disCountBuyNew,
        doubleVipBuy,
        turnTableDraw,
        turnTableDrawNew,
        turnTableDrawNew2,
        singlePanicBuy,//限时抢购
        remakeBuy, //雪花小铺
        specialBuy
    }
    /**
 * 大充
 * snowSeason.SnowSeasonModule
 */
    export class SnowSeasonModule extends ui.snowSeason.SnowSeasonModuleUI {

        /**页签 */
        private curIdx: number = -1;
        private curPanel: panelType;
        private panelMap: util.HashMap<any>;
        private panelName: { name: string, open: number }[];
        private recylePanel: CoinRecylePanel;
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
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.SNOW_SEASON_OPEN_NEW]).then((msg: pb.ICommonData[]) => {
                this.flag = msg[0].value;
            }));
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "dong_ri_te_hui", open: 0 }, { name: "ying_guang_yao_yan", open: 0 }, { name: "te_mai_hui", open: 0 }, { name: "sui_qiong_luan_yu", open: 0 }, { name: "xue_hua_xiao_pu", open: 0 }];
        }

        async onPreloadOver() {
            this.panelMap = new util.HashMap();
            // this.panelName[1].open = 1;
            // this.curIdx = 1;
            // this.addPanel(panelType.rollCard);
            this.tabMouse(1);
            this.tagList.repeatY = this.panelName.length;
            this.tagList.array = this.panelName;
            if (this.flag == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalConst.SNOW_SEASON_OPEN, value: 1 }]);
                await res.load(`atlas/snowSeason/CoinRecylePanel.atlas`, Laya.Loader.ATLAS);
                this.recylePanel = new CoinRecylePanel();
                this.recylePanel.setData(clientCore.ItemsInfo.getItemNum(SnowSeasonModel.instance.coinid));
                clientCore.DialogMgr.ins.open(this.recylePanel);
            }
            if (this.flag == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalConst.SNOW_SEASON_OPEN_NEW, value: 1 }]);
                alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的梦的蝴蝶和浪花按照1：1的比例转换为圣诞铃铛，快去参加活动吧~');
            }
        }

        private tabRender(item: ui.yearSong.render.PanelTagItemUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgCur.visible = data.open == 1;
            item.imgName.skin = `snowSeason/${data.name}.png`;
        }

        private tabMouse(idx: number) {
            if (idx == this.curIdx) return;
            if (idx < 0) return;
            if (!SnowSeasonModel.instance.canChangePanel) {
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
                    this.addPanel(panelType.specialBuy);
                    break;
                case 1:
                    this.addPanel(panelType.disCountDrawNew);
                    break;
                case 2:
                    this.addPanel(panelType.singlePanicBuy);
                    break;
                case 3:
                    this.addPanel(panelType.pieceBuyNew);
                    break;
                case 4:
                    this.addPanel(panelType.remakeBuy);
                    break;
            }
            this.tagList.selectedIndex = -1;
        }

        private async addPanel(type: panelType) {
            if (!SnowSeasonModel.instance.canChangePanel) return;
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
                    case panelType.disCountDraw:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel());
                        break;
                    case panelType.disCountDrawNew:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawNewPanel());
                        break;
                    case panelType.pieceBuy:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuyPanel());
                        break;
                    case panelType.pieceBuyNew:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuyNewPanel());
                        break;
                    case panelType.turnTableDraw:
                        await this.loadAtlas("TurnTableDrawPanel");
                        this.panelMap.add(type, new TurnTableDrawPanel());
                        break;
                    case panelType.turnTableDrawNew2:
                        await this.loadAtlas("TurnTableDrawPanel");
                        this.panelMap.add(type, new TurnTableDrawNew2Panel());
                        break;
                    case panelType.turnTableDrawNew:
                        await this.loadAtlas("TurnTableDrawPanel");
                        this.panelMap.add(type, new TurnTableDrawNewPanel());
                        break;
                    case panelType.rollCard:
                        await this.loadAtlas("RollCardPanel");
                        this.panelMap.add(type, new RollCardPanel());
                        break;
                    case panelType.remakeBuy:
                        await this.loadAtlas("RemakeBuyPanel");
                        this.panelMap.add(type, new RemakeBuyPanel());
                        break;
                    case panelType.singlePanicBuy:
                        await this.loadAtlas("SinglePanicBuyPanel");
                        this.panelMap.add(type, new SinglePanicBuy());
                        break;
                    case panelType.specialBuy:
                        await this.loadAtlas("WinterSpecial");
                        this.panelMap.add(type, new SpecialBuyPanel());
                        break;
                }
            }
            this.panelMap.get(type).show();
            this.boxView.addChild(this.panelMap.get(type));
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/snowSeason/${name}.atlas`, Laya.Loader.ATLAS);
            clientCore.LoadingManager.hideSmall(true);
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!SnowSeasonModel.instance.canChangePanel) return;
            this.destroy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        private async onGiftOpen() {
            SnowSeasonModel.instance.coinNotEnough();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.giftBtn2, Laya.Event.CLICK, this, this.onGiftOpen);
            EventManager.on("SnowSeason_REFRESH_TAB", this, this.refreshTab);
            EventManager.on("SnowSeason_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("SnowSeason_REFRESH_TAB", this, this.refreshTab);
            EventManager.off("SnowSeason_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        destroy() {
            super.destroy();
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
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