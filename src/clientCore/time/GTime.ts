namespace time {
    /**
     * 定时器
     */
    export class GTime {
        /** 唯一ID*/
        static $ID: number = 1;

        id: number;
        executeTime: number;
        delay: number;
        type: string;
        caller: any;
        callback: Function;
        args: any[];

        started: boolean = false;

        constructor() {
        }

        start(): void {
            this.executeTime = Laya.Browser.now();
            this.started = true;
        }

        run(pass: number): void {
            this.started = this.type != globalEvent.TIME_ONCE;
            this.callback?.apply(this.caller, this.args ? this.args.concat(pass) : [pass]);
        }

        stop(): void {
            this.started = false;
        }

        dispose(): void {
            this.started = false;
            this.callback = null;
            this.caller = null;
            GTimeManager.ins.rmTime(this.id);
            Laya.Pool.recover("GTime", this);
        }
    }
}