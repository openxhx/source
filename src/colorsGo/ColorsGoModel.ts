namespace colorsGo {
    export class ColorsGoModel implements clientCore.BaseModel {
        public readonly activityId: number = 89;        //活动id
        public readonly ruleById: number = 1098 ;        //规则id--主界面

        public issue: number = 5;               //活动期数（用于多期多版本同时上线处理）
        public redPointId: number = 0;          //红点id
        public tokenId: number = 0;             //已购买代币id
        public tokenId2: number = 0;            //已购买代币id
        public suitId: number = 0;              //套装ID

        constructor() {
        }

        public init(): void {
            let arr = xls.get(xls.dailyGoMain).getValues();
            for (let i = 0; i < arr.length; i++) {
                if (this.getInTime(arr[i].issueBegin, arr[i].issueOver)) {
                    this.issue = arr[i].issue;
                    break;
                }
            }
            let data = this.dailyGoMain;

            this.redPointId = data.redPoint;
            this.tokenId = data.rewardFemale[0].v1;
            this.tokenId2 = data.rewardMale[0].v1;
            this.suitId = data.issueSuits;
        }

        /** 获取商品列表**/
        public getItemList(type: number): xls.dailyGo[] {
            return xls.get(xls.dailyGo).getValues().filter((o) => { return o.type == type && o.issue == this.issue });
        }

        /** 获取单期商品具体信息**/
        public get dailyGoMain(): xls.dailyGoMain {
            return xls.get(xls.dailyGoMain).get(this.issue);
        }

        /**获取当前时间是否在活动内**/
        public getInTime(startTime: string, endTime: string): boolean {
            let serverTime = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(startTime);
            let et: number = util.TimeUtil.formatTimeStrToSec(endTime);
            return serverTime >= st && serverTime <= et;
        }

        dispose(): void {
        }
    }
}