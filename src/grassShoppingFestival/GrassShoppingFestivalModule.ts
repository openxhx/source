namespace grassShoppingFestival {
    /**
     * 生草购物节
     * grassShoppingFestival.GrassShoppingFestivalModule
     * \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0709\【主活动】生草购物节20210709_Inory.docx
     */
    export class GrassShoppingFestivalModule extends ui.grassShoppingFestival.GrassShoppingFestivalModuleUI {
        private _model: GrassShoppingFestivalModel;
        private _control: GrassShoppingFestivalControl;
        private _eloPanel: EloquenceTrainingClassPanel;
        private _firstBubbles: boolean;
        private _setT1: NodeJS.Timeout;
        private _setT2: NodeJS.Timeout;

        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new GrassShoppingFestivalModel(), new GrassShoppingFestivalControl());
            this._model = clientCore.CManager.getModel(this.sign) as GrassShoppingFestivalModel;
            this._control = clientCore.CManager.getControl(this.sign) as GrassShoppingFestivalControl;
            this._firstBubbles = true;
            this.initUI();
            this.addPreLoad(Promise.all([
                xls.load(xls.gameWordPuzzle),
                xls.load(xls.taskData),
                xls.load(xls.taskItem)
            ]));
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuitShow);
            BC.addEvent(this, this.btnTrain, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnStartGet, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, EventManager, GrassShoppingFestivalEventType.CLOSE_EloquenceTrainingClassPanel, this, this.onCloseEloPanel);
            BC.addEvent(this, EventManager, GrassShoppingFestivalEventType.CLOSE_EloquenceBigTestPanel, this, this.onCloseBigTestPanel);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        //关闭口才训练班
        private onCloseEloPanel(): void {
            if (this._eloPanel) {
                this._eloPanel = null;
            }
        }

        private onCloseBigTestPanel(): void {
            this.resetUI();
        }

        private initUI(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/grassShoppingFestival/pho_${sex}.png`;
            this.listReward.vScrollBarSkin = "";
            this.listReward.renderHandler = new Laya.Handler(this, this.listRewardRender);
            this.listReward.selectHandler = new Laya.Handler(this, this.listRewardSelect);
        }

        async seqPreLoad(): Promise<void> {
            const data: pb.sc_grass_shopping_festival_panel = await this._control.getInitPanel();
            this._model.freeTaskId = data.freeTaskId;
            this._model.taskId = data.taskId;
            this._model.gameTimes = data.gameTimes;
            this._model.bit = data.bit;
            this.resetUI();
        }

        private resetUI(): void {
            let noneFlag: number = this._model.getLastRecommendNoneFinished();
            let isInit: boolean = false;
            if (noneFlag > 1)
                noneFlag--;
            else {
                isInit = true;
            }
            let data: IGrassShoppingFestivalRecommendVo = null;
            if (noneFlag != null) {
                data = this._model.optimumRecommendEloquence.get(noneFlag);
            }
            let isGeted: boolean = true;
            if (!isInit) {
                if (data) {
                    if (!clientCore.ItemsInfo.checkHaveItem(data.recommendRewards.rewards[0])) {
                        isGeted = false;
                    }
                    if (isGeted) {
                        data = this._model.optimumRecommendEloquence.get(noneFlag + 1);
                        isGeted = true;
                    }
                } else {
                    noneFlag = 6;
                    data = this._model.optimumRecommendEloquence.get(noneFlag);
                    if (!clientCore.ItemsInfo.checkHaveItem(data.recommendRewards.rewards[0])) {
                        isGeted = false;
                    }
                    if (isGeted) {
                        data = null;
                        isGeted = true;
                    }
                }
            } else if (noneFlag == null) {
                noneFlag = 6;
                data = this._model.optimumRecommendEloquence.get(noneFlag);
                if (!clientCore.ItemsInfo.checkHaveItem(data.recommendRewards.rewards[0])) {
                    isGeted = false;
                }
                if (isGeted) {
                    data = null;
                    isGeted = true;
                }
            }
            this.reset2Eloquence(data);
            this.reset2Banner(data);
            this.reset2CenterReward(data, isGeted);
            this.reset2RewardShow(data);
            this.reset2BtnCommon(isGeted);
            this.startPlayBubbles(data);
        }
        //刷新通用的按钮
        private reset2BtnCommon(isGedted: boolean): void {
            if (isGedted) {
                this.btnStartGet.fontSkin = `grassShoppingFestival/start_tx_txt.png`;
                this.boxReward.x = 860;
                this.boxReward.y = 461;
            } else {
                this.btnStartGet.fontSkin = `grassShoppingFestival/reward_get_txt.png`;
                this.boxReward.x = 545;
                this.boxReward.y = 295;
            }
        }

        onPreloadOver(): void {
            clientCore.UIManager.setMoneyIds([this._model.eloquenceId]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月9日活动', '【主活动】生草购物节', '打开主活动面板');
        }
        //开始播放动画
        private startPlayBubbles(data: IGrassShoppingFestivalRecommendVo): void {
            if (data == null || !this._firstBubbles) return;
            this._firstBubbles = false;
            const index: number = data.bannarIndex - 1;
            this.labPP1.text = this._model.pp_talk_1[index];
            this.labPP2.text = this._model.pp_talk_2[index];
            this._setT1 = setTimeout(() => {
                this.ani1.play(0, false);
                this.ani1.once(Laya.Event.COMPLETE, this, this.playBubble2);
            }, 500);

        }

        private playBubble2(): void {
            this._setT2 = setTimeout(() => {
                this.ani2 && this.ani2.play(0, false);
            }, 500);
        }

        //更新口才
        private reset2Eloquence(data: IGrassShoppingFestivalRecommendVo): void {
            if (data != null) {
                const index: number = this._model.getEloquenceLv(data);
                const color: string = this._model.eloquenceColor[index];
                this.labEloquence.text = `${this._model.getSelfEloquence()}`;
                this.labEloquence.color = color;
                this.labRecommendElo.text = `推荐最佳口才: ${data.eloquenceValue}`;
            } else {
                //没有推荐了
                this.btnStartGet.visible =
                    this.kcBg.visible =
                    this.labCurKc.visible =
                    this.labEloquence.visible =
                    this.labRecommendElo.visible =
                    false;
                this.listReward.visible = false;
                this.titleState.visible = false;
                this.imgGood.visible = false;
                this.boxReward.visible = false;
                this.imgLightimg.visible = false;
            }
        }
        //更新Bannar
        private reset2Banner(data: IGrassShoppingFestivalRecommendVo): void {
            if (data != null) {
                this.imgBigTitle.skin = `grassShoppingFestival/b_title_${data.bannarIndex}.png`;
                this.imgBanner_1.skin = `grassShoppingFestival/banner_1_${data.bannarIndex}.png`;
                this.imgBanner_2.skin = `grassShoppingFestival/banner_2_${data.bannarIndex}.png`;
                this.imgBanner_3.skin = `grassShoppingFestival/banner_3_${data.bannarIndex}.png`;
                this.imgBanner_4.skin = `grassShoppingFestival/banner_4_${data.bannarIndex}.png`;
            } else {
                this.imgBigTitle.skin = `grassShoppingFestival/b_title_4.png`;
                this.imgBanner_1.skin = this.imgBanner_2.skin = this.imgBanner_3.skin = this.imgBanner_4.skin =
                    `grassShoppingFestival/banner_4.png`;
            }
        }
        //分成奖励展示
        private reset2RewardShow(data: IGrassShoppingFestivalRecommendVo): void {
            if (data != null) {
                let arr: Array<{ id: number, cnt: number }> = [];
                for (let i: number = 0, j: number = data.recommendRewards.rewards.length; i < j; i++) {
                    arr.push({ id: data.recommendRewards.rewards[i], cnt: data.recommendRewards.cnts[i] });
                }
                this.listReward.array = arr;
                this.listReward.selectEnable = true;
            } else {
                this.listReward.array = [];
                this.listReward.selectEnable = false;
            }
        }
        //list奖励列表渲染
        private listRewardRender(item: ui.commonUI.item.RewardItemUI): void {
            const data: { id: number, cnt: number } = item.dataSource;
            if (data != null) {
                clientCore.GlobalConfig.setRewardUI(item, { id: data.id, cnt: data.cnt, showName: false });
                item.num.visible = true;
                item.visible = true;
            } else {
                item.visible = false;
            }
        }
        private listRewardSelect(index: number): void {
            const data: { id: number, cnt: number } = this.listReward.array[index];
            if (data != null) {
                clientCore.ToolTip.showTips(this.listReward.cells[index], { id: data.id });
            }
        }
        //更新中心奖励
        private reset2CenterReward(data: IGrassShoppingFestivalRecommendVo, isGedted: boolean): void {
            if (data != null && isGedted) {
                if (data.goodIndex != 6) {
                    this.imgGood.skin = `grassShoppingFestival/good_${data.goodIndex}.png`;
                } else {
                    const sex: number = clientCore.LocalInfo.sex;
                    this.imgGood.skin = `unpack/grassShoppingFestival/good_6_${sex}.png`;
                }
                this.imgGood.visible = true;
            } else {
                this.imgGood.visible = false;//没有奖励了
            }
        }
        //#region 事件处理
        private onShowRule(): void {
            alert.showRuleByID(this._model.ruleModuleId);
        }
        private onSuitShow(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }
        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnTrain://打开口才训练
                    this._eloPanel = new EloquenceTrainingClassPanel(+this.sign);
                    clientCore.DialogMgr.ins.open(this._eloPanel);
                    clientCore.Logger.sendLog('2021年7月9日活动', '【主活动】生草购物节', '点击口才训练班按钮');
                    break;
                case this.btnStartGet://推销或者领取
                    let id: number = this._model.getLastRecommendNoneFinished();
                    if (this.btnStartGet.fontSkin == `grassShoppingFestival/start_tx_txt.png`) {//推销
                        if (this.labEloquence.color == this._model.eloquenceColor[0]) {
                            alert.showFWords("口才差距过大，无法进行推销");
                        } else {
                            this._control.getPromote(id - 1).then(msg => {
                                if (msg.flag == 1) {//推销成功
                                    this.reset2BtnCommon(false);
                                    this._model.bit = util.setBit(this._model.bit, id, 1);
                                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.animationSuccTj[id - 1], this, this.onAnimateMoviePlayOver);
                                } else {
                                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.animationFailTj, this, this.onAnimateMoviePlayOver);
                                }
                                this.resetUI();
                            });
                        }
                    } else {//领取
                        if (id == null) {
                            id = 5;
                        } else {
                            id -= 2;
                            if (id < 0) {
                                id = 0;
                            }
                        }
                        this._control.getPromoteReward(id).then(msg => {
                            alert.showReward(msg.item);
                            this.resetUI();
                        });
                    }
                    break;
            }
        }

        private onAnimateMoviePlayOver(): void {
            // this.resetUI();
        }
        //#endregion

        public destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            this.listReward.renderHandler = null;
            this.listReward.selectedItem = null;
            clearTimeout(this._setT1);
            clearTimeout(this._setT2);
            if (this._eloPanel) {
                this._eloPanel.destroy();
                this._eloPanel = null;
            }
            super.destroy();
        }

    }
}