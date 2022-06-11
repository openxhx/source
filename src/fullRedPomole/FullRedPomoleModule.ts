namespace fullRedPomole {
    /**
     * 满杯红柚
     * fullRedPomole.FullRedPomoleModule
     * \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0702\【主活动】满杯红柚20210702_Inory.docx
     */
    export class FullRedPomoleModule extends ui.fullRedPomole.FullRedPomoleModuleUI {
        private _model: FullRedPomoleModel;
        private _control: FullRedPomoleControl;
        private readonly _phoArr: string[] = ["pho_nv", "pho_nan"];
        private effJuicing: clientCore.Bone;

        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new FullRedPomoleModel(), new FullRedPomoleControl());
            this._model = clientCore.CManager.getModel(this.sign) as FullRedPomoleModel;
            this._control = clientCore.CManager.getControl(this.sign) as FullRedPomoleControl;
            this.initUI();
            this.addPreLoad(Promise.all([
                xls.load(xls.commonAward)
            ]));
        }
        //#region 初始化
        private initUI(): void {
            this.initRewardParts();
            this.initPho();
            this.resetMoneyHas();
            this.reset2Center();
        }
        //初始化奖励部件
        private initRewardParts(): void {
            const sex: number = clientCore.LocalInfo.sex;
            for (let i: number = 0; i < 10; i++) {
                (this[`reward_${i + 1}`] as Laya.Image).skin = `fullRedPomole/reward_${i + 1}_${sex}.png`;
            }
        }

        private initPho(): void {
            this.imgPho.skin = `unpack/fullRedPomole/${this._phoArr[clientCore.LocalInfo.sex - 1]}.png`;
        }
        //重置money
        private resetMoneyHas(): void {
            this.labCurHas.text = this._model.getCurMoney().toString();
        }
        //重置转盘中心
        private reset2Center(): void {
            let money: number = this._model.getCurMoney();
            const rewards: Array<number> = this._model.getRewardId(clientCore.LocalInfo.sex);
            let hasTask: boolean = false;
            let canGet: boolean = this._model.getCanGetId(true) != null;
            if (canGet) {
                this.btnGet.visible = true;
                this.bxNextGollect.visible = this.labNextCollect.visible = false;
            } else {
                this.btnGet.visible = false;
                this.bxNextGollect.visible = this.labNextCollect.visible = true;
            }
            for (let i: number = 0, j: number = rewards.length; i < j; i++) {
                if (clientCore.ItemsInfo.checkHaveItem(rewards[i])) {
                    (this["state_" + (i + 1)] as Laya.Image).visible = true;
                    (this["mask_" + (i + 1)] as Laya.Image).visible = false;
                } else {
                    const need: number = this._model.getNeedToken(i);
                    if (money < need) {
                        if (!hasTask && !canGet) {
                            this.labNextCollect.text = `${need - money}`;
                        }
                    }
                    (this["state_" + (i + 1)] as Laya.Image).visible = false;
                    (this["mask_" + (i + 1)] as Laya.Image).visible = true;
                    !hasTask && (hasTask = true);
                }
            }
            if (!hasTask) {
                this.btnGet.visible = this.bxNextGollect.visible = this.labNextCollect.visible = false;
            }
        }
        //#endregion
        //播放特效
        private playEffect(rewards: pb.IItem[]): void {
            if (this.effJuicing) {
                this.effJuicing.dispose();
            }
            this.effJuicing = clientCore.BoneMgr.ins.play("res/animate/activity/zhazhi.sk", "animation", false, this);
            this.effJuicing.pos(627, 398);
            this.effJuicing.once(Laya.Event.COMPLETE, this, (e) => {
                if (this.effJuicing) {
                    this.effJuicing.dispose();
                }
                this.reset2Center();//刷新
                alert.showReward(rewards);
                this.resetMoneyHas();
                this.btnGet.mouseEnabled = true;
            });
        }
        onPreloadOver(): void {
            clientCore.UIManager.setMoneyIds([this._model.TOKEN_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月2日活动', '【主活动】满杯红柚', '打开主活动面板');
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btn_help, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btn_close, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnCollect, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onClickHandler);
            for (let i: number = 0; i < 10; i++) {
                BC.addEvent(this, this[`btn_reward_${i + 1}`], Laya.Event.CLICK, this, this.onShowItem, [i]);
            }
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.target) {
                case this.btnGet://获取奖励
                    const ids: number[] = this._model.getCanGetId();
                    this._control.getReward(ids).then(msg => {
                        this.btnGet.mouseEnabled = false;
                        this.playEffect(msg.items);//播放榨汁动画
                    });
                    clientCore.Logger.sendLog('2021年7月2日活动', '【主活动】满杯红柚', '点击领取按钮');
                    break;
                case this.btnCollect:
                    this.destroy();
                    //跳转到花仙乐园
                    clientCore.ModuleManager.open("playground.PlaygroundModule");
                    clientCore.Logger.sendLog('2021年7月2日活动', '【主活动】满杯红柚', '点击收集按钮');
                    break;
                case this.btnTry:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
                    break;
            }
        }
        //显示元件信息
        private onShowItem(index: number): void {
            clientCore.ToolTip.showTips(this[`btn_reward_${index + 1}`], { id: this._model.getOneRewardId(index, clientCore.LocalInfo.sex) });
        }

        private onRule(): void {
            alert.showRuleByID(this._model.RULE_ID);
            clientCore.Logger.sendLog('2021年7月2日活动', '【主活动】满杯红柚', '点击活动规则按钮');
        }

        destroy(): void {
            clientCore.UIManager.releaseCoinBox();
            clientCore.CManager.unRegSign(this.sign);
            this._model = null;
            this._control = null;
            if (this.effJuicing) {
                this.effJuicing.dispose();
                this.effJuicing = null;
            }
            super.destroy();
        }


    }
}