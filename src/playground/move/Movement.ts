namespace playground {

    export enum MoveType {
        JUMP
    }

    /**
     * 行动控制
     */
    export class Movement {

        private _currMove: IMove;
        private _unit: Unit;
        private _startTime: number;

        constructor(unit: Unit) { this._unit = unit; }

        start(type: MoveType, param: any, endMove?: Laya.Handler): void {
            this._currMove?.dispose();
            this._currMove = null;
            switch (type) {
                case MoveType.JUMP:
                    this._currMove = this.start_jump(param, endMove);
                    break;
                default:
                    break;
            }
            if (!this._currMove) return;
            this._startTime = Laya.Browser.now();
            Laya.timer.frameLoop(1, this, this.updateFrame);
        }

        end(): void {
            this._currMove?.dispose();
            this._currMove = null;
            Laya.timer.clear(this, this.updateFrame);
        }

        dispose(): void {
            this.end();
            this._unit = null;
        }

        private updateFrame(): void {
            this._currMove?.update(Laya.Browser.now() - this._startTime);
        }

        private start_jump(param: { time: number, max: number, target: Laya.Point }, complete: Laya.Handler): IMove {
            let jump: Jump = new Jump();
            jump.start(this._unit, param, this, complete);
            return jump;
        }
    }
}