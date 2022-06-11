namespace flowerMass {
    export enum subpanel {
        min = 0,
        feedback,//感恩回馈
        rollCloth,//转盘抽衣服
        rollCloth1,//转盘抽衣服新
        rollCloth2,//转盘抽衣服新
        suitBuy,//直购-单套
        suitBuy1,//直购-单套
        suitBuy2,//直购-单套
        petGift,//花宝赠礼
        discountDraw,//周年转盘
        discountDraw1,//周年转盘-南涧茶香
        mainSell,//本周主打
        dailyBuy,//周年特惠
        panicBuy,//限时抢购
        pieceBuy//碎片购买
    }
    /**改变活动时间 */
    export const CHANGE_TIME: string = "SPRINGOVERTURE_CHANGE_EVENT_TIME";
    /**切换活动 */
    export const CHANGE_PANEL: string = "SPRINGOVERTURE_CHANGE_EVENT_PANEL";
    /**刷新页签 */
    export const REFRESH_TAG: string = "SPRINGOVERTURE_REFRESH_EVENT_TAG";
    /**
     * 春日序曲
     * flowerMass.FlowerMassModule
     */
    export class FlowerMassModule extends ui.flowerMass.FlowerMassModuleUI {
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
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-5-6 00:00:00")) {
                this.panelName = [
                    { name: "hua_bao_zeng_li", open: 0, type: subpanel.petGift },
                    { name: "zhou_nian_niu_dan", open: 0, type: subpanel.rollCloth },
                    { name: "zhou_nian_zhuan_oan", open: 0, type: subpanel.discountDraw },
                    { name: "zhi_gou_jing_xuan", open: 0, type: subpanel.suitBuy1 },
                    { name: "zhou_nian_hui_kui", open: 0, type: subpanel.feedback }
                ];
            } else {
                this.panelName = [
                    { name: "hua_bao_zeng_li", open: 0, type: subpanel.petGift },
                    { name: "sui_pian_ji_yi", open: 0, type: subpanel.pieceBuy },
                    { name: "zhi_gou_jing_xuan", open: 0, type: subpanel.suitBuy2 },
                    { name: "zhou_nian_niu_dan", open: 0, type: subpanel.rollCloth2 },
                    { name: "zhou_nian_hui_kui", open: 0, type: subpanel.feedback }
                ];
            }
        }

        onPreloadOver() {
            EventManager.once("MODULE_OPEN_ALL_OVER" , this , ()=>{
                FlowerMassModel.instance.checkCoinRecyle(2);
            });
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
            return net.sendAndWait(new pb.cs_common_feedback_panel({ activityId: FlowerMassModel.instance.activityId })).then((msg: pb.sc_common_feedback_panel) => {
                FlowerMassModel.instance.costAllCnt = msg.costCnt;
                FlowerMassModel.instance.feedbackRewardFlag = msg.rewardFlag;
            })
        }

        private tabRender(item: ui.springOverture.render.PanelTagUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgSelect.visible = data.open == 1;
            item.imgName.skin = `flowerMass/${data.name}${data.open}.png`;
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
            if (!FlowerMassModel.instance.canChangePanel) {
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
            if (!FlowerMassModel.instance.canChangePanel) return;
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                switch (type) {
                    case subpanel.petGift:
                        await this.loadAtlas("PetGiftPanel");
                        this.panelMap.add(type, new PetGiftPanel());
                        break;
                    case subpanel.suitBuy:
                        await this.loadAtlas("SuitBuyPanel");
                        this.panelMap.add(type, new SuitBuyPanel(FlowerMassModel.instance.getSuitBuyCfg(1)));
                        break;
                    case subpanel.suitBuy1:
                        await this.loadAtlas("SuitBuyPanel");
                        this.panelMap.add(type, new SuitBuyPanel(FlowerMassModel.instance.getSuitBuyCfg(2)));
                        break;
                    case subpanel.suitBuy2:
                        await this.loadAtlas("SuitBuyPanel");
                        this.panelMap.add(type, new SuitBuyPanel(FlowerMassModel.instance.getSuitBuyCfg(3)));
                        break;
                    case subpanel.rollCloth:
                        await this.loadAtlas("RollClothPanel");
                        this.panelMap.add(type, new RollClothPanel());
                        break;
                    case subpanel.rollCloth1:
                        await this.loadAtlas("RollClothPanel1");
                        this.panelMap.add(type, new RollClothPanel1());
                        break;
                    case subpanel.rollCloth2:
                        await this.loadAtlas("RollClothPanel2");
                        this.panelMap.add(type, new RollClothPanel2());
                        break;
                    case subpanel.discountDraw:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel());
                        break;
                    case subpanel.feedback:
                        await this.loadAtlas("FeedbackPanel");
                        this.panelMap.add(type, new FeedbackPanel());
                        break;
                    case subpanel.mainSell:
                        await this.loadAtlas("MainSellPanel");
                        this.panelMap.add(type, new MainSellPanel(new ui.flowerMass.panel.MainSellPanelUI(), FlowerMassModel.instance.getMainSellCfg(1)));
                        break;
                    case subpanel.discountDraw1:
                        await this.loadAtlas("DisCountDrawPanel1");
                        this.panelMap.add(type, new DisCountDrawPanel1());
                        break;
                    case subpanel.dailyBuy:
                        await this.loadAtlas("DailyBuyPanel");
                        this.panelMap.add(type, new DailyBuyPanel());
                        break;
                    case subpanel.panicBuy:
                        await this.loadAtlas("PanicBuyPanel");
                        this.panelMap.add(type, new PanicBuyPanel());
                        break;
                    case subpanel.pieceBuy:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuyPanel());
                        break;
                }
            }
            this.panelMap.get(type).show(this.boxView);
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/flowerMass/${name}.atlas`, Laya.Loader.ATLAS);
            clientCore.LoadingManager.hideSmall(true);
        }

        /**代币礼包 */
        private openCoinBuy() {
            FlowerMassModel.instance.openCoinGiftBuy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        /**活动时间 */
        private changeTime(time: string) {
            if (time == "") this.imgTime.skin = "";
            else this.imgTime.skin = `flowerMass/${time}.png`;
        }

        /**跨天 */
        private onOverDay() {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime == util.TimeUtil.formatTimeStrToSec("2022-5-6 00:00:00")) {
                alert.showFWords("活动内容有更新，请重新打开~");
                this.destroy();
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose1, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.openCoinBuy);
            EventManager.on(REFRESH_TAG, this, this.refreshTab);
            EventManager.on(CHANGE_TIME, this, this.changeTime);
            EventManager.on(CHANGE_PANEL, this, this.addPanel);
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(REFRESH_TAG, this, this.refreshTab);
            EventManager.off(CHANGE_TIME, this, this.changeTime);
            EventManager.off(CHANGE_PANEL, this, this.addPanel);
            EventManager.off(globalEvent.ON_OVER_DAY, this, this.onOverDay);
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