namespace scene.battle {
    /**
     * 战斗房间
     */
    export class BattleRoom implements IRoom {
        /** 是否关闭*/
        private _isClose: boolean;
        /** 战斗结果数据*/
        private _battleResults: pb.Iattack_result[];
        /** 我方攻击到的位置*/
        private _myIndex: number = -1;
        /** 敌方攻击到的位置*/
        private _otherIndex: number = -1;
        /** 当前攻击到的位置*/
        private _index: number = -1;
        /** 先出手方*/
        private _firstCamp: number = -1;
        /** 当前战斗队伍*/
        private _currentTeam: number = -1;
        /** 是否暂停*/
        private _isPause: boolean = false;
        /** 是否有对象正在战斗*/
        private _fighting: boolean = false;
        /** 神祈是否在释放*/
        private _praying: boolean;
        /** 缓存释放神祈技能之前的怪物战斗数据要组合到新的数据之中 ??? 麻烦啊*/
        private _cacheData: pb.Iattack_result[];
        /** 当前战斗对象*/
        private _currFighter: unit.Fighter;

        private _fightWave: number = 0;

        constructor() { }

        enter(type?: number): void {
            //结束了
            if (BattleConfig.isFinish) return;
            this._isClose = false;
            this._battleResults = [];
            battle.BattleSCommand.ins.getEnemyRole(Laya.Handler.create(this, function (roles: pb.role_pos[]): void {
                // 创建对手吧
                map.MapScene.ins.addWaves(unit.CampEnum.MONSTER, roles, type);
                // 开始吧
                this.start();
            }))
        }

        async start(): Promise<void> {
            BC.addEvent(this, EventManager, BattleConstant.ONE_ATTACK_END, this, this.next);
            //更新波数
            EventManager.event(BattleConstant.UPDATE_WAVE);
            this._fightWave++;
            //初始化回合
            EventManager.event(BattleConstant.UPDATE_BOUT, 1);
            //处理人物初始化携带的buff
            await BattleManager.handlerBuffs();
            //请求战斗数据
            battle.BattleSCommand.ins.battleResult(Laya.Handler.create(this, async function (results: pb.attack_result[]): Promise<any> {
                this._battleResults = results;
                if (clientCore.GuideMainManager.instance.isGuideAction && this._fightWave == 2) {
                    EventManager.event("battle_real_start");
                    return;
                }
                await this.next();
                console.log("start send start event!");
                EventManager.event("battle_real_start");
            }))
        }
        exit(): void {
            if (this._isClose) {
                return;
            }
            Laya.timer.clear(this, this.delayRecover);
            this._currFighter = this._battleResults = null;
            this._isClose = true;
            this._currentTeam = this._index = this._firstCamp = this._myIndex = this._otherIndex = -1;
            BC.removeEvent(this);
        }

        private async next() {
            // 战斗准备
            this._fighting = this._praying = false;
            // 暂停
            if (this._isPause) return;
            // 房间关闭了
            if (this._isClose) return;
            // 打完了
            if (!this._battleResults || this._battleResults.length <= 0) {
                battle.BattleSCommand.ins.battleFinish(FinishType.OVER);
                return;
            }
            let result: pb.Iattack_result = this._battleResults.shift();
            let campID: unit.CampEnum = result.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            // 更新神祈Cd
            EventManager.event(BattleConstant.UPDATE_PRAY_CD, [result.magicCool]);
            // 检查释放神祈
            if (this.checkUsePray(result)) return;
            // 计算回合
            this.calcuateRound(result);
            // 得到双方当前战斗位置
            campID == unit.CampEnum.MY ? (this._myIndex = result.roleIdx) : (this._otherIndex = result.roleIdx);
            this._index = result.roleIdx;
            this._currentTeam = result.team;
            // 开始执行释放
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let fighter: unit.Fighter = team.getUnit(result.roleIdx);
            if (!fighter || fighter.checkDie()) { //队伍中没有此对象 || 已经死亡
                this.next();
                return;
            }
            // step1 先处理自身附加的buff
            await Promise.all(buff.BuffManager.ins.processSelfBuffs(fighter, result.curBuff));
            // 因为buff造成死亡
            if (fighter.checkDie()) {
                this.next();
                return;
            }
            // 该单位本次行动被限制辽 所以技能Id为0
            if (result.skillId == 0) {
                this.next();
                return;
            }
            // step2 开始攻击
            this._fighting = true;
            this._currFighter = fighter;
            fighter.startAttack(result);
            console.log("next function run over!");

            return Promise.resolve();
        }

        /** 判断神祈*/
        private checkUsePray(result: pb.Iattack_result): boolean {
            if (result.isMagic) {
                this._praying = this._fighting = true;
                PrayBehavior.ins.startAttack(result);
                return true;
            }
            return false;
        }

        /** 计算回合*/
        private calcuateRound(result: pb.Iattack_result): void {
            let campID: unit.CampEnum = result.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            this._firstCamp = this._firstCamp == -1 ? campID : this._firstCamp;
            if (this._firstCamp == campID) { //来到起手方的回合了
                let index: number = campID == unit.CampEnum.MY ? this._myIndex : this._otherIndex;
                result.roleIdx <= index && EventManager.event(BattleConstant.UPDATE_BOUT);
            }
        }

        /** 房间暂停*/
        public pause(): void {
            this._isPause = true;
            Laya.timer.once(10000, this, this.delayRecover);
        }

        public delayRecover(): void {
            console.warn("recover: ", "战斗房间在规定时间内未执行恢复，自动恢复~");
            this.recover();
        }

        /** 房间恢复*/
        public recover(): void {
            Laya.timer.clear(this, this.delayRecover);
            this._isPause = false;
            !this._isClose && !this._fighting && this.next();
        }

        /** 房间是否关闭*/
        public get isClose(): boolean {
            return this._isClose;
        }

        /** 当前我方攻击位置*/
        public get myIndex(): number {
            return this._myIndex;
        }

        public get index(): number {
            return this._index;
        }

        /** 当前战斗队伍*/
        public get currentTeam(): number {
            return this._currentTeam;
        }

        /** 判断某个角色当前是否在战斗*/
        public checkSelf(figher: unit.Fighter): boolean {
            return this._currFighter == figher;
        }

        /**
         * 计算释放神祈的位置和神祈 ps 一定是下一个我方成员的回合和位置 服务器不能智能一些？？？？
         */
        public caculPray(): { index: number, bout: number } {
            this.clearCache();
            let result: pb.Iattack_result;
            let len: number = this._battleResults.length;
            for (let i: number = 0; i < len; i++) {
                result = this._battleResults[i];
                if (result.team == 1) { //我方
                    let bout: number = result.roleIdx <= this._myIndex ? 1 : 0;
                    return { index: result.roleIdx, bout: bout };
                } else { //缓存释放神祈技能之前的怪物战斗数据要组合到新的数据之中
                    this._cacheData.push(result);
                }
            }
            return null;
        }

        private clearCache(): void {
            this._cacheData = this._cacheData || [];
            this._cacheData.length = 0;
        }

        /** 释放神祈之后 组合战斗数据*/
        public combBattleResults(values: pb.Iattack_result[]): void {
            this._battleResults = null;
            this._battleResults = this._cacheData.concat(values);
        }

        /** 设置战斗数据*/
        public set battleResults(values: pb.Iattack_result[]) {
            this._battleResults = values;
        }

        /** 跳过战斗*/
        public jumpBattle(): void {
            // 去掉跳过战斗的限制
            // if (this._isClose) return;
            battle.BattleSCommand.ins.battleFinish(FinishType.JUMP);
        }

        /** 是否在释放神祈*/
        public get praying(): boolean {
            return this._praying;
        }

        private static _ins: BattleRoom;
        public static get ins(): BattleRoom {
            return this._ins || (this._ins = new BattleRoom());
        }
    }
}