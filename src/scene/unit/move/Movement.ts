namespace scene.unit.move {
    /**
     * 移动控制
     */
    export class Movement {
        /** 控制对象*/
        private _fighter: Fighter;
        /** 当前类型*/
        private _type: number;
        /** 当前移动*/
        private _curMove: IMove;

        constructor() { };

        public init(fighter: Fighter): void {
            this._fighter = fighter;
        }

        public start(type: MoveEunm, data: any, complete?: Laya.Handler): void {
            this._type = type;
            this._curMove && this._curMove.dispose();
            this._curMove = null;
            switch (type) {
                case MoveEunm.WALK:
                    this.startWalk(data, complete);
                    break;
                default:
                    break;
            }
            Laya.timer.frameLoop(1, this, this.update);
        }

        private update(): void {
            if (!this._curMove) {
                this._type = MoveEunm.NONE;
                Laya.timer.clear(this, this.update);
            }
            this._curMove.update();
        }

        /** 当前移动类型*/
        public get type(): MoveEunm {
            return this._type;
        }

        /**
         * 开始走路吧
         * @param data 
         * @param end 结束回调
         */
        private startWalk(data: any, end?: Laya.Handler): void {
            let walk: Walk = new Walk(this._fighter);
            walk.start(data, this, end);
            this._curMove = walk;
        }

        public end(): void {
            Laya.timer.clear(this, this.update);
            this._curMove && this._curMove.dispose();
            this._curMove = null;
            this._type = 0;
        }

        public dispose(): void {
            Laya.timer.clear(this, this.update);
            this._curMove && this._curMove.dispose();
            this._curMove = null;
            this._fighter = null;
        }
    }
}