namespace boss {

    /**
     * 数据
     */
    export class BossModel implements clientCore.BaseModel {

        /** 已经激励次数*/
        public excitation: number;
        /** 下一次可攻击时间*/
        public nextTime: number;
        /** boss血量*/
        public bossHp: number;
        /** boss总血量*/
        public bossMaxHp: number;
        /** 被净化boss展示时间*/
        public showTime: number;
        /** 与boss的交谈次数*/
        public talkCnt: number;
        /** 上一次获取排行榜时间*/
        public rankTime: number;
        /** 我的伤害*/
        public myDamage: number;

        public mergeID: number = 4;

        private _wt: number;
        private _st: number;
        private _ct: number;

        constructor() { }

        dispose(): void {
        }

        /**
         * 写入服务器发送的活动有关时间
         * @param data 
         */
        wirteSvrTime(data: pb.sc_get_world_boss_info): void {
            this._wt = data.prepareTime;
            this._st = data.openTime;
            this._ct = data.closeTime;
        }

        /** 状态 0-未开启 1-准备中 2-战斗 3-胜利了*/
        get status(): number {
            if (this.showTime > 0) return 3; //被净化boss展示时间存在 则说明是处于战胜阶段
            let ct: number = clientCore.ServerManager.curServerTime;
            if (ct < this._wt || ct > this._ct) return 0;
            if (ct >= this._wt && ct < this._st) return 1;
            if (ct >= this._st && ct <= this._ct) return 2;
        }

        /** 获取当前剩余的准备时间*/
        get waitTime(): number {
            return this._st - clientCore.ServerManager.curServerTime;
        }

        /** 获取剩余的休整时间*/
        get cdTime(): number {
            return this.nextTime - clientCore.ServerManager.curServerTime;
        }

        /** BOSS离开时间*/
        get leaveTime(): number {
            return this.showTime - clientCore.ServerManager.curServerTime;
        }

        /** 活动结束剩余时间*/
        get closeTime(): number {
            return this._ct - clientCore.ServerManager.curServerTime;
        }
    }
}