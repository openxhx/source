namespace util {
    /**
     * 进度条封装 构造函数传入的是进度条的mask
     */
    export class ProgressUtil {
        private ui: Laya.Sprite;
        private currPer: number;
        private maxWidth: number;

        /**
         * @param ui 遮罩元件
         * @param maxWidth 最大宽度
         */
        constructor(ui: Laya.Sprite, maxWidth: number) {
            this.ui = ui;
            this.maxWidth = maxWidth;
        }

        /** 设置进度 0~1 */
        set(per: number) {
            per = _.clamp(per, 0, 1);
            this.ui.x = (per - 1) * this.maxWidth;
            this.currPer = per;
        }

        /**
         * 进度条增涨动画
         * @param toPer 终止时进度 0~1
         * @param loop 循环次数(如:当前0.1  toPer=0.1  loop=1 则进度条先跑到终点，再从起点跑到0.1)
         * @param totalTime  总缓动时间 
         */
        async increase(toPer: number, loop: number = 0, totalTime: number = 1): Promise<any> {
            Laya.Tween.clearTween(this.ui);
            let totalLen = 1 - this.currPer + loop;
            let spd = totalLen / totalTime;
            if (totalLen > 0) {
                if (loop > 0) {
                    //第一段 curr->1
                    await this._increase(this.currPer, 1, spd);
                    //第二段 loop
                    for (let i = 0; i < loop - 1; i++) {
                        await this._increase(0, 1, spd);
                    }
                    //第三段 0->toPer
                    await this._increase(0, toPer, spd);
                }
                else {
                    return this._increase(this.currPer, toPer, spd);
                }
            }
            else {
                return Promise.resolve();
            }
        }

        private _increase(now: number, to: number, spd: number): Promise<any> {
            return new Promise((ok) => {
                this.ui.x = (now - 1) * this.maxWidth;
                Laya.Tween.to(this.ui, { x: (to - 1) * this.maxWidth }, (to - now) / spd * 1000, Laya.Ease.linearNone, new Laya.Handler(this, () => {
                    ok();
                    this.currPer = to;
                }));
            })
        }

        destroy() {
            Laya.Tween.clearAll(this.ui);
            this.ui = null;
        }
    }
}