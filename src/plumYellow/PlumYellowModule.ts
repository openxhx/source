namespace plumYellow {
    export enum subpanel {
        min = 0,
        suitBuy,//直购-单套
        suitBuy1,//直购-单套
        discountDraw1,//折扣转盘1
        discountDraw2,//折扣转盘2
        rollCard,//九宫格
        rollCloth,//扭蛋
        moleBuy,//摩尔联动
        pieceBuy,//碎片购买
        panicBuy//特卖会

    }
    /**改变活动时间 */
    export const CHANGE_TIME: string = "SPRINGOVERTURE_CHANGE_EVENT_TIME";
    /**切换活动 */
    export const CHANGE_PANEL: string = "SPRINGOVERTURE_CHANGE_EVENT_PANEL";
    /**刷新页签 */
    export const REFRESH_TAG: string = "SPRINGOVERTURE_REFRESH_EVENT_TAG";
    /**
     * 梅子黄时
     * plumYellow.PlumYellowModule
     */
    export class PlumYellowModule extends ui.plumYellow.PlumYellowModuleUI {
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
            //this.addPreLoad(this.getFeedbackInfo());
            this.tagList.selectEnable = true;
            this.tagList.vScrollBarSkin = '';
            this.tagList.renderHandler = new Laya.Handler(this, this.tabRender);
            this.tagList.selectHandler = new Laya.Handler(this, this.tabMouse);

            this.panelName = [
                { name: "mo_mo_hua_xian", open: 0, type: subpanel.moleBuy },
                { name: "chun_shi_xia_zhi", open: 0, type: subpanel.suitBuy1 },
                { name: "yi_xia_wei_nian", open: 0, type: subpanel.rollCloth },
                { name: "te_mai_hui", open: 0, type: subpanel.panicBuy },
                { name: "xia_zhuan_nian_nian", open: 0, type: subpanel.discountDraw1 },
                { name: "liu_li_sui_xia", open: 0, type: subpanel.pieceBuy },

            ];

        }

        onPreloadOver() {
            EventManager.once("MODULE_OPEN_ALL_OVER", this, () => {
                PlumYellowModel.instance.checkCoinRecyle(2);
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
            return net.sendAndWait(new pb.cs_common_feedback_panel({ activityId: PlumYellowModel.instance.activityId })).then((msg: pb.sc_common_feedback_panel) => {
                PlumYellowModel.instance.costAllCnt = msg.costCnt;
                PlumYellowModel.instance.feedbackRewardFlag = msg.rewardFlag;
            })
        }

        private tabRender(item: ui.plumYellow.render.PanelTagUI, index: number) {
            let data: { name: string, open: number } = item.dataSource;
            item.imgSelect.visible = data.open == 1;
            item.imgName.skin = `plumYellow/${data.name}${data.open}.png`;
            //item.redPoint.visible = this.getRedVisible(data.name);
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
            if (!PlumYellowModel.instance.canChangePanel) {
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
            if (!PlumYellowModel.instance.canChangePanel) return;
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                switch (type) {
                    case subpanel.suitBuy:
                        await this.loadAtlas("SuitBuyPanel");
                        this.panelMap.add(type, new SuitBuyPanel(PlumYellowModel.instance.getSuitBuyCfg(1)));
                        break;
                    case subpanel.suitBuy1:
                        await this.loadAtlas("SuitBuyPanel1");
                        this.panelMap.add(type, new SuitBuyPanel1(PlumYellowModel.instance.getSuitBuyCfg(2)));
                        break;
                    case subpanel.discountDraw1:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel(PlumYellowModel.instance.getDisCountDrawCfg(1)));
                        break;
                    case subpanel.discountDraw2:
                        await this.loadAtlas("DisCountDrawPanel");
                        this.panelMap.add(type, new DisCountDrawPanel(PlumYellowModel.instance.getDisCountDrawCfg(2)));
                        break;
                    case subpanel.rollCard:
                        await this.loadAtlas("RollCardPanel");
                        this.panelMap.add(type, new RollCardPanel());
                        break;
                    case subpanel.rollCloth:
                        await this.loadAtlas("RollClothPanel");
                        this.panelMap.add(type, new RollClothPanel());
                        break;
                    case subpanel.pieceBuy:
                        await this.loadAtlas("PieceBuyPanel");
                        this.panelMap.add(type, new PieceBuyPanel());
                        break;
                    case subpanel.moleBuy:
                        await this.loadAtlas("MoleBuyPanel");
                        this.panelMap.add(type, new MoleBuyPanel());
                        break;
                    case subpanel.panicBuy:
                        await this.loadAtlas("PanicBuyPanel");
                        this.panelMap.add(type, new PanicBuyPanel());
                        break;
                }
            }
            this.panelMap.get(type).show(this.boxView);
        }

        private async loadAtlas(name: string) {
            clientCore.LoadingManager.showSmall();
            await res.load(`atlas/plumYellow/${name}.atlas`, Laya.Loader.ATLAS);
            clientCore.LoadingManager.hideSmall(true);
        }

        /**代币礼包 */
        private openCoinBuy() {
            PlumYellowModel.instance.openCoinGiftBuy();
        }

        /**更新tab状态 */
        private refreshTab() {
            this.tagList.refresh();
        }

        /**活动时间 */
        private changeTime(time: string) {
            if (time == "") this.imgTime.skin = "";
            else this.imgTime.skin = `plumYellow/${time}.png`;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose1, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.openCoinBuy);
            EventManager.on(REFRESH_TAG, this, this.refreshTab);
            EventManager.on(CHANGE_PANEL, this, this.addPanel);
            EventManager.on(CHANGE_TIME, this, this.changeTime);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(REFRESH_TAG, this, this.refreshTab);
            EventManager.off(CHANGE_TIME, this, this.changeTime);
            EventManager.off(CHANGE_PANEL, this, this.addPanel);
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