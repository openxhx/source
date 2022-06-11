namespace girlMemories {
    /**
     * 少女回忆书
     * girlMemories.GirlMemoriesModule
     * 策划案: \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0723\【主活动】少女回忆书20210723_Inory.docx
     */
    export class GirlMemoriesModule extends ui.girlMemories.GirlMemoriesModuleUI {
        private _model: GirlMemoriesModel;
        private _control: GirlMemoriesControl;
        private _searchPanel: SearchClubsPanel;
        private _clueAnalysisPanel: ClueAnalysisPanel;
        private _getMemoriesRewardPanel: GetMemoriesRewardPanel;
        private _informationComePanel: InformationComePanel;
        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new GirlMemoriesModel(), new GirlMemoriesControl());
            this._model = clientCore.CManager.getModel(this.sign) as GirlMemoriesModel;
            this._control = clientCore.CManager.getControl(this.sign) as GirlMemoriesControl;
            this.initUI();
            this.addPreLoad(Promise.all([
                xls.load(xls.eventControl)
            ]));
        }

        async seqPreLoad(): Promise<void> {
            await clientCore.SearchClubsMapManager.ins.resetData();
            this.reset2Information();
        }



        private initUI(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/girlMemories/pho_${sex}.png`;
            this.reset2JigSaw();
            this.reset2Progress();
            this.reset2Splicing();
        }
        //#region 重置
        //重置6个碎片
        private reset2JigSaw(): void {
            const index: number = this._model.getJigSawIndex();
            const doState: (j: number, ok: boolean) => void = (j, ok) => {
                this[`c_${j}`].visible = ok;
                this[`h_${j}`].visible = !ok;
            };
            for (let i: number = 0; i < 6; i++) {
                if (index == null) {
                    doState(i + 1, true);
                } else {
                    if (i < index) {
                        doState(i + 1, true);
                    } else {
                        doState(i + 1, false);
                    }
                }
            }
        }
        //找茬进度相关重置
        private reset2Progress(): void {
            const index: number = this._model.getJigSawIndex();
            if (index == null) {//TODO 全部完成(6个碎片全部完成)
                this.btnReasoning.visible = false;
                this.state_progress.visible = false;
            } else {
                const needs: number = this._model.NEED_CLUES[index];//目前需要多少代币
                const curMoney: number = clientCore.MoneyManager.getNumById(this._model.MONEY_ID);
                if (curMoney >= needs) {//可以开启下一个碎片
                    this.btnReasoning.visible = true;
                    this.state_progress.visible = false;
                } else {
                    this.btnReasoning.visible = false;
                    this.state_progress.visible = true;
                    this.labProgress.text = `${curMoney}/${needs}`;
                }
            }
        }
        //重置拼凑记忆
        private reset2Splicing(): void {
            const index: number = this._model.getJigSawIndex();
            if (index == null) {
                this.btnSplicing.gray = false;
            } else {
                this.btnSplicing.gray = true;
            }
        }
        //线人来报主要为红点判断
        private reset2Information(): void {
            const data: clientCore.SearchClubsVo = clientCore.SearchClubsMapManager.ins.searchData;
            if (data.flag == 0) {//没有领取显示小红点
                if (clientCore.FlowerPetInfo.petType >= 1) {
                    this.redInfomation.visible = true;
                } else {
                    this.redInfomation.visible = false;
                }
            } else {
                this.redInfomation.visible = false;
            }
            //通知外部小红点
            util.RedPoint.reqRedPointRefresh(28701);
        }
        //#endregion

        addEventListeners(): void {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onShowSuit);
            for (let i: number = 0; i < 6; i++) {
                BC.addEvent(this, this[`c_${i + 1}`], Laya.Event.CLICK, this, this.onJigSawClickHandler);
                BC.addEvent(this, this[`h_${i + 1}`], Laya.Event.CLICK, this, this.onJigSawClickHandler);
            }
            BC.addEvent(this, this.btnSearch, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnReasoning, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnSplicing, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnSociology, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnInformant, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnReview, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, EventManager, GirlMemoriesEventType.CLOSE_SearchClubsPanel, this, this.onCloseSearchPanel);
            BC.addEvent(this, EventManager, GirlMemoriesEventType.CLOSE_ClueAnalysisPanel, this, this.onCloseClueAnalysisPanel);
            BC.addEvent(this, EventManager, GirlMemoriesEventType.CLOSE_GetMemoriesRewardPanel, this, this.onCloseGetMemoriesRewardPanel);
            BC.addEvent(this, EventManager, GirlMemoriesEventType.CLOSE_InformationComePanel, this, this.onCloseInformationComePanel);
            BC.addEvent(this, EventManager, globalEvent.ANIMATE_MOVIE_PLAY_OVER, this, this.onPlotOver);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        //#region 关闭面板处理
        //关闭搜寻界面
        private onCloseSearchPanel(isDestroy: boolean): void {
            if (this._searchPanel) {
                this._searchPanel = null;
            }
            if (isDestroy) {
                this.destroy();
            }
        }
        //关闭线索分析
        private onCloseClueAnalysisPanel(isSucc: boolean): void {
            if (this._clueAnalysisPanel) {
                this._clueAnalysisPanel = null;
            }
            if (isSucc != null) {
                this.reset2Progress();
                if (isSucc == true) {
                    //各种刷新
                    this.reset2JigSaw();
                    this.reset2Progress();
                    this.reset2Splicing();
                    //打开领取回忆面板(领奖)
                    this._getMemoriesRewardPanel = new GetMemoriesRewardPanel(this.sign, this._model.getJigSawIndex() - 1, true);
                    clientCore.DialogMgr.ins.open(this._getMemoriesRewardPanel);
                }
            }
        }
        //关闭领取回忆面板
        private onCloseGetMemoriesRewardPanel(isSucc: boolean): void {
            if (this._getMemoriesRewardPanel) {
                this._getMemoriesRewardPanel = null;
            }
            if (isSucc != null) {
                if (isSucc == true) {
                    //nothing
                }
            }
        }
        //关闭线人来报面板
        private onCloseInformationComePanel(isSucc: boolean): void {
            if (this._informationComePanel) {
                this._informationComePanel = null;
            }
            if (isSucc != null) {
                if (isSucc == true) {
                    //各种刷新
                    this.reset2Progress();
                    this.reset2Information();
                } else {
                    this.destroy();
                }
            }
        }
        //#endregion
        //当剧情播放完毕后处理
        private onPlotOver(): void {
            this.dailyOpenInformationPanel();//接着弹出线人面板
        }
        //拼图点击处理
        private onJigSawClickHandler(e: Laya.Event): void {
            const arr: Array<string> = e.currentTarget.name.split("_");
            switch (arr[0]) {
                case "h"://灰色
                    clientCore.ToolTip.showContentTips(e.currentTarget, 0, [{ v1: this._model.getJigSawItemId(parseInt(arr[1]) - 1), v2: 1 }]);
                    break;
                case "c"://彩色
                    //打开领取回忆面板(领奖)
                    this._getMemoriesRewardPanel = new GetMemoriesRewardPanel(this.sign, parseInt(arr[1]) - 1, false);
                    clientCore.DialogMgr.ins.open(this._getMemoriesRewardPanel);
                    break;
            }
        }
        //通用Click处理
        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnSearch://线索搜寻
                    this._searchPanel = new SearchClubsPanel(this.sign);
                    clientCore.DialogMgr.ins.open(this._searchPanel);
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击线索搜寻按钮');
                    break;
                case this.btnReasoning://开始推理
                    this._clueAnalysisPanel = new ClueAnalysisPanel(this.sign, this._model.getJigSawIndex());
                    clientCore.DialogMgr.ins.open(this._clueAnalysisPanel);
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击开始推理按钮');
                    break;
                case this.btnSplicing://拼凑回忆
                    if (this.btnSplicing.gray == true) return;
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击拼凑回忆按钮');
                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.plotPCID, null, null);
                    break;
                case this.btnSociology://夏日侦探社
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击夏日侦探社按钮');
                    this.destroy();
                    clientCore.ModuleManager.open("schoolFlower.SchoolFlowerModule");
                    break;
                case this.btnInformant://线人来报
                    this._informationComePanel = new InformationComePanel(this.sign);
                    clientCore.DialogMgr.ins.open(this._informationComePanel);
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击线人来报按钮');
                    break;
                case this.btnReview://剧情回顾
                    clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '点击剧情回顾按钮');
                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.plotID, null, null);
                    break;
            }
        }

        popupOver(): void {
            clientCore.UIManager.setMoneyIds([this._model.MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月23日活动', '【主活动】少女回忆书', '打开主活动面板');
            //判断是否第一次打开,如果第一次打开则播放剧情
            clientCore.MedalManager.getMedal([MedalConst.GIRLMOMORIES_PLOT_OPEN]).then((msg: pb.ICommonData[]) => {
                if (msg[0].value == 0) {
                    clientCore.MedalManager.setMedal([{ id: MedalConst.GIRLMOMORIES_PLOT_OPEN, value: 1 }]);
                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.plotID, null, null);
                } else {
                    this.dailyOpenInformationPanel();
                }
            });
        }
        //每天弹出线人
        private dailyOpenInformationPanel(): void {
            if (clientCore.FlowerPetInfo.petType >= 1) {
                clientCore.MedalManager.getMedal([MedalDailyConst.GIRLMOMORIES_OPEN]).then(msg => {
                    if (msg[0].value == 0) {
                        clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GIRLMOMORIES_OPEN, value: 1 }]);//今日弹出已完成
                        this._informationComePanel = new InformationComePanel(this.sign);
                        clientCore.DialogMgr.ins.open(this._informationComePanel);
                    }
                });
            }
        }
        private onShowRule(): void {
            alert.showRuleByID(this._model.RULE_ID);
        }
        private onShowSuit(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.SUIT_ID);
        }

        public destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}