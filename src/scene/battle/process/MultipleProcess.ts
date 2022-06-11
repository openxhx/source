namespace scene.battle.process {
    /**
     * 多重攻击
     */
    export class MultipleProcess extends BaseProcess {

        public result: pb.Iattack_result;
        private _map: util.HashMap<{ type: number, value: number }[]>;

        constructor() { super(); }

        public start(): void {
            this._map = new util.HashMap<{ type: number, value: number }[]>();
            this.calculate();
            super.start();
        }

        public async showEffect() {
            super.showEffect();
            let _array: Array<Promise<void>> = [];
            let _len: number = this.points.length;
            for (let i: number = 0; i < _len; i++) {
                _array.push(this.hit(this.points[i], i));
            }
            await Promise.all(_array);
            // 这个行为已经被终止了
            if (!this.clearTag) return;
            // 处理技能造成的buff效果
            let buffEffects: pb.Ibuff_effect[] = this.result.buffRes;
            _.forEach(buffEffects, (element: pb.Ibuff_effect) => {
                this.showBuffHurt(element);
            });
            // 多重攻击结束
            this.exit();
        }

        private hit(point: Laya.Point, index: number): Promise<void> {
            return new Promise((success) => {

                // 无特效攻击
                let effectIdx: string = this.skillObj.config.effectIdx;
                if (effectIdx == "") {
                    this.showOnceHurt(index);
                    success();
                    return;
                }

                let path: string = pathConfig.getSkillEffect(effectIdx);
                let render: animation.BoneRender = animation.AnimationFactory.getLabelEffect(path, Laya.Handler.create(this, () => {
                    this.showOnceHurt(index);
                }, null, false), Laya.Handler.create(this, function (): void {
                    render.dispose();
                    success();
                }));
                render.pos(point.x, point.y);
                map.MapScene.ins.upEffect.addChild(render);
                this.attacker.campID == unit.CampEnum.MY && render.reversal();
            })
        }

        /**
         * 展示一个单体的攻击伤害
         * @param index 
         */
        private async showOnceHurt(index: number): Promise<void> {
            let se: pb.Iskill_effect = this.result.skillRes[index];
            if (se) {
                let campID: number = se.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
                let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
                let beHit: unit.Fighter = team.getUnit(se.attackIdx);
                if (beHit && !beHit.cleaned) {
                    //受击特效
                    if (this.skillObj.config.artEffect != "") {
                        let render: animation.BoneRender = animation.AnimationFactory.getBoneEffect(pathConfig.getSkillEffect(this.skillObj.config.artEffect));
                        render.pos(beHit.x, beHit.y);
                        map.MapScene.ins.upEffect.addChild(render);
                    }
                    beHit.playAction(unit.ActionEnum.HURT);
                    beHit.hp -= se.num;
                    // 飘血
                    let _array: { type: number, value: number }[] = this._map.get(se.attackIdx);
                    let _len: number = _array.length;
                    for (let i: number = 0; i < _len; i++) {
                        await this.showFont(_array[i].type, _array[i].value, beHit.x, beHit.y);
                    }
                }
            }
        }

        private showFont(type: number, value: number, x: number, y: number): Promise<void> {
            return new Promise((suc) => {
                font.FontManager.showFont(type, value + "", x, y - 200);
                Laya.timer.once(500 / BattleConfig.rate, this, () => { suc() });
            })
        }

        private showBuffHurt(be: pb.Ibuff_effect): void {
            let campID: number = be.team == 1 ? unit.CampEnum.MY : unit.CampEnum.MONSTER;
            let team: unit.Team = unit.UnitManager.ins.getTeam(campID);
            let hiter: unit.Fighter = team.getUnit(be.attackIdx);
            if (hiter && !hiter.cleaned) {
                buff.BuffManager.ins.processBuff(hiter, be);
            }
        }

        private calculate(): void {
            let _hTime: number = this.skillObj.config.hitTimes;
            let _critCoeff: number = clientCore.GlobalConfig.critCoeff; //暴击系数
            _.forEach(this.result.skillRes, (element: pb.skill_effect) => {
                let _nTimes: number = _hTime - element.critCnt - element.dodCnt;
                let _nDamage: number = Math.floor(element.num / ((_critCoeff / 100 - 1) * element.critCnt + _hTime - element.dodCnt));
                let _array: { type: number; value: number }[] = [];
                _nTimes > 0 && _array.push({ type: AttackType.DAMAGE, value: _nTimes });
                element.dodCnt > 0 && _array.push({ type: AttackType.MISS, value: element.dodCnt });
                element.critCnt > 0 && _array.push({ type: AttackType.CRIT, value: element.critCnt });

                for (let i: number = 0; i < _hTime; i++) {
                    let type: number = this.random(_array); //得到类型
                    let value: number;
                    switch (type) {
                        case AttackType.DAMAGE: //普通的
                            value = _nDamage;
                            break;
                        case AttackType.MISS: //闪避了
                            value = 0;
                            break;
                        case AttackType.CRIT: //暴击了
                            value = Math.ceil(_nDamage * (_critCoeff / 100));
                            break;
                        default:
                            break;
                    }
                    let arr: { type: number, value: number }[] = this._map.get(element.attackIdx);
                    if (!arr) {
                        arr = [];
                        this._map.add(element.attackIdx, arr);
                    }
                    arr.push({ type: type, value: value });
                }
            })
        }

        private random(array: { type: number, value: number }[]): number {
            let len: number = array.length - 1;
            let r: number = Math.round(Math.random() * len);
            let obj: { type: number, value: number } = array[r];
            --obj.value <= 0 && array.splice(r, 1);//如果池里次数为零 则移除
            return obj.type;
        }

        public dispose(): void {
            super.dispose();
            this._map && this._map.clear();
            this.result = this._map = null;
        }
    }
}