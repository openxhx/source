

namespace clientCore {
    /**
     * 游戏发动机
     */
    export class GameEngine {

        private static _soundTime: number;

        constructor() { }

        static start(): void {
            this._soundTime = Laya.Browser.now();
            Laya.timer.frameLoop(1, this, this.onFrame);
            time.ServerClock.instance.startClock();
        }

        private static onFrame(): void {
            /** 花宝更新*/
            PetManager.ins.update();
            /** 实体更新*/
            AvatarManager.ins.update();
            /** 时间器*/
            time.GTimeManager.ins.update();
            let currTime: number = Laya.Browser.now();
            if (currTime - this._soundTime >= 1000) {
                /** 检查实名认证*/
                RealManager.ins.checkPlayGame();
                this._soundTime = currTime;
            }
        }
    }
}