

namespace scene.battle {
    /**
     * 战斗行为
     */
    export class BattleBehavior {

        private _owner: unit.Fighter;
        private _result: pb.Iattack_result;
        private _process: IProcess;
        private _skill: skill.Skill;

        constructor(fighter: unit.Fighter) { this._owner = fighter; }

        public startAttack(result: pb.Iattack_result): void {
            this.cleanBehavior();
            this._owner.setCircle(true);
            this._owner.maxHp = result.maxBlood;
            this._result = result;
            this._skill = skill.SkillModel.ins.getSkill(result.skillId);
            this.setProcess();
        }

        /**
         * 前置动作完成 开始播放技能特效
         * @param type 
         */
        public playSkill(type: unit.EventEnum): void {
            this._process.showEffect();
            // this._owner.anger = this._result.curAnger; //更新怒气
            this._owner.campID == unit.CampEnum.MY && EventManager.event(BattleConstant.UPDATE_ANIMA, this._result.anima); //更新灵气
        }

        private setProcess(): void {
            let _type: process.ProcessEnum = process.ProcessFactory.getType(this._skill.config);
            this._process = process.ProcessFactory.getProcess(_type);
            this._process.attacker = this._owner;
            this._process.skillObj = this._skill;
            this._process.startHandler = Laya.Handler.create(this, this.onFightStart);
            this._process.hitHandler = Laya.Handler.create(this, this.onFightHit);
            this._process.completeHandler = Laya.Handler.create(this, this.onFightComplete);

            // 设置行为
            this.setBehaviors();

            // 多重攻击
            if (this._process instanceof process.MultipleProcess) {
                this._process.result = this._result;
            }

            // 添加技能位置
            let _points: Laya.Point[] = [];
            _.forEach(this._result.skillRes, (element: pb.skill_effect) => {
                _points.push(this.getPoint(element));
            })
            this._process.points = _points;
            this._process.prepare();
        }

        private setBehaviors(): void {
            if (this._skill.config.behaviorType == 2) { //靠近行为
                this._process.addBehavior(new behaviors.Near(this._owner));
            }
        }

        private getPoint(element: pb.skill_effect | pb.buff_effect): Laya.Point {
            let campID: number = element.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let hiter: unit.Fighter = team.getUnit(element.attackIdx);
            hiter.dieSign = element.death == 1; //添加死亡标记
            return new Laya.Point(hiter.x, hiter.y);
        }

        private onFightStart(): void {
            let type: unit.ActionEnum = this._skill.type == skill.SkillType.NORMAL ? unit.ActionEnum.ATTACK_1 : unit.ActionEnum.ATTACK_2;
            // 如果没有attack2 就还剩播attack1
            if (this._owner instanceof unit.BoneFighter && !this._owner.checkAttack2()) {
                type = unit.ActionEnum.ATTACK_1;
            }
            this._owner.playAction(type);
        }

        private async onFightHit() {
            let effects: pb.Iskill_effect[] = this._result.skillRes;
            // 处理技能效果
            _.forEach(effects, (element: pb.Iskill_effect) => {
                this.showHurt(element);
            });
            // 处理技能造成的buff效果
            let buffEffects: pb.Ibuff_effect[] = this._result.buffRes;
            _.forEach(buffEffects, (element: pb.Ibuff_effect) => {
                this.showBuffHurt(element);
            });
        }

        private showHurt(ae: pb.Iskill_effect): void {
            let campID: number = ae.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let hiter: unit.Fighter = team.getUnit(ae.attackIdx);
            if (hiter.cleaned) return;
            //受击特效
            if (this._skill.config.artEffect != "") {
                let render: animation.BoneRender = animation.AnimationFactory.getBoneEffect(pathConfig.getSkillEffect(this._skill.config.artEffect));
                render.pos(hiter.x, hiter.y);
                map.MapScene.ins.upEffect.addChild(render);
            }
            // 飘血
            BattleManager.changeHp(ae.type, hiter, ae.num);
        }

        private showBuffHurt(be: pb.Ibuff_effect): void {
            let campID: number = be.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let hiter: unit.Fighter = team.getUnit(be.attackIdx);
            if (!hiter.cleaned) {
                buff.BuffManager.ins.processBuff(hiter, be);
            }
        }

        private onFightComplete(): void {
            //一次攻击结束了
            if (this._owner) {
                this._owner.setCircle(false);
                this._owner.anger = this._result.curAnger; //更新怒气
                this._owner.hp = this._result.curBlood;
                EventManager.event(BattleConstant.ONE_ATTACK_END);
            }
        }

        /** 清理行为*/
        private cleanBehavior(): void {
            this._process && this._process.dispose();
            this._skill = this._result = this._process = null;
        }

        public dispose(): void {
            this.cleanBehavior();
            //移除身上的所有buff
            buff.BuffManager.ins.removeBuffs(this._owner);
            this._owner = null;
        }
    }
}