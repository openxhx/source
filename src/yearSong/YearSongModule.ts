namespace yearSong {
    export enum panelType {
        min = 0,
        disCountDraw, //折扣抽取
        disCountDrawNew,
        pieceBuy,    //碎片购买
        rollCard,     //抽卡
        disCountBuy,
        disCountBuyNew,
        doubleVipBuy,
        turnTableDraw,
        turnTableDrawNew,
        singlePanicBuy//限时抢购
    }
    /**
 * 大充
 * yearSong.YearSongModule
 */
    export class YearSongModule extends ui.yearSong.YearSongModuleUI {

        /**页签 */
        private curIdx: number = 0;
        private curPanel: panelType;
        private panelMap: util.HashMap<any>;
        private panelName: { name: string, open: number }[];
        private recylePanel: CoinRecylePanel;
        private flag: number;
        private flag1: number;

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
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.YEAR_SONG_OPEN_NEWEST]).then((msg: pb.ICommonData[]) => {
                this.flag = msg[0].value;
            }));
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [{ name: "zhu_luo_yu_pan", open: 0 }, { name: "yi_chang_san_tan", open: 0 }, { name: "ying_ge_wan_zhuan", open: 0 }, { name: "gan_en_xun_zhang", open: 0 }];
        }

        async onPreloadOver() {
            this.panelMap = new util.HashMap();
            this.panelName[0].open = 1;
            this.addPanel(panelType.disCountDraw);
            this.tagList.repeatY = this.panelName.length;
            this.tagList.array = this.panelName;
            // if (this.flag == 0) {
            //     clientCore.MedalManager.setMedal([{ id: MedalConst.YEAR_SONG_OPEN, value: 1 }]);
            //     await res.load(`atlas/yearSong/CoinRecylePanel.atlas`, Laya.Loader.ATLAS);
            //     this.recylePanel = new CoinRecylePanel();
            //     this.recylePanel.setData(clientCore.ItemsInfo.getItemNum(YearSongModel.instance.coinid));
            //     clientCore.DialogMgr.ins.open(this.recylePanel);
            // }
            if (this.flag == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalConst.YEAR_SONG_OPEN_NEWEST, value: 1 }]);
                alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的银杏叶和小心心按照1：1的比例转换为梦的蝴蝶，快去参加活动吧~');
            }
        }

        private tabRender(item: ui.yearSong.render.PanelTagItemUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgCur.visible = data.open == 1;
            item.imgName.skin = `yearSong/${data.name}${data.open}.png`;
        }

        private tabMouse(idx: number) {
            if (idx == this.curIdx) return;
            if (idx < 0) return;
            if (!YearSongModel.instance.canChangePanel) {
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
                    this.addPanel(panelType.disCountDraw);
                    break;
                case 1:
                    this.addPanel(panelType.pieceBuy);
                    break;
                case 2:
                    this.addPanel(panelType.turnTableDrawNew);
                    break;
                case 3:
                    this.destroy();
                    clientCore.ModuleManager.open("springMedal.SpringMedalModule");
                    break;
            }
            this.tagList.selectedIndex = -1;
        }

        private async addPanel(type: panelType) {
            if (!YearSongModel.instance.canChangePanel) return;
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                switch (type) {
                    case panelType.disCountDraw:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel());
                        break;
                    case panelType.disCountDrawNew:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawNewPanel());
                        break;
                    case panelType.rollCard:
                        await this.loadAtlas("RollCardPanel");
                        this.panelMap.add(type, new RollCardPanel());
                        break;
                    case panelType.pieceBuy:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuyPanel());
                        break;
                    case panelType.turnTableDraw:
                        await this.loadAtlas("TurnTableDrawPanel");
                        this.panelMap.add(type, new TurnTableDrawPanel());
                        break;
                    case panelType.turnTableDrawNew:
                        await this.loadAtlas("TurnTableDrawPanel");
                        this.panelMap.add(type, new TurnTableDrawNewPanel());
                        break;
                    case panelType.singlePanicBuy:
                        await this.loadAtlas("SinglePanicBuyPanel");
                        this.panelMap.add(type, new SinglePanicBuyPanel());
                        break;
                }
            }
            this.panelMap.get(type).show();
            this.boxView.addChild(this.panelMap.get(type));
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/yearSong/${name}.atlas`, Laya.Loader.ATLAS);
            clientCore.LoadingManager.hideSmall(true);
        }

        /**点击主页按钮 */
        private onHomeClick() {
            if (!YearSongModel.instance.canChangePanel) return;
            this.destroy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        private async onGiftOpen() {
            YearSongModel.instance.coinNotEnough();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onHomeClick);
            BC.addEvent(this, this.giftBtn2, Laya.Event.CLICK, this, this.onGiftOpen);
            EventManager.on("YearSong_REFRESH_TAB", this, this.refreshTab);
            EventManager.on("YearSong_SHOW_EVENT_PANEL", this, this.addPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("YearSong_REFRESH_TAB", this, this.refreshTab);
            EventManager.off("YearSong_SHOW_EVENT_PANEL", this, this.addPanel);
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