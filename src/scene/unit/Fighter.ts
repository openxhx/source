///<reference path="Unit.ts" />

namespace scene.unit {
    /**
     * 地图战斗对象
     */
    export class Fighter extends Unit implements IFighter {
        campID: number;
        skillBehavior: ISkillBehavior;
        /** 死亡标记*/
        dieSign: boolean;

        /** 属性*/
        private _identity: number;
        /** 职业*/
        private _career: number;
        /** 护盾值*/
        private _shield: number;
        /** 当前血量*/
        private _currentHP: number;
        /** 当前怒气*/
        private _currentAnger: number;
        /** 方向*/
        private _direction: number;
        /** 移动控制*/
        private _movement: move.Movement;
        /** 战斗行为*/
        private _battleBhavior: battle.BattleBehavior;
        /** 最大血量*/
        protected _maxHP: number;
        /** 最大怒气值*/
        protected _maxAnger: number;

        protected _data: FightVo;

        constructor() { super(); }

        public init(data: FightVo): void {
            super.init(data);
            this._data = data;
            this._movement = new move.Movement();
            this._movement.init(this);
            // 获取战斗行为
            this._battleBhavior = new battle.BattleBehavior(this);
            //初始化信息
            this.dieSign = false;
            this._maxAnger = clientCore.GlobalConfig.maxAnger;
            this.campID = data.campID;
            this.id = data.roleID;
            //渲染形象
            this.render();
            this.direction = data.direction;
            this.anger = data.anger;
            this.hp = this._maxHP = data.blood;
            this.shield = 0; //护盾值初始化为零
            //是否显示大血条
            data.showHp && logicUI.MonsterHP.show(data.roleID);
        }

        startAttack(result: pb.Iattack_result): void {
            this._battleBhavior.startAttack(result);
        }

        playSkill(type: EventEnum): void {
            this._battleBhavior.playSkill(type);
        }

        playAction(type: ActionEnum, complete?: Laya.Handler): void {
        }

        setSkillBehavior(behavior: ISkillBehavior): void {
            this.skillBehavior = behavior;
        }

        dispose(): void {
            super.dispose();
            this._data.showHp && logicUI.MonsterHP.hide();
            this._currentAnger = this._currentHP = -1;
            this._movement.dispose();
            this._movement = null;
            this._battleBhavior.dispose();
            this._battleBhavior = null;
            this._data = null;
        }

        public attack(): void {
            if (this.checkDie()) return;
            this.playAction(ActionEnum.ATTACK_2);
        }

        /**
         * 走动
         * @param dic 移动距离
         */
        public walk(): void {
            if (this.checkDie()) return;
            this.playAction(ActionEnum.MOVE);
        }

        /** 待机*/
        public idle(): void {
            if (this.checkDie()) return;
            this.playAction(ActionEnum.IDLE);
        }

        /** 检查是否阔以攻击i*/
        public checkCanAttack(): boolean {
            if (this.checkDie()) {
                return false;
            }
            return true;
        }

        /** 方向*/
        public set direction(value: DirectionEnum) {
            this._direction = value;
            this.display.scaleX = this._direction == DirectionEnum.RIGHT ? -1 : 1;
        }
        public get direction(): DirectionEnum {
            return this._direction;
        }
        /** 血量*/
        public set hp(value: number) {
            if (this.dieSign) {
                util.fightLog(`camp ${this._data.campID} pos ${this._data.pos} 被标记死亡~`);
                this._currentHP = 0;
            } else {
                if (value == this._currentHP) return;
                // 减血需要考虑护盾效果
                value = value < this._currentHP ? (this._currentHP - this.calculateShield(this._currentHP - value)) : value;
                this._currentHP = _.clamp(value, 1, this._maxHP); //1是为了防止角色未携带死亡标记 但血量为0了
            }
            this._data.showHp && logicUI.MonsterHP.update(this._currentHP);
            this.updateHp(this._currentHP);
            this._currentHP <= 0 && this.die();
        }
        public get hp(): number {
            return this._currentHP;
        }
        public get maxHp(): number {
            return this._maxHP;
        }
        public set maxHp(value: number) {
            this._maxHP = value;
            this.updateHp(this._currentHP);
        }
        /** 怒气*/
        public set anger(value: number) {
            if (this._currentAnger == value) {
                return;
            }
            this._currentAnger = Math.min(value, this._maxAnger);
            this.updateAnger(this._currentAnger);
        }
        public get anger(): number {
            return this._currentAnger;
        }
        /** 护盾值*/
        public get shield(): number {
            return this._shield;
        }
        public set shield(value: number) {
            this._shield = value;
        }
        public get identity(): number {
            return this._identity;
        }
        public set identity(value: number) {
            this._identity = value;
        }
        public get career(): number {
            return this._career;
        }
        public set career(value: number) {
            this._career = value;
        }
        public get data(): FightVo {
            return this._data;
        }
        private calculateShield(value: number): number {
            let changeVal: number = Math.max(0, value - this._shield);
            this.shield = Math.max(0, this._shield - value);
            return changeVal;
        }
        public removeToScene(): void {
            super.removeToScene();
            unit.UnitManager.ins.removeUnit(this);
        }

        /** 设置脚底圆弧的显示状态*/
        public setCircle(value: boolean): void {
        }

        /** 检查死亡 判断死亡请用这个*/
        public checkDie(): boolean {
            return this.dieSign || this.hp <= 0;
        }

        /** 更新怒气值*/
        protected updateAnger(value: number): void {
        }

        /** 更新血量*/
        protected updateHp(value: number): void {
        }

        /** 死亡*/
        protected die(): void {
            !this.dieSign && util.fightLog(`camp ${this._data.campID} pos ${this._data.pos} 空血死亡~`);
            this.dieSign = true;
            this.playAction(ActionEnum.DEAD);
        }
    }
}