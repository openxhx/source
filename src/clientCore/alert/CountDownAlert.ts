namespace alert {

    export class CountDownAlert extends ui.commonUI.CountDownUI {

        private _count: number = 3;
        private _end: Laya.Handler;

        constructor() { super(); }

        show(end: Laya.Handler): void {
            clientCore.DialogMgr.ins.open(this);
            this._count = 4;
            this._end = end;
            this.onLoop();
            Laya.timer.loop(1000, this, this.onLoop);
        }
        hide(): void {
            Laya.timer.clear(this, this.onLoop);
            clientCore.DialogMgr.ins.close(this);
        }
        private onLoop(): void {
            if (--this._count <= 0) {
                this._end?.run();
                this.hide();
                return;
            }
            this.imgNum.skin = `commonUI/count_${this._count}.png`;
        }

        private static _ins: CountDownAlert;
        public static show(end: Laya.Handler): void {
            this._ins = this._ins || new CountDownAlert();
            this._ins.show(end);
        }
    }
}