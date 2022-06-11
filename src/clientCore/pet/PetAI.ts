namespace clientCore {

    export enum PET_STATUS {
        /** 待机*/
        IDLE,
        /** 飞行*/
        FLY
    }

    /**
     * 花宝AI
     */
    export class PetAI {

        private _owner: Pet;
        private _idleT: number;
        private _status: PET_STATUS;

        constructor(owner: Pet) { this._owner = owner; }

        update(): void {
            let needFly: boolean = this._owner.checkFly();
            //需要飞行
            if (needFly) {
                this._status != PET_STATUS.FLY ? this.startFly() : this._owner.fly_update();
            }
            //待机
            if (!needFly) {
                if (this._status == PET_STATUS.IDLE) {
                    let currT: number = Laya.Browser.now();
                    if (currT - this._idleT >= 5000) {
                        this._idleT = currT;
                        this._owner.randomIdle();
                    }
                } else {
                    this.startIdle();
                }
            }
        }

        startFly(): void {
            this._status = PET_STATUS.FLY;
            this._owner.fly();
        }

        startIdle(): void {
            this._idleT = Laya.Browser.now();
            this._status = PET_STATUS.IDLE;
            this._owner.idle();
        }

        dispose(): void {
            this._owner = null;
        }
    }
}