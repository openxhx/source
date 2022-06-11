
namespace scene.battle.process {
    /**
     * 普通的攻击
     */
    export class NormalProcess extends BaseProcess {

        constructor() { super(); }

        async showEffect() {
            super.showEffect();
            // 有多个位置表示需要创建多个特效
            // TODO 这么设计是不是要改良???
            let _array: Array<Promise<void>> = [];
            _.forEach(this.points, (element: Laya.Point) => {
                _array.push(this.hit(element));
            })
            await Promise.all(_array);

            // 这个行为已经被终止了
            if (!this.clearTag) return;

            this.hitHandler.run();
            this.exit();
        }

        private hit(point: Laya.Point): Promise<void> {
            return new Promise((success) => {
                if (this.skillObj.config.effectIdx == "") { //无特效攻击
                    success();
                } else {
                    let path: string = pathConfig.getSkillEffect(this.skillObj.config.effectIdx);
                    let render: animation.BoneRender = animation.AnimationFactory.playEffect(path, Laya.Handler.create(this, function (): void {
                        success();
                    }), unit.EventEnum.HIT);
                    render.pos(point.x, point.y);
                    map.MapScene.ins.upEffect.addChild(render);
                    this.attacker.campID == unit.CampEnum.MY && render.reversal();
                }
            })
        }
    }
}