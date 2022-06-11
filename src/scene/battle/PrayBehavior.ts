namespace scene.battle {

    /**
     * 神祈行为
     */
    export class PrayBehavior {

        private _process: process.BaseProcess;
        private _result: pb.Iattack_result;
        private _skill: skill.Skill;

        /** 开始攻击*/
        public startAttack(rt: pb.Iattack_result): void {
            this.clear();
            this._result = rt;
            this._skill = skill.SkillModel.ins.getSkill(rt.skillId);
            rt.team == 1 && EventManager.event(BattleConstant.UPDATE_ANIMA, rt.anima); //更新灵气
            this.setProcess();
        }

        private setProcess(): void {
            this._process = process.ProcessFactory.getProcess(process.ProcessEnum.PRAY);
            this._process.skillObj = this._skill;
            this._process.completeHandler = Laya.Handler.create(this, this.onFightEnd);
            this._process.hitHandler = Laya.Handler.create(this, this.onFightHit);

            // 设置技能落点
            let points: Laya.Point[] = [];
            if (this._skill.config.scopeEffectType == 1) {
                _.forEach(this._result.skillRes, (element: pb.skill_effect) => {
                    let point: Laya.Point = this.getPoint(element);
                    point && points.push(this.getPoint(element));
                })
            } else {
                //检查是否被标记死亡
                _.forEach(this._result.skillRes, (element: pb.skill_effect) => { this.checkDead(element); });
                points.push(new Laya.Point(968, 298));
            }

            // 开始吧
            this._process.points = points;
            this._process.prepare();
        }

        /**
         * 检查死亡
         * @param element 
         */
        private checkDead(element: pb.skill_effect | pb.buff_effect): unit.Fighter {
            let campID: number = element.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let hiter: unit.Fighter = team.getUnit(element.attackIdx);
            if (!hiter) {
                util.fightErrLog(`camp ${campID} pos ${element.attackIdx} 已死亡~但被技能作用~`);
                return;
            }
            hiter.dieSign = element.death == 1;
            return hiter;
        }

        private getPoint(element: pb.skill_effect | pb.buff_effect): Laya.Point {
            // let campID: number = element.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            // let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            // let hiter: unit.Fighter = team.getUnit(element.attackIdx);
            // if (!hiter) {
            //     util.fightErrLog(`camp ${campID} pos ${element.attackIdx} 已死亡~但被技能作用~`);
            //     return;
            // }
            // hiter.dieSign = element.death == 1; //添加死亡标记
            let hiter: unit.Fighter = this.checkDead(element);
            if (!hiter) return;
            return new Laya.Point(hiter.x, hiter.y);
        }

        private onFightHit(): void {
            // 处理技能伤害
            let skillEffects: pb.Iskill_effect[] = this._result.skillRes;
            _.forEach(skillEffects, (element: pb.Iskill_effect) => {
                this.showSkillHurt(element);
            })
            // 处理buff伤害
            let buffEffects: pb.Ibuff_effect[] = this._result.buffRes;
            _.forEach(buffEffects, (element: pb.Ibuff_effect) => {
                this.showBuffHurt(element);
            })
        }

        /**
         * 显示技能伤害
         * @param se 一次技能伤害数据项
         */
        private showSkillHurt(se: pb.Iskill_effect): void {
            let campID: number = se.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let figher: unit.Fighter = team.getUnit(se.attackIdx);
            // 还未被清理
            if (!figher.cleaned) {
                // 飘血
                BattleManager.changeHp(se.type, figher, se.num);
                // 受击特效
                let artEffect: string = this._skill.config.artEffect;
                if (artEffect != "") {
                    let render: animation.BoneRender = animation.AnimationFactory.getBoneEffect(pathConfig.getSkillEffect(artEffect));
                    render.pos(figher.x, figher.y);
                    map.MapScene.ins.upEffect.addChild(render);
                }
            }
        }

        /**
         * 处理buff
         * @param be 
         */
        private showBuffHurt(be: pb.Ibuff_effect): void {
            let campID: number = be.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let hiter: unit.Fighter = team.getUnit(be.attackIdx);
            if (!hiter.cleaned) {
                buff.BuffManager.ins.processBuff(hiter, be);
            }
        }

        private onFightEnd(): void {
            EventManager.event(BattleConstant.ONE_ATTACK_END);
        }

        private clear(): void {
            this._process && this._process.dispose();
            this._result = this._process = null;
        }

        private static _ins: PrayBehavior;
        public static get ins(): PrayBehavior {
            return this._ins || (this._ins = new PrayBehavior());
        }
    }
}