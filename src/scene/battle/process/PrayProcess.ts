namespace scene.battle.process {
    /**
     * 神祈攻击
     */
    export class PrayProcess extends BaseProcess {

        constructor() { super(); }

        public start(): void {
            let castEffect: string = this.skillObj.config.castEffect; //施法特效
            if (castEffect != "") {
                let url: string = pathConfig.getPraySkillEffect(castEffect, clientCore.LocalInfo.sex);
                let render: animation.BoneRender = animation.AnimationFactory.playEffect(url, Laya.Handler.create(this, this.showEffect), unit.EventEnum.COMPLETE);
                render.pos(Laya.stage.width / 2, Laya.stage.height / 2);
                map.MapScene.ins.upEffect.addChild(render);
            } else {
                this.showEffect();
            }
        }
        public async showEffect(): Promise<void> {
            super.showEffect();
            let _array: Array<Promise<void>> = [];
            _.forEach(this.points, (point: Laya.Point) => {
                _array.push(this.hit(point));
            })
            await Promise.all(_array);
            // 这个行为已经被终止了
            if (!this.clearTag) return;
            this.hitHandler.run();
            this.exit();
        }

        private hit(point: Laya.Point): Promise<void> {
            return new Promise((success) => {
                let url: string = pathConfig.getSkillEffect(this.skillObj.config.effectIdx);
                let render: animation.BoneRender = animation.AnimationFactory.playEffect(url, Laya.Handler.create(this, function (): void {
                    success();
                }), unit.EventEnum.HIT)
                render.pos(point.x, point.y);
                map.MapScene.ins.upEffect.addChild(render);
            })
        }
    }
}