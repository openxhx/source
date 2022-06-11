namespace hiddenElfGame{
    /**
     * 其他玩家AI
     */
    export class PlayerAI{
        private _walk: Walk;
        private _end: Laya.Point;
        private _w: number;
        private _h: number;
        private _finish: Laya.Handler;

        init(owner: Laya.Sprite): void{
            this._walk = new Walk(owner);
        }

        /**
         * 在规定的时间内 AI会随机选点移动
         * 时间过后以终点为目标移动 最后抵达终点
         * @param width 可移动范围宽度
         * @param height 可移动范围高度
         * @param time 随机移动时间
         * @param end 终点
         */
        start(width: number,height: number, time: number,end: Laya.Point,finish: Laya.Handler): void{
            this._finish = null;
            this._finish = finish;
            this._w = width;
            this._h = height;
            this._end = end;
            this.randomWalk();
            Laya.timer.clear(this,this.onTimeOut);
            Laya.timer.once(time * 1000,this,this.onTimeOut);
        }

        stop(): void{
            Laya.timer.clear(this,this.onTimeOut);
            this._walk.clear();
            this._finish.recover();
            this._finish = null;
            this._end.recover();
            this._end = null;
        }

        /** 完成*/
        private finish(): void{
            this._end.recover();
            this._end = null;
            Laya.timer.clear(this,this.onTimeOut);
            this._finish.run();
        }

        dispose(): void{
            Laya.timer.clear(this,this.onTimeOut);
            this._walk?.dispose();
            this._walk = null;
            this._end?.recover();
            this._end = null;
            this._finish?.recover();
            this._finish = null;
        }

        private onTimeOut(): void{
            this._walk.clear();
            this._walk.start([this._end.x,this._end.y],new Laya.Handler(this,this.finish));   
        }

        private randomWalk(): void{
            this._walk.start([_.random(0,this._w),_.random(0,this._h)],new Laya.Handler(this,this.randomWalk));
        }
    }
}