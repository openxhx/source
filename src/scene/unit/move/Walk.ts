namespace scene.unit.move {
    /**
     * 走动
     */
    export class Walk implements IMove {

        private _fighter: Fighter;
        private _movement: Movement;
        private _speed: number;
        private _complete: Laya.Handler;
        private _dic: number;

        /** 移动增量*/
        private _add: number;

        /**
         * @param figher 走路单元
         */
        constructor(figher: Fighter) {
            this._fighter = figher;
        }

        start(data: any, movement: Movement, complete?: Laya.Handler): void {
            this._add = 0;
            this._speed = data.speed;
            this._dic = data.dic;
            this._movement = movement;
            this._complete = complete;
        }

        update(): void {
            this._add += this._speed;
            //到达目的地
            if (this._add >= this._dic) {
                this._complete && this._complete.run();
                this._movement.end();
                return;
            }
            // 更新位置
            let speed: number = this._fighter.direction == DirectionEnum.LEFT ? -this._speed : this._speed;
            this._fighter.x += speed;
        }

        dispose(): void {
            this._complete && this._complete.recover();
            this._add = this._speed = this._dic = 0;
            this._movement = this._complete = this._fighter = null;
        }
    }
}