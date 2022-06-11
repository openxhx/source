
namespace scene.battle.view {
    /**
     * 战斗场景的UI
     */
    export class FightUI extends ui.fight.FightModuleUI {
        /** 当前速率*/
        private _currentRate: number = 1;
        /** 当前波数*/
        private _currentWave: number = 0;
        /** 最大波数*/
        private _maxWave: number = 3;
        /** 当前回合*/
        private _currentBout: number = 0;
        /** 此关卡最大回合数*/
        private _maxBout: number = 0;
        /** 当前灵气值*/
        private _currentAnima: number = 0;
        /** 神祈技能item*/
        private _prays: util.HashMap<PrayItem> = new util.HashMap<PrayItem>();

        private _jumpTime: number;

        private readonly _rates: number[] = [1, 2, 5];

        private _setting: SettingUI;

        constructor() {
            super();
            this.htmlBout.style.fontSize = 29;
            this.htmlWave.style.fontSize = 29;
            this.htmlBout.style.font = this.htmlWave.style.font = '汉仪中圆简';
            BattleSCommand.ins.getPrays(Laya.Handler.create(this, this.crePrays));
            //自适应
            this.resize();
            this.updateAutoFight();
            //速率显示
            let rate: number = Number(window.localStorage.getItem("battle_rate"));
            this.rateChange(rate == 0 || this._rates.indexOf(rate) == -1 ? 2 : rate);
        }

        /**
         * 初始化面板
         * @param type 1-冒险 2-约会 5金币副本
         * @param stageId 
         */
        public initView(type: number, stageId: number): void {
            //金币副本处理
            if (type == 5) {
                let xlsGold = xls.get(xls.goldStage).get(stageId);
                this._maxBout = xlsGold?.roundNum ?? 0;
                return;
            }
            //获取当前战斗的最大波数
            let xlsData: xls.stageBase | xls.dateStage = type == 1 || type == 6 ? xls.get(xls.stageBase).get(stageId) : xls.get(xls.dateStage).get(stageId);
            if (!xlsData) return;
            let _count: number = 0;
            for (let i: number = 1; i <= 3; i++) {
                xlsData["wave" + i].length != 0 && _count++;
            }
            this._maxWave = _count;
            this._maxBout = xlsData.showRound;

            //战斗跳过
            let isJump: boolean = xlsData.jump == 1;
            this.btnJump.visible = this.spMask.visible = isJump;
            if (isJump) {
                this.spMask.visible = !BattleManager.checkJumpBattle();
                if (this.spMask.visible) {
                    this._jumpTime = 0;
                    this.btnJump.disabled = true;
                    Laya.timer.loop(1000, this, this.updateTime);
                }
            }
        }

        /** 初始化活动boss界面*/
        public initBossView(stageId): void {
            let xlsData: xls.stageBase = xls.get(xls.stageBase).get(stageId);
            if (!xlsData) return;
            this._maxBout = xlsData.showRound;
            this.htmlBout.x = 694;
            this.htmlWave.visible = false;
            this.imgPro.visible = false;
            this.btnJump.visible = this.spMask.visible = xlsData.jump == 1;
        }

        public resize(): void {
            this.width = Laya.stage.width;
            this.height = Laya.stage.height;
            this.leftBox.x = 20;
            this.rightBox.x = this.width;
            this.centerBox.x = -102 + clientCore.LayerManager.OFFSET;
        }

        public getHtmlText(color: string, value: string, font: string = '汉仪中圆简'): string {
            font = font == void 0 ? "Source Han Serif SC Heavy" : font;;
            let text: string = "<span color='" + color + "' style='font-family:" + font + "'>" + value + "</span>";
            return text;
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnRate, Laya.Event.CLICK, this, this.onRate);
            BC.addEvent(this, this.btnAuto, Laya.Event.CLICK, this, this.onAuto);
            BC.addEvent(this, this.btnPause, Laya.Event.CLICK, this, this.pause);
            BC.addEvent(this, EventManager, BattleConstant.UPDATE_BOUT, this, this.updateBout);
            BC.addEvent(this, EventManager, BattleConstant.UPDATE_WAVE, this, this.updateWave);
            BC.addEvent(this, EventManager, BattleConstant.UPDATE_ANIMA, this, this.updateAnima);
            BC.addEvent(this, EventManager, BattleConstant.UPDATE_PRAY_CD, this, this.updatePrayCd);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.resize);
            BC.addEvent(this, this.btnJump, Laya.Event.CLICK, this, this.onJumpBattle);

            //新手引导战斗，把自动战斗隐藏
            if (clientCore.GuideMainManager.instance.isGuideAction && clientCore.GuideMainManager.instance.curGuideInfo.mainID == 18) {
                this.btnAuto.visible = false;
                this.imgAuto.visible = false;
                this.btnJump.visible = false;
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this.clearTimer(this, this.rotate);
            Laya.timer.clearAll(this);
            _.forEach(this._prays.getValues(), (ele: PrayItem) => {
                ele && ele.destroy();
            })
            this._prays.clear();
            this._setting && this._setting.parent && this._setting.hide();
            this._setting = this._prays = null;
        }

        /**
         * 更新灵气值
         */
        public updateAnima(value: number): void {
            let max: number = clientCore.GlobalConfig.maxReiki;
            this.animaBar.width = 368 * value / max;
            this._currentAnima = value;
        }

        private updateTime(): void {
            if (++this._jumpTime >= 5) {
                this.spMask.visible = this.btnJump.disabled = false;
                Laya.timer.clear(this, this.updateTime);
                return;
            }
            this.spMask.graphics.clear();
            this.spMask.graphics.drawPie(0, 0, 39, -90 + 360 * (this._jumpTime / 5), 270, "#000000");
        }

        /** 更新回合*/
        private updateBout(bout?: number): void {
            this._currentBout = bout == void 0 ? this._currentBout + 1 : bout;
            this.htmlBout.innerHTML = this.getHtmlText("#ff1212", "" + this._currentBout) + this.getHtmlText("#805329", `/${this._maxBout}回合`)
        }

        /** 更新波数*/
        private updateWave(wave?: number): void {
            this._currentWave = wave == void 0 ? this._currentWave + 1 : wave;
            this.htmlWave.innerHTML = this.getHtmlText("#ff1212", "" + this._currentWave) + this.getHtmlText("#805329", "/" + this._maxWave + "波");
            //如果说战斗技能不存在的话 就直接退出引导
            if (clientCore.GuideMainManager.instance.isGuideAction && !this._prays.getValues()[0]) {
                clientCore.GuideMainManager.instance.isGuideAction = false;
                clientCore.GuideMainManager.instance.setPartGuideCompleteState();
                return;
            }
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                if (this._currentWave == 1) {
                    this._prays.getValues()[0].visible = false;
                }
                else if (this._currentWave == 2) {
                    this._prays.getValues()[0].visible = true;
                }
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitFightWare") {
                EventManager.once("battle_real_start", this, () => {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                    // let curRate = animation.AnimationControl.ins.rate;
                    // BattleConfig.isPause = true;
                    // animation.AnimationControl.ins.rate = 0.000000001;
                    animation.AnimationControl.ins.pasue();
                    EventManager.once("guide_click_blank", this, () => {
                        // EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        if (this._currentWave == 1) {/**第一波，点击空白，就继续 */
                            // animation.AnimationControl.ins.rate = curRate;
                            // BattleConfig.isPause = false;
                            animation.AnimationControl.ins.resume();
                        }
                        else if (this._currentWave == 2) {
                            // EventManager.event
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this._prays.getValues()[0]);
                            EventManager.once("fight_pray_skill_use", this, () => {
                                // animation.AnimationControl.ins.rate = curRate;
                                // BattleConfig.isPause = false;
                                animation.AnimationControl.ins.resume();
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                            });
                        }
                    });
                });
            }
        }

        /** 更新神祈技能CD*/
        private updatePrayCd(data: pb.skill_cool[]): void {
            _.forEach(data, (element: pb.skill_cool) => {
                let item: PrayItem = this._prays.get(element.skillId);
                item && item.showCd(element.round);
            })
        }

        private onRate(): void {
            let len: number = this._rates.length;
            let rate: number = this._currentRate;
            for (let i: number = 0; i < len; i++) {
                if (this._rates[i] == this._currentRate) {
                    rate = i == len - 1 ? this._rates[0] : this._rates[i + 1];
                    break;
                }
            }
            this.rateChange(rate);
            window.localStorage.setItem("battle_rate", this._currentRate + "");
        }

        private rotate(): void {
            this.btnAuto.rotation++;
        }

        private onAuto(): void {
            let room: BattleRoom = BattleRoom.ins;
            let bout: number = this._currentBout;
            let index: number = room.index;
            let team: number = room.currentTeam;
            if (room.isClose) {
                team = bout = index = 0;
            }
            room.pause();
            BattleSCommand.ins.autoAttack(bout, index, team, Laya.Handler.create(this, this.updateAutoFight));
        }

        /** 跳过战斗*/
        private onJumpBattle(): void {
            alert.showSmall("是否跳过本次战斗？", {
                callBack: {
                    caller: BattleRoom.ins,
                    funArr: [BattleRoom.ins.jumpBattle]
                }
            })
        }

        private updateAutoFight(): void {
            Laya.timer.clear(this, this.rotate);
            BattleConfig.autoFight && Laya.timer.loop(1, this, this.rotate);
        }

        /**
         * 创建神祈技能
         */
        private crePrays(skills: number[]): void {
            let _xs: number[] = [18, 149, 277];
            for (let i: number = 0; i < 3; i++) {
                let id: number = skills[i];
                if (id == 0) continue;
                let item: PrayItem = new PrayItem();
                item.init(skills[i]);
                item.pos(_xs[i], 561);
                this._prays.add(id, item);
                this.rightBox.addChild(item);
                BC.addEvent(this, item, Laya.Event.MOUSE_DOWN, this, this.showTip, [item, id]);
            }
        }

        private showTip(item: PrayItem, id: number) {
            item.showTips();
            item.once(Laya.Event.MOUSE_OUT, this, this.hideTip, [item, id]);
            item.once(Laya.Event.MOUSE_UP, this, this.hideTip, [item, id]);
        }

        private hideTip(item: PrayItem, id: number) {
            item.off(Laya.Event.MOUSE_OUT, this, this.hideTip);
            item.off(Laya.Event.MOUSE_UP, this, this.hideTip);
            if (!item.isTipsShow)
                this.playSkill(id);
            item.hideTips();
        }

        private playSkill(id: number): void {
            if (BattleRoom.ins.isClose) { // 房间关闭则退出
                return;
            }
            let room: BattleRoom = BattleRoom.ins;
            let data: { index: number, bout: number } = room.caculPray();
            if (data == null) { //战斗即将结束了
                return;
            }
            let item: PrayItem = this._prays.get(id);
            if (item && !item.isNaN && item.useSkill(this._currentAnima)) { //使用神祈技能
                room.pause();
                BattleSCommand.ins.useSkill(item.id, this._currentBout + data.bout, data.index, Laya.Handler.create(this, () => { item.fillerVisible = true; }));
            }
            EventManager.event("fight_pray_skill_use");
        }

        /** 游戏暂停*/
        private pause(): void {
            this._setting = this._setting || new SettingUI();
            this._setting.show();
        }

        private rateChange(rate: number): void {
            this._currentRate = BattleConfig.rate = animation.AnimationControl.ins.rate = rate;
            this.imgRate.skin = `fight/x${this._currentRate}.png`;
        }
    }

    /**
     * 技能
     */
    class PrayItem extends ui.fight.PrayItemUI {
        private _config: xls.SkillBase;
        /** cd时间*/
        private _timeCd: number;
        /** 一个发光滤镜*/
        private _filler: Laya.GlowFilter;

        private _isUse: boolean;

        constructor() { super(); }

        /**
         * 初始化
         * @param id 神祈技能id
         */
        public init(id: number): void {
            this._filler = new Laya.GlowFilter("#FFFF00", 10, 0, 0);
            this._config = xls.get(xls.SkillBase).get(id);
            if (this._config) {
                this.ico.skin = pathConfig.getPraySkillIcon(id);
                this.showCd(0); //初始化为0
            }
            this.txtTip.text = this._config.skillDesc;
            this.boxTip.visible = false;
        }

        get isTipsShow() {
            return this.boxTip.visible;
        }

        public showTips() {
            Laya.timer.clear(this, this.setTips);
            Laya.timer.once(200, this, this.setTips);
        }

        private setTips() {
            this.boxTip.visible = true;
        }

        public hideTips() {
            this.boxTip.visible = false;
            Laya.timer.clear(this, this.setTips);
        }

        public showCd(cd: number): void {
            this.fillerVisible = false;
            this._timeCd = cd;
            let inCd: boolean = this._isUse = cd != 0; //是否处于cd
            this.spMask.visible = this.cdTime.visible = inCd;
            if (inCd) {
                let xlsT: number = this._config.coolTime;
                this.cdTime.value = cd + "";
                this.spMask.graphics.clear();
                console.log("cd", -90 + 270 * ((xlsT - cd) / xlsT));
                this._config.coolTime > 0 && this.spMask.graphics.drawPie(56, 48, 45, -90 + 360 * ((xlsT - cd) / xlsT), 270, "#000000");
            }
        }

        /**
         * 使用神祈
         * @param curAnima 当前灵气值 
         */
        public useSkill(curAnima: number): boolean {
            if (this._timeCd > 0) {
                alert.showFWords("技能冷却中");
                return false;
            } else if (curAnima < this.anima) {
                alert.showFWords("祈愿值不足");
                return false;
            } else if (this._isUse) {
                alert.showFWords(this._config.skillName + "蓄力中，将在我方回合释放哦");
                return false;
            }
            this._isUse = true;
            return true;
        }

        public get timeCd(): number {
            return this._timeCd;
        }

        public get id(): number {
            return this._config.skillId;
        }

        public get anima(): number {
            return this._config.skillCost.v2;
        }

        public get isNaN(): boolean {
            return this._config == null;
        }

        public destroy(): void {
            super.destroy();
            this._filler = null;
        }

        /** 发光滤镜是否显示*/
        public set fillerVisible(value: boolean) {
            this.filters = value ? [this._filler] : [];
        }
    }
}