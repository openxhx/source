namespace scene.battle.process {
    /**
     * 近战攻击
     */
    export class CloseCombatProcess extends BaseProcess {

        private _copyPoint: Laya.Point;

        constructor() { super(); }

        start(): void {
            this._copyPoint = new Laya.Point(this.attacker.x, this.attacker.y);
            this.moveTo(BattleConstant.midPoint, this.startHandler);
        }

        async showEffect() {
            super.showEffect();
            if (this.skillObj.config.effectIdx != "") {
                // 有多个位置表示需要创建多个特效
                // TODO 这么设计是不是要改良???
                let _array: Array<Promise<void>> = [];
                _.forEach(this.points, (element: Laya.Point) => {
                    _array.push(this.hit(element));
                })
                await Promise.all(_array);
            }
            // 这个行为已经被终止了
            if (!this.clearTag) return;
            this.hitHandler.run();
            this.exit();
        }

        private hit(point: Laya.Point): Promise<void> {
            return new Promise((success) => {
                let path: string = pathConfig.getSkillEffect(this.skillObj.config.effectIdx);
                let render: animation.BoneRender = animation.AnimationFactory.playEffect(path, Laya.Handler.create(this, function (): void {
                    success();
                }), unit.EventEnum.HIT);
                render.pos(point.x, point.y);
                map.MapScene.ins.upEffect.addChild(render);
            })
        }

        async exit(): Promise<void> {
            Laya.timer.once(this.skillObj.config.rockDelay / BattleConfig.rate, this, () => {
                this.moveTo(this._copyPoint, this.completeHandler);
            });
        }

        /** 移动到目标点*/
        moveTo(point: Laya.Point, complete: Laya.Handler): void {
            Laya.Tween.to(this.attacker, { x: point.x, y: point.y }, 200, null, complete);
        }
    }
}