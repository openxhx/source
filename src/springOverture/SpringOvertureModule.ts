namespace springOverture {
    export enum subpanel {
        min = 0,
        feedback,//感恩回馈
        rebackFaery,//复出-神祈，神祈归来
        rebackFaery1,//复出-神祈，神祈归来
        rebackSuit,//复出-套装，绝版复出
        rollCloth,//转盘抽衣服，春风不知，萌虎套裝
        rollCloth1,//转盘抽衣服，春风不知,立春套裝
        suitBuy,//直购-单套,暮色曙光
        rollCard,//占卜翻牌 春日九律
        disCountDraw,//折扣转盘 碧玉妆成
        flashSale,//限时礼包
        mainSell,//本周主打-吾愛永恆
        mainSell1,//本周主打-光阴靡丽
        panicBuy,//限量折扣抢购-千里莺啼
        pieceBuy,//冰雪消融-碎片购买
        pieceBuy1,//冰雪消融-碎片购买
        rebackDraw//沧海寻踪 复出抽奖
    }
    /**改变活动时间 */
    export const CHANGE_TIME: string = "SPRINGOVERTURE_CHANGE_EVENT_TIME";
    /**切换活动 */
    export const CHANGE_PANEL: string = "SPRINGOVERTURE_CHANGE_EVENT_PANEL";
    /**刷新页签 */
    export const REFRESH_TAG: string = "SPRINGOVERTURE_REFRESH_EVENT_TAG";
    /**
     * 春日序曲
     * springOverture.SpringOvertureModule
     */
    export class SpringOvertureModule extends ui.springOverture.SpringOvertureModuleUI {
        private curIdx: number = -1;
        private curPanel: subpanel;
        private panelMap: util.HashMap<any>;
        private panelName: { name: string, open: number, type: subpanel }[];
        // private redInfo: number[];

        init(data: any) {
            super.init(data);
            this.addPreLoad(xls.load(xls.recycle));
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(xls.load(xls.rouletteDraw));
            this.addPreLoad(xls.load(xls.rouletteDrawCost));
            this.addPreLoad(xls.load(xls.rouletteDrawReward));
            this.addPreLoad(xls.load(xls.rechargeEvent));
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.largeRechargeActivityFront));
            this.addPreLoad(this.getFeedbackInfo());
            // this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.BI_AN_FU_DENG, MedalConst.HU_DIE_FU_REN, MedalConst.ZI_TENG_HUA_KAI])
            //     .then((msg: pb.ICommonData[]) => {
            //         this.redInfo = [];
            //         for (let i: number = 0; i < msg.length; i++) {
            //             this.redInfo.push(msg[i].value);
            //         }
            //     }));
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panelName = [
                { name: "mu_se_shu_guang", open: 0, type: subpanel.suitBuy },
                { name: "chun_feng_bu_zhi", open: 0, type: subpanel.rollCloth },
                { name: "bi_yu_zhuang_cheng", open: 0, type: subpanel.disCountDraw },
                { name: "jue_ban_fu_chu", open: 0, type: subpanel.rebackSuit },
                { name: "gan_en_hui_kui", open: 0, type: subpanel.feedback }
            ];
        }

        onPreloadOver() {
            this.tagList.repeatY = this.panelName.length;
            this.tagList.array = this.panelName;
            this.panelMap = new util.HashMap();
            if (this._data) {
                this.tabMouse(parseInt(this._data));
            } else {
                this.tabMouse(0);
            }
        }

        /**获取充值回馈信息 */
        private getFeedbackInfo() {
            return net.sendAndWait(new pb.cs_common_feedback_panel({ activityId: SpringOvertureModel.instance.activityId })).then((msg: pb.sc_common_feedback_panel) => {
                SpringOvertureModel.instance.costAllCnt = msg.costCnt;
                SpringOvertureModel.instance.feedbackRewardFlag = msg.rewardFlag;
            })
        }

        private tabRender(item: ui.springOverture.render.PanelTagUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgSelect.visible = data.open == 1;
            item.imgName.skin = `springOverture/${data.name}${data.open}.png`;
            item.redPoint.visible = this.getRedVisible(data.name);
        }


        getRedVisible(name: string): boolean {
            // if ((name == "bi_yu_zhuang_cheng" && this.redInfo[0] == 0)
            //     || (name == "mu_se_shu_guang" && this.redInfo[1] == 0)
            //     || (name == "chun_feng_bu_zhi" && this.redInfo[2] == 0)) {
            //     return true;
            // }
            return false;
        }

        private tabMouse(idx: number) {
            if (idx == this.curIdx) return;
            if (idx < 0) return;
            if (!SpringOvertureModel.instance.canChangePanel) {
                this.tagList.selectedIndex = -1;
                return;
            }
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
                this.panelName[this.curIdx].open = 0;
                this.curPanel = 0;
            }
            this.panelName[idx].open = 1;
            // if (idx < 3) this.redInfo[idx] = 1;
            this.tagList.refresh();
            this.curIdx = idx;
            this.addPanel(this.panelName[idx].type);
            this.tagList.selectedIndex = -1;
        }

        private async addPanel(type: subpanel) {
            if (!SpringOvertureModel.instance.canChangePanel) return;
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                switch (type) {
                    case subpanel.suitBuy:
                        await this.loadAtlas("SuitBuyPanel");
                        this.panelMap.add(type, new SuitBuyPanel());
                        break;
                    case subpanel.rollCloth:
                        await this.loadAtlas("RollClothPanel");
                        this.panelMap.add(type, new RollClothPanel());
                        break;
                    case subpanel.rollCloth1:
                        await this.loadAtlas("RollClothPanel");
                        this.panelMap.add(type, new RollCloth1Panel());
                        break;
                    case subpanel.rebackFaery:
                        await this.loadAtlas("RebackFaeryPanel");
                        //this.panelMap.add(type, new RebackFaeryPanel(new ui.springOverture.panel.RebackFaeryPanelUI(), SpringOvertureModel.instance.getRebackFaeryCfg(1)));
                        break;
                    case subpanel.rebackFaery1:
                        await this.loadAtlas("RebackFaeryPanel");
                        this.panelMap.add(type, new RebackFaeryPanel(new ui.springOverture.panel.RebackFaeryPanel1UI(), SpringOvertureModel.instance.getRebackFaeryCfg(2)));
                        break;
                    case subpanel.rebackSuit:
                        await this.loadAtlas("RebackSuitPanel");
                        this.panelMap.add(type, new RebackSuitPanel());
                        break;
                    case subpanel.feedback:
                        await this.loadAtlas("FeedbackPanel");
                        this.panelMap.add(type, new FeedbackPanel());
                        break;
                    case subpanel.rollCard:
                        await this.loadAtlas("RollCardPanel");
                        this.panelMap.add(type, new RollCardPanel());
                        break;
                    case subpanel.disCountDraw:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel());
                        break;
                    case subpanel.flashSale:
                        await this.loadAtlas("FlashSalePanel");
                        this.panelMap.add(type, new FlashSalePanel());
                        break;
                    case subpanel.mainSell:
                        await this.loadAtlas("MainSellPanel");
                        this.panelMap.add(type, new MainSellPanel(new ui.springOverture.panel.MainSellPanelUI(), SpringOvertureModel.instance.getMainSellCfg(1)));
                        break;
                    case subpanel.mainSell1:
                        await this.loadAtlas("MainSellPanel");
                        this.panelMap.add(type, new MainSellPanel(new ui.springOverture.panel.MainSellPanel1UI(), SpringOvertureModel.instance.getMainSellCfg(2)));
                        break;
                    case subpanel.panicBuy:
                        await this.loadAtlas("PanicBuyPanel");
                        this.panelMap.add(type, new PanicBuyPanel());
                        break;
                    case subpanel.pieceBuy:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuyPanel());
                        break;
                    case subpanel.pieceBuy1:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuy1Panel());
                        break;
                    case subpanel.rebackDraw:
                        await this.loadAtlas("RebackDrawPanel");
                        this.panelMap.add(type, new RebackDrawPanel());
                        break;
                }
            }
            this.panelMap.get(type).show(this.boxView);
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/springOverture/${name}.atlas`, Laya.Loader.ATLAS);
            clientCore.LoadingManager.hideSmall(true);
        }

        /**代币礼包 */
        private openCoinBuy() {
            SpringOvertureModel.instance.openCoinGiftBuy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        /**活动时间 */
        private changeTime(time: string) {
            if (time == "") this.imgTime.skin = "";
            else this.imgTime.skin = `springOverture/${time}.png`;
        }

        /**跨天 */
        private onOverDay() {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime == util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")
                || curTime == util.TimeUtil.formatTimeStrToSec("2022-2-1 00:00:00")
                || curTime == util.TimeUtil.formatTimeStrToSec("2022-2-7 00:00:00")) {
                alert.showFWords("活动内容有更新，请重新打开~");
                this.destroy();
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.openCoinBuy);
            EventManager.on(REFRESH_TAG, this, this.refreshTab);
            EventManager.on(CHANGE_TIME, this, this.changeTime);
            EventManager.on(CHANGE_PANEL, this, this.addPanel);
            //EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(REFRESH_TAG, this, this.refreshTab);
            EventManager.off(CHANGE_TIME, this, this.changeTime);
            EventManager.off(CHANGE_PANEL, this, this.addPanel);
            //EventManager.off(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        destroy() {
            super.destroy();
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.tagList.array = [];
            let panels = this.panelMap.getValues();
            for (let i: number = 0; i < panels.length; i++) {
                panels[i].destroy();
            }
            this.panelMap.clear();
            this.panelMap = null;
            this.panelName = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}