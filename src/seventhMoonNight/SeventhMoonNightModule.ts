namespace seventhMoonNight {
    /**
     * 七夕情人夜
     * seventhMoonNight.SeventhMoonNightModule
     * \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0813\【主活动】七夕情人夜(最新版)20210813_Carrot (2).docx
     */
    export class SeventhMoonNightModule extends ui.seventhMoonNight.SeventhMoonNightModuleUI {
        private _model: SeventhMoonNightModel;
        private _control: SeventhMoonNightControl;
        private _petAni: clientCore.Bone;
        //#region 各个panel
        private _createFlowerLightTipsPanel: CreateFlowerLightTipsPanel;
        private _playFlowerLightHandlerPanel: PlayFlowerLightHandlerPanel;
        private _gameFlowerLightPanel: GameFlowerLightPanel;
        /**3朵花灯效果*/
        private _eff3Flower: clientCore.Bone;
        /**水波效果*/
        private _effWater: clientCore.Bone;
        /**大灯效果*/
        private _effBigLight: clientCore.Bone;
        /**小灯效果*/
        private _effSmallLight: clientCore.Bone;

        //#endregion
        init(d: number): void {
            super.init(d);
            this.sign = clientCore.CManager.regSign(new SeventhMoonNightModel(), new SeventhMoonNightControl());
            this._model = clientCore.CManager.getModel(this.sign) as SeventhMoonNightModel;
            this._control = clientCore.CManager.getControl(this.sign) as SeventhMoonNightControl;
            this.addPreLoad(Promise.all([
                xls.load(xls.gameFlowerLight)
            ]));
        }

        async seqPreLoad(): Promise<any> {
            const msg: pb.sc_qixi_lover_night_info = await this._control.getPanelInfo();
            this._model.panelInfo = {
                poems: msg.poems,
                hua: msg.hua,
                rewardFlag: msg.rewardFlag
            };
        }

        initOver(): void {
            this.init2LeadPho();
            this.initMask2Material();
            this.init2Effs();
            this.reset2PoemsRed();
            this.reset2PoemStatus(true);
            this.reset2Materials();
            this.init2PetBody();
        }

        popupOver(): void {
            clientCore.UIManager.setMoneyIds([this._model.MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年8月13日活动', '【主活动】七夕情人夜', '打开本周活动主面板');
        }

        //#region 初始化
        private init2LeadPho(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/seventhMoonNight/pho_${sex}.png`;
        }

        private initMask2Material(): void {
            let cell: ui.seventhMoonNight.item.CreateRawMaterialItemUI;
            for (let i: number = 0; i < 2; i++) {
                cell = this[`c_${i + 1}`];
                cell.imgM.scaleX = cell.imgM.scaleY = 0.5;
            }
        }

        //创建花宝
        private init2PetBody(): void {
            this._petAni = clientCore.BoneMgr.ins.play(
                pathConfig.getflowerPetRes(clientCore.FlowerPetInfo.select.big, clientCore.FlowerPetInfo.select.little),
                "idle",
                true,
                this,
                {addChildAtIndex: this.getChildIndex(this.petIndex)}
            );
            this._petAni.pos(1072, 665);
            this._petAni.scaleX = this._petAni.scaleY = 0.7;
        }

        //初始化效果
        private init2Effs(): void {
            this._effWater = clientCore.BoneMgr.ins.play("res/animate/activity/qingrenjiezhumianban.sk", "zhuyemians_water", true, this, {
                addChildAtIndex: 0
            }, false, true);
            this._effWater.pos(Laya.stage.width / 2 - 50, Laya.stage.height / 2 - 50);
            this._eff3Flower = clientCore.BoneMgr.ins.play("res/animate/activity/qingrenjiezhumianban.sk", "zhuyemian_flower", true, this, {
                addChildAtIndex: 1
            }, false, true);
            this._eff3Flower.pos(Laya.stage.width / 2 - 50, Laya.stage.height / 2 - 100);
            this._effBigLight = clientCore.BoneMgr.ins.play("res/animate/activity/qingrenjiezhumianban.sk", "light1", true, this, null, false, true);
            this._effBigLight.pos(this.btnHelp.x + 20, 200);
            this._effSmallLight = clientCore.BoneMgr.ins.play("res/animate/activity/qingrenjiezhumianban.sk", "light2", true, this, {
                addChildAtIndex: 2
            }, false, true);
            this._effSmallLight.pos(this.btnHelp.x - 1200, 180);
        }

        //#endregion

        //#region 刷新
        //刷新诗句红点(显示情况)
        private reset2PoemsRed(): void {
            const reds: Array<number> = this._model.getPoemReds();
            for (let i: number = 0, j: number = reds.length; i < j; i++) {
                this[`red_${i + 1}`].visible = reds[i] == 1;
            }
        }

        private reset2PoemStatus(isInit: boolean, index: number = null): void {
            const status: number[] = this._model.getPoemsHavedStatus();
            for (let i: number = 0, j: number = status.length; i < j; i++) {
                this[`s_${i + 1}`].visible = status[i] == 1;
            }
            if (this._model.isPoem7CanGetting()) {
                alert.showSmall("你已经集齐所有诗句,请领取你的奖励!", {
                    btnType: alert.Btn_Type.ONLY_SURE,
                    callBack: {
                        funArr: [this.getLast7PomeReward],
                        caller: this
                    }
                });
            }
            if (!isInit && index != null) {
                this.reset2PoemsRed();//需要刷新红点
            }
        }

        //领取最后一个诗句奖励
        private getLast7PomeReward(): void {
            this._control.getPoemsReward(7).then((msg) => {
                alert.showReward(msg.item);
                this._model.panelInfo.rewardFlag = util.setBit(this._model.panelInfo.rewardFlag, 7, 1);
                this.reset2PoemsRed();
            });
        }

        //初始化原料
        private reset2Materials(isReset: boolean = true): void {
            const m: Array<IMaterialCreateVo> = isReset ? this._model.getCurCreateMaterial() : this._model.curCreateMaterials.material;
            let cell: ui.seventhMoonNight.item.CreateRawMaterialItemUI;
            const doUI: (ui: ui.seventhMoonNight.item.CreateRawMaterialItemUI, data: IMaterialCreateVo) => void = (ui, data) => {
                ui.labProgess.text = `${clientCore.ItemsInfo.getItemNum(data.id)}/${data.cnt}`;
                ui.imgM.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            };
            for (let i: number = 0, j: number = m.length; i < j; i++) {
                cell = this[`c_${i + 1}`];
                doUI(cell, m[i]);
            }
        }

        //#endregion

        addEventListeners() {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuitShow);
            BC.addEvent(this, this.btnHeart, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnReset, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnCreate, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.imgPho, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnBigFime, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.c_1, Laya.Event.CLICK, this, this.onShowMaterial, [0]);
            BC.addEvent(this, this.c_2, Laya.Event.CLICK, this, this.onShowMaterial, [1]);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.CLOSE_CreateFlowerLightTipsPanel, this, this.onCloseCreateFlowerLightTipsPanel);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.CLOSE_PlayFlowerLightHandlerPanel, this, this.onClosePlayFlowerLightHandlerPanel);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.CLOSE_GameFlowerLightPanel, this, this.onCloseGameFlowerLightPanel);
            BC.addEvent(this, EventManager, globalEvent.CLOSE_ANWEREXTREWARD_MODULE, this, this.onHeartReward);
            for (let i: number = 0; i < 6; i++) {
                BC.addEvent(this, this[`poem_${i + 1}`], Laya.Event.CLICK, this, this.onPoemClickHandler, [i + 1]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        /**
         * 领取诗句奖励
         */
        private onPoemClickHandler(index: number): void {
            const type: number = this._model.getPoemRewardStatus(index);
            if (type == 0) {
                alert.showFWords("此诗句尚未收集齐");
            } else if (type == 2) {
                alert.showFWords("您已经领取了此奖励");
            } else {
                this._control.getPoemsReward(index).then((msg) => {
                    alert.showReward(msg.item);
                    this._model.panelInfo.rewardFlag = util.setBit(this._model.panelInfo.rewardFlag, index, 1);
                    this.reset2PoemsRed();
                });
            }
        }

        /**
         * 展示生产材料获取途径
         */
        private onShowMaterial(index: number): void {
            const data: IMaterialCreateVo = this._model.curCreateMaterials.material[index];
            clientCore.ToolTip.showTips(this[`c_${index + 1}`], {id: data.id});
        }

        /**
         * 心有灵犀的诗文奖励的更新
         */
        private onHeartReward(data: pb.sc_notify_map_game_finished): void {
            if (!data || !data.poems || data.poems == 0) return;
            this._model.panelInfo.poems = util.setBit(this._model.panelInfo.poems, data.poems, 1);//更新已经获得的诗文
            this.reset2PoemStatus(false, data.poems == 0 ? null : data.poems);//刷新诗句的奖励
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnHeart://心有灵夕
                    clientCore.ModuleManager.open("answer.AnswerRuleModule");
                    clientCore.Logger.sendLog('2021年8月13日活动', '【主活动】七夕情人夜', '打开心有灵夕界面');
                    break;
                case this.btnReset://重置材料
                    this.showCreateFlowerLightTipsPanel(CreateFlowerLightTipsPanelCBType.INSUFFICIENT, null);
                    break;
                case this.btnCreate://创建花灯
                    if (this._model.isMaterialEnough()) {
                        if (!this._model.isDailyCreateMax()) {
                            this._control.makeFlowerLight(this._model.curCreateMaterials.index).then(msg => {
                                this.showCreateFlowerLightTipsPanel(CreateFlowerLightTipsPanelCBType.FINISHED, msg);
                            });
                        } else {
                            alert.showFWords("啊，花宝今天累了呢，明天我们再接着做吧~啾咪~");
                        }
                    } else {
                        alert.showFWords("材料不足");
                    }
                    break;
                case this.imgPho://放花灯
                    this._playFlowerLightHandlerPanel = new PlayFlowerLightHandlerPanel(this.sign);
                    clientCore.DialogMgr.ins.open(this._playFlowerLightHandlerPanel);
                    break;
                case this.btnBigFime://跳转至大电影
                    this.destroy();
                    clientCore.ModuleManager.open("linkageWithFilm.LinkageWithFilmModule");
                    break;
            }
        }

        private showCreateFlowerLightTipsPanel(data: CreateFlowerLightTipsPanelCBType = CreateFlowerLightTipsPanelCBType.FINISHED, msg: pb.sc_qixi_lover_night_make_hua): void {
            this._createFlowerLightTipsPanel = new CreateFlowerLightTipsPanel(this.sign, data, msg);
            clientCore.DialogMgr.ins.open(this._createFlowerLightTipsPanel);
        }

        private onShowRule(): void {
            alert.showRuleByID(this._model.MAIN_RULE_ID);
        }

        private onSuitShow(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.SUIT_ID);
        }

        private clearEff(cell: clientCore.Bone): void {
            if (!cell) return;
            cell.dispose(true);
        }

        private clearAllEff(): void {
            this.clearEff(this._eff3Flower);
            this.clearEff(this._effWater);
            this.clearEff(this._effBigLight);
            this.clearEff(this._effSmallLight);
            this._eff3Flower = null;
            this._effWater = null;
            this._effBigLight = null;
            this._effSmallLight = null;
        }

        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            this.clearAllEff();
            if (this._petAni) {
                this._petAni.dispose();
                this._petAni = null;
            }
            if (this._createFlowerLightTipsPanel) {
                this._createFlowerLightTipsPanel.destroy();
                this._createFlowerLightTipsPanel = null;
            }
            if (this._playFlowerLightHandlerPanel) {
                this._playFlowerLightHandlerPanel.destroy();
                this._playFlowerLightHandlerPanel = null;
            }
            if (this._gameFlowerLightPanel) {
                this._gameFlowerLightPanel.destroy();
                this._gameFlowerLightPanel = null;
            }
            super.destroy();
        }

        /**
         * 显示结算面板
         */
        private showGameEnd(msg: pb.sc_qixi_lover_night_hua_reward) {
            let panel = new GameEndPanel();
            panel.initUI(msg);
            clientCore.DialogMgr.ins.open(panel);
        }

        //#region 关闭panel
        private onCloseCreateFlowerLightTipsPanel(data: CreateFlowerLightTipsPanelCBType, msg: pb.sc_qixi_lover_night_make_hua): void {
            if (this._createFlowerLightTipsPanel) {
                this._createFlowerLightTipsPanel = null;
            }
            switch (data) {
                case seventhMoonNight.CreateFlowerLightTipsPanelCBType.INSUFFICIENT:
                    this.reset2Materials();//切换制作材料
                    break;
                case seventhMoonNight.CreateFlowerLightTipsPanelCBType.FINISHED://制作花灯完成
                    alert.showReward(msg.item);//弹出奖励
                    this.reset2Materials(false);
                    break;
            }
        }

        private onClosePlayFlowerLightHandlerPanel(isSucc: boolean): void {
            if (this._playFlowerLightHandlerPanel) {
                this._playFlowerLightHandlerPanel = null;
            }
            if (isSucc) {//弹出小游戏界面
                this._gameFlowerLightPanel = new GameFlowerLightPanel(this.sign);
                clientCore.DialogMgr.ins.open(this._gameFlowerLightPanel);
            }
        }

        private onCloseGameFlowerLightPanel(isSucc: boolean): void {
            if (this._gameFlowerLightPanel) {
                this._gameFlowerLightPanel = null;
            }
            if (isSucc) {
                this._control.getGameSuccReward(1, this._model._curPlayFlower.index).then((msg) => {
                    this.showGameEnd(msg);
                    if (msg.poems != 0) {
                        this._model.panelInfo.poems = util.setBit(this._model.panelInfo.poems, msg.poems, 1);//更新已经获得的诗文
                        this.reset2PoemStatus(false, msg.poems == 0 ? null : msg.poems);//刷新诗句的奖励
                    }
                });
            }
        }

        //#endregion
    }
}