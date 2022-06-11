namespace clientCore {
    export class RainbowInfo {
        /** 彩虹状态*/
        public state: number = 0;
        /** 彩虹开始的时间戳*/
        public startTime: number = 0;
        /** 还剩余多少时间*/
        public duration: number = 0;
        /** 活动类型*/
        public activityID: number = 0;

        constructor() { }

        public updateInfo(msg: pb.IRainbowInfo,activityID?: number): void {
            if (!msg) return;
            this.state = msg.state;
            this.startTime = msg.startTime;
            this.duration = msg.duration;
            this.activityID = activityID;
        }
    }
}