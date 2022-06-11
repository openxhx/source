namespace spacetimeDetective {
    /**
     * 时空侦探
     * spacetimeDetective.SpacetimeDetectiveModule
     * \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0730\【主活动】时空侦探20210730_inory.docx
     */
    export class SpacetimeDetectiveModule extends ui.spacetimeDetective.SpacetimeDetectiveModuleUI {
        private _model: SpacetimeDetectiveModel;
        private _control: SpacetimeDetectiveControl;
        private _countDownSupport: CountDownSupport;
        private _walkEff: WalkEffect;
        private _curCapter: number;
        private _curOpenDoors: number[];
        private _fun2Eff: clientCore.Bone;//答题骨骼动画
        //#region 各个panel
        private _answerQuestionPanel: AnswerQuestionPanel;
        private _challengeRabbitPanel: ChallengeRabbitPanel;
        private _recallNotesPanel: RecallNotesPanel;
        //#endregion
        init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new SpacetimeDetectiveModel(), new SpacetimeDetectiveControl());
            this._model = clientCore.CManager.getModel(this.sign) as SpacetimeDetectiveModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpacetimeDetectiveControl;
            this.addPreLoad(Promise.all([
                xls.load(xls.eventControl),
                xls.load(xls.miniAnswer)
            ]));
        }
        async seqPreLoad(): Promise<void> {
            const msg: pb.sc_space_time_detective_info = await this._control.getPanelInfo();
            this._model.capterInfo = {
                flag: msg.flag,
                clue: msg.clue,
                light: msg.light,
                game: msg.game,
                num: msg.num
            };
        }
        initOver(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/spacetimeDetective/suit_${sex}.png`;
            this.reset2Support();
            this.reset2UpLimit();
            this.reset2Capter();
        }
        popupOver(): void {
            clientCore.UIManager.setMoneyIds(this._model.MONEY_IDs);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '打开主活动面板');
        }
        //#region 事件注册及注销
        addEventListeners(): void {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnHome, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuitShow);
            BC.addEvent(this, this.btnZTS, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnSupport, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btn_c_1, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btn_c_22, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btn_c_21, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnCollect, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btn_a_1, Laya.Event.CLICK, this, this.onArrowClcikHandler);
            BC.addEvent(this, this.btn_a_2, Laya.Event.CLICK, this, this.onArrowClcikHandler);
            BC.addEvent(this, this.btn_a_3, Laya.Event.CLICK, this, this.onArrowClcikHandler);
            BC.addEvent(this, this.btnCircle, Laya.Event.CLICK, this, this.onCircleClickHandler);
            // BC.addEvent(this, EventManager, scene.battle.BattleConstant.FIGHT_FINISH, this, this.onBattleOver);
            BC.addEvent(this, EventManager, SpacetimeDetectiveEventType.CLOSE_AnswerQuestionPanel, this, this.onClosePanel2AnswerQuestion);
            BC.addEvent(this, EventManager, SpacetimeDetectiveEventType.CLOSE_ChallengeRabbitPanel, this, this.onClosePanel2ChallengeRabbit);
            BC.addEvent(this, EventManager, SpacetimeDetectiveEventType.CLOSE_RecallNotesPanel, this, this.onClosePanel2RecallNotes);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        //#endregion
        // private onBattleOver(msg: pb.sc_battle_finish): void {
        //     if (msg.result == 1) {//当战斗胜利,请求下一个Fun
        //         this.checkFunGameOver();
        //     }
        // }
        //#region 关闭panel
        private onClosePanel2AnswerQuestion(isSucc: boolean): void {
            if (this._answerQuestionPanel) {
                this._answerQuestionPanel = null;
            }
            if (isSucc) {
                this.checkFunGameOver();
            }
        }
        private onClosePanel2ChallengeRabbit(isSucc: boolean): void {
            if (this._challengeRabbitPanel) {
                this._challengeRabbitPanel = null;
            }
        }
        private onClosePanel2RecallNotes(isSucc: boolean): void {
            if (this._recallNotesPanel) {
                this._recallNotesPanel = null;
            }
            //TODO
        }
        //#endregion

        //#region 各种刷新
        //刷新支援部分
        private reset2Support(): void {
            if (this._model.capterInfo.flag == 0) {//今日还没有领取
                this.s_zy.visible = true;
                this.s_nextZy.visible = false;
            } else {//需要倒计时
                this.s_zy.visible = false;
                this.s_nextZy.visible = true;
                if (!this._countDownSupport) {
                    this._countDownSupport = new CountDownSupport(this.onCallbackHandler, this.labCd, this._model);
                }
                this._countDownSupport.start();
            }
        }
        //刷新每日上限
        private reset2UpLimit(): void {
            this.labDailyUPLimit.text = `每日上限${this._model.capterInfo.num}/${this._model.DAILY_UPLIMIT}`;
        }
        /**
         * 是否才能在章节跳转
         */
        private doCapterGoto(curCapter: number): boolean {
            if (this._model.capterInfo.clue >= 5) {
                this.labLocation.text = this._curCapter != null ? this._model.CAPTER_NAMEs[this._curCapter] : "";
                this.setBtnCirCle(2);
                this.btn_c_1.visible = false;
                this.btn_c_21.visible = false;

                this.setFun(null);
                this.setVortex4NextCapter(null);
                this.setBubble4Others(null);
                this.setBubble4Self(null);
                this.setArrow(null);
                this.scene_over.visible = false;
                if (this._curCapter == null) {//计入下一页
                    this.setSence(null);
                    this.enterNextCapter();
                } else {//全部做完
                    this.setSence(this._curCapter);
                    this.setLighting(true);
                    this.gotoSceneOver();
                    this.setBtnCirCle(0);
                }
                return true;
            }
            return false;
        }

        //刷新章节
        private reset2Capter(): void {
            this._curCapter = this._model.getCurrentCapter();
            this.setBookIcon(false);
            this.setBtnCirCle(0);
            //特殊的情况判断 - 当游戏已经完成5个
            if (this.doCapterGoto(this._curCapter)) {
                return;
            }
            this.labLocation.text = this._curCapter != null ? this._model.CAPTER_NAMEs[this._curCapter] : "";
            this.btn_c_1.visible = false;
            this.setSence(this._curCapter);
            this.setFun(null);
            this.setVortex4NextCapter(null);
            if (this._curCapter == null) {//所有的章节都已经完成
                this.btn_c_21.visible = true;
                this.btn_c_22.visible = false;
                this.setAllCaptersOver();
                this.setBubble4Others(null);
                this.setLighting(null);
                this.scene_over.visible = true;
                this.setArrow(this._curCapter, null);
                return;
            }
            this.scene_over.visible = false;
            this.btn_c_21.visible = false;
            if (this._model.capterInfo.light == 0) {//还没有点亮
                this.setLighting(false);
                this.setDoor(this._curCapter, null);
                this.setArrow(this._curCapter, null);
                this.setBubble4Self(0);
                this.setBubble4Others(null);
                this.btn_c_22.visible = true;
                if (this._curCapter != null) {
                    //先点亮灯光
                    const bCfg: IButtonCfg = this._model.RED_BTN_CFG[0];
                    this.setHuaBtn(bCfg, this.btn_c_22, this._model.LIGHTING_PAY[this._curCapter][0]);
                }
                if (this._curCapter != null) {
                    this.setBtnCirCle(1, this._model.LIGHTING_PAY[this._curCapter][1]);
                } else {
                    this.setBtnCirCle(2);
                }
            } else {//已经点亮
                this.setLighting(true);
                this._curOpenDoors = this._model.getOpenDoor();
                this.setDoor(this._curCapter, this._curOpenDoors);
                this.setArrow(this._curCapter, this._curOpenDoors);
                this.setBubble4Self(1);
                this.setBubble4Others(null);
                this.btn_c_22.visible = this.bConsume.visible = false;
            }
        }
        //#endregion
        //#region 各种UI设置
        /**
         * 0/null: 隐藏
         * 1: 点亮
         * 2: 笔记
         */
        private setBtnCirCle(type: number, num?: number): void {
            if (type == null || type == 0) {
                this.bLeftBottom.visible = false;
                return;
            }
            this.bLeftBottom.visible = true;
            if (type == 1) {
                this.iconCiecleBlock.visible = this.labSY.visible = true;
                this.labSY.text = `消耗 ${num}`;
                this.btnCircle.fontSkin = `spacetimeDetective/txtb_sylinghing.png`;
            } else if (type == 2) {
                this.iconCiecleBlock.visible = this.labSY.visible = false;
                this.btnCircle.fontSkin = `spacetimeDetective/txtb_viewnote_1.png`;
            }
        }
        //书本图标设置
        private setBookIcon(show: boolean, index: number = 0): void {
            if (!show) {
                this.btnBook.visible = false;
            } else {
                this.btnBook.visible = true;
                this.btnBook.index = index;
            }
        }
        //设置通用按钮
        private setHuaBtn(bCfg: IButtonCfg, target: HuaButton, xh?: number): void {
            target.fontSkin = bCfg.skin;//点亮灯光
            target.fontX = bCfg.offX;
            target.fontY = bCfg.offY;
            if (bCfg.hasConsume) {
                this.bConsume.visible = true;
                this.labFire.text = `消耗 ${xh}`;
                this.set2FireConsume(target);
            } else {
                this.bConsume.visible = false;
            }
        }
        //设置Fire消耗UI
        private set2FireConsume(target: Laya.Button): void {
            const labW: number = this.labFire.text.length * this.labFire.fontSize;
            this.iconFire.x = labW - 25;
            const allW: number = this.iconFire.x + this.iconFire.width;
            this.bConsume.x = target.x - (allW >> 1);
            this.bConsume.y = target.y;
        }
        //设置灯是否点亮
        private setLighting(light: boolean): void {
            if (light == null) {
                this.imgOffLightLeft.visible = this.imgOffLightRight.visible = this.imgNightScene.visible = this.imgOnLightLeft.visible = this.imgOnLightRight.visible = false;
            } else {
                if (light) {
                    this.imgOffLightLeft.visible = this.imgOffLightRight.visible = this.imgNightScene.visible = false;
                    this.imgOnLightLeft.visible = this.imgOnLightRight.visible = true;
                } else {
                    this.imgOffLightLeft.visible = this.imgOffLightRight.visible = this.imgNightScene.visible = true;
                    this.imgOnLightLeft.visible = this.imgOnLightRight.visible = false;
                }
            }
        }
        /**
         * 设置场景
         */
        private setSence(curCapter: number): void {
            if (curCapter == null) {
                this.scene_1.visible = this.scene_2.visible = this.scene_3.visible = false;
            } else {
                const index: number = this._model.CAPTER_SCENEs[curCapter];
                for (let i: number = 0; i < 3; i++) {
                    if (i + 1 == index) {
                        this[`scene_${i + 1}`].visible = true;
                    } else {
                        this[`scene_${i + 1}`].visible = false;
                    }
                }
            }
        }
        //设置门的开关状态
        private setDoor(curCapter: number, arr: Array<number> = null): void {
            if (curCapter == null) {
                return;
            }
            let i: number, j: number;
            const index: number = this._model.CAPTER_SCENEs[curCapter];
            if (arr == null || arr.length == 0) {//全部关闭
                for (i = 0, j = 3; i < j; i++) {
                    this[`open_${index}_${i + 1}`].visible = false;
                }
                this[`close_${index}`].visible = true;
            } else {//打开相关
                for (i = 0, j = 3; i < j; i++) {
                    this[`open_${index}_${i + 1}`].visible = arr.indexOf(i + 1) >= 0;
                    if (i + 1 == 2) {
                        this[`close_${index}`].visible = arr.indexOf(i + 1) < 0;
                    }
                }
            }
        }
        /**玩法设置*/
        private setFun(index: number): void {
            if (index == null || index == 0) {//隐藏掉所有的玩法
                this.fun_1.visible = this.fun_3.visible = this.fun_4.visible = false;
                this.setAnswerAnimation(0);
            } else {
                for (let i: number = 0; i < 4; i++) {
                    if (i + 1 != 2) {
                        this[`fun_${i + 1}`].visible = i + 1 == index;
                    } else {
                        if (i + 1 == index) {
                            this.setAnswerAnimation(1);
                        } else {
                            this.setAnswerAnimation(0);
                        }
                    }
                }
            }
        }
        /**0 : 隐藏 , 1: idle , 2: fire*/
        private setAnswerAnimation(type: number, callback?: () => void): void {
            this.clearFun2Animation();
            if (type == 0) {
                return;
            } else if (type == 1) {
                this._fun2Eff = clientCore.BoneMgr.ins.play("res/animate/activity/mailuxiang.sk", "idle", true, this, {
                    addChildAtIndex: this.getChildIndex(this.fun_4)
                }, false, true);
                this._fun2Eff.pos(557, 436);
                this._fun2Eff.scaleX = this._fun2Eff.scaleY = 0.4;
            } else if (type == 2) {
                this._fun2Eff = clientCore.BoneMgr.ins.play("res/animate/activity/mailuxiang.sk", "fire", false, this, {
                    addChildAtIndex: this.getChildIndex(this.fun_4)
                });
                this._fun2Eff.pos(557, 436);
                this._fun2Eff.scaleX = this._fun2Eff.scaleY = 0.4;
                this._fun2Eff.once(Laya.Event.COMPLETE, this, (e) => {
                    this.clearFun2Animation();
                    callback();
                });
            }
        }

        /**设置方向箭头 */
        private setArrow(curCapter: number, arr: Array<number> = null): void {
            if (curCapter == null || arr == null || arr.length == 0) {
                this.btn_a_1.visible = this.btn_a_2.visible = this.btn_a_3.visible = false;
            } else {
                for (let i: number = 0; i < 3; i++) {
                    this[`btn_a_${i + 1}`].visible = arr.indexOf(i + 1) >= 0;
                }
            }
        }
        /**设置我方气泡 */
        private setBubble4Self(index: number): void {
            if (index == null) {
                this.selfPP.visible = false;
            } else {
                this.selfPP.visible = true;
                this.labSelfPP.text = this._model.SELF_BUBBLE_TALKs[index];
            }
        }
        /**设置其他气泡 */
        private setBubble4Others(index: number): void {
            if (index == null) {
                this.otherPP.visible = false;
            } else {
                this.otherPP.visible = true;
                this.labOtherPP.text = this._model.OTHER_BUBBLE_TALKs[index];
            }
        }
        /**设置下一章漩涡 */
        private setVortex4NextCapter(curCapter: number): void {
            if (curCapter == null) {
                this.btnNextCapter.visible = false;
            } else {
                this.btnNextCapter.visible = true;
            }
        }
        //#endregion

        private onShowRule(): void {
            alert.showRuleByID(this._model.MAIN_RULE_ID);
            clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '点击活动规则按钮');
        }
        private onSuitShow(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.SUIT_ID);
        }
        //箭头上的点击
        private onArrowClcikHandler(e: Laya.Event): void {
            if (this._model.capterInfo.game == 0) {
                this._control.getFunIndex().then(msg => {
                    this._model.capterInfo.game = msg.game;//获得
                    this.setArrow(null);//隐藏箭头
                    this.setBubble4Self(null);//隐藏我的气泡
                    //模拟行走动画
                    this.playWalkEff();
                });
            } else {
                this.setArrow(null);//隐藏箭头
                this.setBubble4Self(null);//隐藏我的气泡
                this.playWalkEff();
            }
        }

        private playWalkEff(): void {
            const index: number = this._model.CAPTER_SCENEs[this._curCapter];
            if (!this._walkEff) {
                this._walkEff = new WalkEffect(this[`scene_${index}`], this.imgOnLightLeft, this.imgOnLightRight);
            } else {
                this._walkEff.resetScene(this[`scene_${index}`]);
            }
            this._walkEff.start().then(() => {
                this.onWalkEffOver();
            });
        }
        //行走动画播放结束
        private onWalkEffOver: () => void = () => {
            this.setFun(this._model.capterInfo.game);//展示相应的功能
            switch (this._model.capterInfo.game) {
                case 1://战斗
                    this.reset2ChallengeFun();
                    break;
                case 2://答题
                    this.reset2AnswersFun();
                    break;
                case 3://解锁
                    this.reset2UnlockFun();
                    break;
                case 4://篝火
                    this.reset2BonfireFun();
                    break;
            }
        };

        //#region 各个funGame的处理
        /**篝火游戏状态*/
        private reset2BonfireFun(): void {
            this.btn_c_1.visible = this.btn_c_22.visible = this.bConsume.visible = false;
            this.btn_c_21.visible = true;
            const bCfg: IButtonCfg = this._model.GREEN_BTN_BOTTOM_GCF[0];
            this.setHuaBtn(bCfg, this.btn_c_21);
            this.setBubble4Self(5);
        }
        /**解锁游戏状态 */
        private reset2UnlockFun(): void {
            this.btn_c_1.visible = this.btn_c_22.visible = true;
            this.btn_c_21.visible = false;
            let bCfg: IButtonCfg = this._model.GREEN_BTN_UP_GCF[0];
            this.setHuaBtn(bCfg, this.btn_c_1);
            bCfg = this._model.RED_BTN_CFG[1];
            this.setHuaBtn(bCfg, this.btn_c_22);
            this.setBubble4Self(3);
            this.setBubble4Others(2);
        }
        /**答题游戏状态 */
        private reset2AnswersFun(): void {
            this.btn_c_1.visible = this.btn_c_22.visible = true;
            this.btn_c_21.visible = false;
            let bCfg: IButtonCfg = this._model.GREEN_BTN_UP_GCF[1];
            this.setHuaBtn(bCfg, this.btn_c_1);
            bCfg = this._model.RED_BTN_CFG[2];
            this.setHuaBtn(bCfg, this.btn_c_22, this._model.ANSWER_FIRE_PAY);
            this.setBubble4Self(3);
            this.setBubble4Others(1);
        }
        /**挑战小白兔游戏状态 */
        private reset2ChallengeFun(): void {
            this.btn_c_1.visible = this.btn_c_22.visible = false;
            this.btn_c_21.visible = true;
            let bCfg: IButtonCfg = this._model.GREEN_BTN_BOTTOM_GCF[5];
            this.setHuaBtn(bCfg, this.btn_c_21);
            this.setBubble4Self(9);//2
            this.setBubble4Others(0);
        }
        //#endregion

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnZTS://夏日侦探社
                    this.destroy();
                    clientCore.ModuleManager.open("schoolFlower.SchoolFlowerModule");
                    clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '点击夏日侦探社按钮');
                    break;
                case this.btnSupport://侦探支援
                    if (this._model.capterInfo.flag == 1) return;
                    this._control.getSupportReward().then(msg => {
                        this._model.capterInfo.flag = 1;
                        this.reset2Support();//刷新
                        alert.showReward(msg.item);
                    });
                    clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '点击侦探支援按钮');
                    break;
                case this.btnCollect://连连看
                    clientCore.ToolTip.gotoMod(176, "3");
                    clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '点击收集火光按钮');
                    break;
                case this.btn_c_1:
                    switch (this.btn_c_1.fontSkin) {
                        case this._model.GREEN_BTN_UP_GCF[0].skin://解锁(迷之匣)
                            //TODO - Panel
                            break;
                        case this._model.GREEN_BTN_UP_GCF[1].skin://答题
                            this._answerQuestionPanel = new AnswerQuestionPanel(this.sign);
                            clientCore.DialogMgr.ins.open(this._answerQuestionPanel);
                            break;
                    }
                    break;
                case this.btn_c_22:
                    switch (this.btn_c_22.fontSkin) {
                        case this._model.RED_BTN_CFG[0].skin://点亮灯逻辑
                            if (clientCore.MoneyManager.getNumById(this._model.MONEY_IDs[0]) >= this._model.LIGHTING_PAY[this._curCapter][0]) {
                                this._control.lightingCapter(this._model.getCurrentCapter(), 1).then(msg => {
                                    this._model.capterInfo.light = 1;
                                    this.reset2Capter();//刷新章节
                                });
                            } else {
                                alert.showFWords("回忆火光不足!");
                            }
                            break;
                        case this._model.RED_BTN_CFG[1].skin://放弃解锁
                            this._control.getUnlockReward(2).then(msg => {
                                this.checkFunGameOver();
                            });
                            break;
                        case this._model.RED_BTN_CFG[2].skin://缴钱(答题)
                            if (clientCore.MoneyManager.getNumById(this._model.MONEY_IDs[0]) >= this._model.ANSWER_FIRE_PAY) {
                                alert.showSmall(`是否花费${this._model.ANSWER_FIRE_PAY}回忆火光完成答题？`, {
                                    callBack: {
                                        caller: this, funArr: [() => {
                                            this._control.getAnswerReward(2, 0).then(msg => {
                                                this.setAnswerAnimation(2, this.checkFunGameOver.bind(this));//动画播放完毕后进入到下一个Fun或下一个章节
                                            });
                                        }]
                                    }
                                });
                            } else {
                                alert.showFWords("回忆火光不足!");
                            }
                            break;
                    }
                    break;
                case this.btn_c_21:
                    switch (this.btn_c_21.fontSkin) {
                        case this._model.GREEN_BTN_BOTTOM_GCF[0].skin://篝火,触摸火光
                            this._control.getBonfireReward().then(msg => {
                                alert.showReward(msg.item, null, {
                                    callBack: {
                                        funArr: [this.checkFunGameOver],
                                        caller: this
                                    }
                                });
                            });
                            break;
                        case this._model.GREEN_BTN_BOTTOM_GCF[1].skin://进入, 漩涡
                            this.setSence(null);//隐藏所有场景
                            this.setBubble4Self(null);
                            this.setBubble4Others(null);
                            this.scene_over.visible = true;
                            this.setBookIcon(true, 0);
                            this.setVortex4NextCapter(null);
                            this.btn_c_1.visible = this.btn_c_22.visible = this.bConsume.visible = false;
                            this.btn_c_21.visible = true;
                            const bCfg: IButtonCfg = this._model.GREEN_BTN_BOTTOM_GCF[2];//拾取
                            this.setLighting(null);
                            this.setHuaBtn(bCfg, this.btn_c_21);
                            this.setBubble4Self(6);
                            this.setBtnCirCle(2, null);
                            break;
                        case this._model.GREEN_BTN_BOTTOM_GCF[2].skin://拾取
                            this._control.getCapterReward(this._curCapter).then(msg => {
                                alert.showReward(msg.item, null, {
                                    callBack: {
                                        funArr: [
                                            this.enterNextCapter
                                        ], caller: this
                                    }
                                });
                            });
                            break;
                        case this._model.GREEN_BTN_BOTTOM_GCF[3].skin://前往下一章
                            this._model.capterInfo.game = 0;
                            this._model.capterInfo.light = 0;
                            this._model.capterInfo.clue = 0;
                            this.reset2Capter();//刷新章节
                            break;
                        case this._model.GREEN_BTN_BOTTOM_GCF[4].skin://查看笔记
                            this._recallNotesPanel = new RecallNotesPanel(this.sign);
                            clientCore.DialogMgr.ins.open(this._recallNotesPanel);
                            clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '点击查看笔记按钮');
                            break;
                        case this._model.GREEN_BTN_BOTTOM_GCF[5].skin://战斗
                            this._challengeRabbitPanel = new ChallengeRabbitPanel(this.sign);
                            clientCore.DialogMgr.ins.open(this._challengeRabbitPanel);
                            break;
                    }
                    break;
            }
        }
        //圆形按钮的点击处理
        private onCircleClickHandler(e: Laya.Event): void {
            switch (this.btnCircle.fontSkin) {
                case `spacetimeDetective/txtb_sylinghing.png`://神叶点亮
                    if (clientCore.MoneyManager.getNumById(this._model.MONEY_IDs[1]) >= this._model.LIGHTING_PAY[this._curCapter][1]) {
                        alert.showSmall(`是否花费${this._model.LIGHTING_PAY[this._curCapter][1]}神叶点亮灯火？`, {
                            callBack: {
                                caller: this, funArr: [() => {
                                    this._control.lightingCapter(this._model.getCurrentCapter(), 2).then(msg => {
                                        this._model.capterInfo.light = 1;
                                        this.reset2Capter();//刷新章节
                                    });
                                }]
                            }
                        });
                    } else {
                        alert.showFWords("神叶不足!");
                    }
                    break;
                case `spacetimeDetective/txtb_viewnote_1.png`://查看笔记
                    this._recallNotesPanel = new RecallNotesPanel(this.sign);
                    clientCore.DialogMgr.ins.open(this._recallNotesPanel);
                    clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', '点击查看笔记按钮');
                    break;
            }
        }
        //fun完毕后检测
        private checkFunGameOver(): void {
            this._model.capterInfo.clue++;
            if (this._curCapter != null) {
                clientCore.Logger.sendLog('2021年7月30日活动', '【主活动】时空侦探', `完成${this._curCapter + 1}-${this._model.capterInfo.clue}`);
            }
            if (this._model.capterInfo.clue >= 5) {//本章已经完结
                this.gotoSceneOver();
                return;
            }
            //计入下一个Fun/线索
            this._model.capterInfo.game = 0;
            this.reset2Capter();//刷新章节(进入到下一个Fun)
        }
        //进入每张的完结篇
        private gotoSceneOver(): void {
            this.setDoor(this._curCapter, [2]);
            this.setVortex4NextCapter(this._curCapter);
            this.btn_c_1.visible = this.btn_c_22.visible = this.bConsume.visible = false;
            this.btn_c_21.visible = true;
            const bCfg: IButtonCfg = this._model.GREEN_BTN_BOTTOM_GCF[1];//进入
            this.setHuaBtn(bCfg, this.btn_c_21);
            this.setFun(null);
            this.setBubble4Self(4);
            this.setBtnCirCle(0);
            this.setBubble4Others(null);
        }
        //进入到下一个章节
        private enterNextCapter(): void {
            this._curCapter = this._model.getCurrentCapter();
            this.btn_c_1.visible = this.btn_c_22.visible = false;
            this.btn_c_21.visible = true;
            let bCfg: IButtonCfg;
            this.setBubble4Others(null);
            if (this._curCapter != null) {
                bCfg = this._model.GREEN_BTN_BOTTOM_GCF[3];
                this.setHuaBtn(bCfg, this.btn_c_21);
                this.setBubble4Self(7);
                this.setBookIcon(false);
                this.setVortex4NextCapter(this._curCapter);
            } else {
                this.setAllCaptersOver();
            }
        }
        //所有的章节都完毕
        private setAllCaptersOver(): void {
            this.setBookIcon(true, 1);
            let bCfg: IButtonCfg = this._model.GREEN_BTN_BOTTOM_GCF[4];
            this.setHuaBtn(bCfg, this.btn_c_21);
            this.setBubble4Self(8);
            this.setBtnCirCle(2, null);
            this.labLocation.visible = this.iconLocation.visible = false;
        }
        //回到处理
        private onCallbackHandler: (tag: string, data: any, ...arg) => void = (tag, data, arg) => {
            switch (tag) {
                case "cd_e"://倒计时返回
                    switch (data as ActivityTimeType) {
                        case ActivityTimeType.GAMEING:
                            this._model.capterInfo.flag = 0;
                            this.reset2Support();
                            break;
                        case ActivityTimeType.NONE_START:
                            alert.showFWords("活动还未开始!");
                            break;
                        case ActivityTimeType.OVER:
                            alert.showFWords("活动已经结束!");
                            break;
                    }
                    break;
            }
        };

        private clearFun2Animation(): void {
            if (this._fun2Eff) {
                this._fun2Eff.dispose();
                this._fun2Eff = null;
            }
        }

        destroy(): void {
            this.clearFun2Animation();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            if (this._countDownSupport) {
                this._countDownSupport.destroy();
                this._countDownSupport = null;
            }
            if (this._walkEff) {
                this._walkEff.destroy();
                this._walkEff = null;
            }
            if (this._answerQuestionPanel) {
                this._answerQuestionPanel.destroy();
                this._answerQuestionPanel = null;
            }
            if (this._challengeRabbitPanel) {
                this._challengeRabbitPanel.destroy();
                this._challengeRabbitPanel = null;
            }
            if (this._recallNotesPanel) {
                this._recallNotesPanel.destroy();
                this._recallNotesPanel = null;
            }
            super.destroy();
        }
    }
}