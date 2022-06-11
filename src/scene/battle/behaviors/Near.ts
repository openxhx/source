

namespace scene.battle.behaviors {

    /**
     * 靠近
     */
    export class Near extends BaseBehavior {


        private _temp: Laya.Point;

        async start(): Promise<void> {
            this._temp = new Laya.Point(this.owner.x, this.owner.y);
            await this.moveTo(BattleConstant.midPoint);
        }

        /** 移动到目标点*/
        private moveTo(point: Laya.Point): Promise<void> {
            return new Promise<void>((suc) => {
                Laya.Tween.to(this.owner, { x: point.x, y: point.y }, 200, null, Laya.Handler.create(this, () => { suc() }));
            })
        }

        async over(): Promise<void> {
            await this.moveTo(this._temp);
            this.owner = null;
        }
    }
}