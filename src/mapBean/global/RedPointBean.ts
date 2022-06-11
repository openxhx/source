namespace mapBean {
    /**
     * boss
     */
    export class RedPointBean implements core.IGlobalBean {
        private _bossStartTime:number;
        start(): void {
            this.checkBossRed();
        }
        /**
         *  在boss大战期间并且boss没被打死
         *  则在试炼按钮上面显示红点
         */
        private checkBossRed() {
            let data = clientCore.BossManager.ins.bossInfo;
            let isBossDead = data.showTime > 0;
            if (!isBossDead && _.inRange(clientCore.ServerManager.curServerTime, data.openTime, data.closeTime)) {
                util.RedPoint.updateAdd([100001]);
            }

            if(clientCore.ServerManager.curServerTime < data.openTime){
                this._bossStartTime = data.openTime;
                Laya.timer.loop(1000,this,this.timeFrame);
            }
        }
        private timeFrame(){
            if(this._bossStartTime == clientCore.ServerManager.curServerTime){
                util.RedPoint.updateAdd([100001]);
                Laya.timer.clear(this,this.timeFrame);
            }
        }
        destory() {

        }
    }
}