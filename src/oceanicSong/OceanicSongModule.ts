namespace oceanicSong {
    /**
     * 海洋之歌
     * oceanicSong.OceanicSongModule
     * 策划案: \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0611\【付费】海洋之歌20210611_wengxin.docx
     */
    export class OceanicSongModule extends ui.oceanicSong.OceanicSongModuleUI {
        private _panelDeatailMap: Map<TypeOceanicSongPage, IPanel>;
        private _model: OceanicSongModel;
        private _control: OceanicSongControl;
        private _curPageTy: TypeOceanicSongPage;
        private _first: boolean;

        public init(data?: number): void {
            super.init(data);
            this._panelDeatailMap = new Map();
            this.sign = clientCore.CManager.regSign(new OceanicSongModel(), new OceanicSongControl());
            this._model = clientCore.CManager.getModel(this.sign) as OceanicSongModel;
            this._control = clientCore.CManager.getControl(this.sign) as OceanicSongControl;
            this.pageTy = TypeOceanicSongPage.MAIN;
            this.btn_help.visible = false;
            this.addPreLoad(Promise.all([
                xls.load(xls.eventExchange),
                xls.load(xls.rechargeEvent),
                xls.load(xls.openCardDraw),
                xls.load(xls.rouletteDraw),
                xls.load(xls.rouletteDrawCost),
                clientCore.MedalManager.getMedal([MedalConst.OCEANIC_SONG_OPEN]).then((msg: pb.ICommonData[]) => {
                    this._first = msg[0].value == 0;
                })
            ]));
        }

        //切换状态
        private set pageTy(value: TypeOceanicSongPage) {
            if (value == TypeOceanicSongPage.DETAIL_BUY) {
                clientCore.ToolTip.gotoMod(278);
                return;
            }
            if (this._curPageTy != value) {
                if (this._curPageTy == TypeOceanicSongPage.MAIN || value == TypeOceanicSongPage.MAIN) {
                    if (value == TypeOceanicSongPage.MAIN) {
                        this.bx_main.visible = true;
                        this.bx_detail.visible = false;
                        this.cp_flash.index = this.cp_legend.index = this.cp_buy.index = this.cp_love.index = this.cp_fish.index = 1;
                        this.vw_panel.removeChildren();
                        clientCore.UIManager.releaseCoinBox();
                    } else {
                        this.bx_main.visible = false;
                        this.bx_detail.visible = true;
                        this.showDeateilPanel(value);
                        this.resetDetailCpIndex(value);
                    }
                } else {
                    if (this._panelDeatailMap.has(this._curPageTy)) {
                        const panel: IPanel = this._panelDeatailMap.get(this._curPageTy);
                        panel.hide();
                    }
                    this.showDeateilPanel(value);
                    this.resetDetailCpIndex(value);
                }
                this.resetActivityTime4Page(value);
                this._curPageTy = value;
            }
        }

        public addEventListeners(): void {
            //#region Main
            BC.addEvent(this, this.btn_flash, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btn_legend, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btnNavigation, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btnMiLan, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btnDraw, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btnRandom, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btnRecharge, Laya.Event.CLICK, this, this.onMainClick);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btn_help, Laya.Event.CLICK, this, this.onRule);
            //#endregion

            //#region Detail
            BC.addEvent(this, this.cp_flash, Laya.Event.CLICK, this, this.onDetailClcik);
            BC.addEvent(this, this.cp_legend, Laya.Event.CLICK, this, this.onDetailClcik);
            BC.addEvent(this, this.cp_buy, Laya.Event.CLICK, this, this.onDetailClcik);
            BC.addEvent(this, this.cp_love, Laya.Event.CLICK, this, this.onDetailClcik);
            BC.addEvent(this, this.cp_fish, Laya.Event.CLICK, this, this.onDetailClcik);
            BC.addEvent(this, this.btn_detail_help, Laya.Event.CLICK, this, this.onRuleDetail);
            BC.addEvent(this, this.btn_detail_close, Laya.Event.CLICK, this, this.onDetailClcik);
            //#endregion

            BC.addEvent(this, EventManager, EventType.UPDATE_TIME, this, this.onUpdateTime);
            BC.addEvent(this, EventManager, EventType.RESET_MAIN_TAB_ABLE, this, this.onResetMainTab);
        }
        //主页切页按钮
        private onResetMainTab(able: boolean): void {
            this.btn_detail_close.mouseEnabled =
                this.cp_flash.mouseEnabled = this.cp_legend.mouseEnabled = this.cp_buy.mouseEnabled = this.cp_love.mouseEnabled = this.cp_fish.mouseEnabled = able;
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onMainClick(e: Laya.Event): void {
            switch (e.target) {
                case this.btn_flash:
                    this.pageTy = TypeOceanicSongPage.DETAIL_FLASH;
                    break;
                case this.btn_legend:
                    this.pageTy = TypeOceanicSongPage.DETAIL_LEGEND;
                    break;
                case this.btnNavigation:
                    this.pageTy = TypeOceanicSongPage.DETAIL_BUY;
                    break;
                case this.btnDraw:
                    this.pageTy = TypeOceanicSongPage.DETAIL_LOVE;
                    break;
                case this.btnRandom:
                    this.pageTy = TypeOceanicSongPage.DETAIL_FISH;
                    break;
                case this.btnMiLan://弥蓝之情
                    this.pageTy = TypeOceanicSongPage.DETAIL_MILAN;
                    break;
                case this.btnRecharge://特殊的跳转 (沉默之棺)
                    this.destroy();
                    clientCore.ModuleManager.open("rechargeActivity.RechargeActivityModule");
                    break;
            }
        }

        private onDetailClcik(e: Laya.Event): void {
            switch (e.target) {
                case this.cp_flash:
                    if (this.cp_flash.index == 0) break;
                    this.pageTy = TypeOceanicSongPage.DETAIL_FLASH;
                    break;
                case this.cp_legend:
                    if (this.cp_legend.index == 0) break;
                    this.pageTy = TypeOceanicSongPage.DETAIL_LEGEND;
                    break;
                case this.cp_buy:
                    if (this.cp_buy.index == 0) break;
                    this.pageTy = TypeOceanicSongPage.DETAIL_MILAN;
                    break;
                case this.cp_love:
                    if (this.cp_love.index == 0) break;
                    this.pageTy = TypeOceanicSongPage.DETAIL_LOVE;
                    break;
                case this.cp_fish:
                    if (this.cp_fish.index == 0) break;
                    this.pageTy = TypeOceanicSongPage.DETAIL_FISH;
                    break;
                case this.btn_detail_close:
                    this.onResetMainTab(true);
                    this.pageTy = TypeOceanicSongPage.MAIN;
                    break;
            }
        }

        private showDeateilPanel(value: TypeOceanicSongPage): void {
            let panel: IPanel;
            if (this._panelDeatailMap.has(value)) {
                panel = this._panelDeatailMap.get(value);
            } else {
                switch (value) {
                    case TypeOceanicSongPage.DETAIL_FLASH:
                        panel = new FlashComPanel();
                        break;
                    case TypeOceanicSongPage.DETAIL_LEGEND:
                        panel = new DreamPanel();
                        break;
                    case TypeOceanicSongPage.DETAIL_BUY:
                        panel = new OceanicSongBuyPanel();
                        break;
                    case TypeOceanicSongPage.DETAIL_LOVE:
                        panel = new LovePanel();
                        break;
                    case TypeOceanicSongPage.DETAIL_FISH:
                        panel = new FishPanel();
                        break;
                    case TypeOceanicSongPage.DETAIL_MILAN://弥蓝之情
                        panel = new OceanicSongMiLanPanel();
                        break;
                }
                panel.init(this.sign);
                this._panelDeatailMap.set(value, panel);
            }
            panel.show(this.vw_panel);//显示
        }

        private resetDetailCpIndex(value: TypeOceanicSongPage): void {
            const doState: (index: number, clip: TypeOceanicSongPage) => void = (index, clip) => {
                switch (clip) {
                    case TypeOceanicSongPage.DETAIL_FLASH:
                        this.cp_flash.index = index;
                        break;
                    case TypeOceanicSongPage.DETAIL_LEGEND:
                        this.cp_legend.index = index;
                        break;
                    case TypeOceanicSongPage.DETAIL_BUY:
                        this.cp_buy.index = index;
                        break;
                    case TypeOceanicSongPage.DETAIL_LOVE:
                        this.cp_love.index = index;
                        break;
                    case TypeOceanicSongPage.DETAIL_FISH:
                        this.cp_fish.index = index;
                        break;
                    case TypeOceanicSongPage.DETAIL_MILAN:
                        this.cp_buy.index = index;
                        break;
                }
            };
            doState(0, value);
            if (this._curPageTy != TypeOceanicSongPage.MAIN) {
                doState(1, this._curPageTy);
            }
        }

        private resetActivityTime4Page(value: TypeOceanicSongPage): void {
            if (value == TypeOceanicSongPage.DETAIL_BUY) {
                this.img_state_buy.visible = true;
                this.lab_state_other.visible = false;
            } else {
                // let str: string;
                // switch (value) {
                //     case TypeOceanicSongPage.MAIN:
                //         str = "活动时间:6月11日~7月22日";
                //         break;
                //     case TypeOceanicSongPage.DETAIL_FLASH:
                //         str = "活动时间:6月11日~6月24日";
                //         break;
                //     case TypeOceanicSongPage.DETAIL_LEGEND:
                //         str = "活动时间:6月11日~6月24日";
                //         break;
                //     case TypeOceanicSongPage.DETAIL_LOVE:
                //     case TypeOceanicSongPage.DETAIL_FISH:
                //         str = "活动时间:6月18日~7月1日";
                //         break;
                // }
                // this.lab_state_other.text = str;
                this.img_state_buy.visible = false;
                this.lab_state_other.visible = true;
            }
        }

        private onUpdateTime(timeStr: string): void {
            this.lab_state_other.text = timeStr;
        }

        public popupOver(): void {
            alert.showAutoExchange(this._model.ACTIVITY_ID, MedalConst.OCEANIC_SONG_THREE_OPEN);
            // if (this._first) {
            //     this._first = false;
                // clientCore.MedalManager.setMedal([{ id: MedalConst.OCEANIC_SONG_OPEN, value: 1 }]);
            //     alert.showSmall(`亲爱的小花仙，我们已将你口袋里剩余的${clientCore.ItemsInfo.getItemName(9900158)}以及${clientCore.ItemsInfo.getItemName(9900163)}按照1：1的比例转换为${clientCore.ItemsInfo.getItemName(9900185)}，快去参与抽奖吧~`);
            // }
        }

        private onRule(): void {
            // alert.showRuleByID(100);
        }

        private onRuleDetail(): void {
            alert.showRuleByID(this._panelDeatailMap.get(this._curPageTy).ruleId);
        }

        private destoryPanels(): void {
            if (this._panelDeatailMap.size == 0) return;
            let keys: IterableIterator<TypeOceanicSongPage> = this._panelDeatailMap.keys();
            let results: IteratorResult<TypeOceanicSongPage> = keys.next();
            let panel: IPanel;
            while (results.done == false) {
                panel = this._panelDeatailMap.get(results.value);
                panel && panel.dispose();
                results = keys.next();
            }
            this._panelDeatailMap.clear();
            this._panelDeatailMap = null;
        }

        public destroy(): void {
            this.destoryPanels();
            super.destroy();
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
            this._curPageTy = null;
        }
    }
}
