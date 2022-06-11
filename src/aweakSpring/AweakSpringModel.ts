namespace awakeSpring {
    export class AwakeSpringModel implements clientCore.BaseModel {
        /** 本次活动ID*/
        readonly ACTIVITY_ID: number = 121;
        /** 奖励兑换需要的道具ID*/
        readonly EXCHANGE_ITEM_ID: number = 1540103;
        /** 奖励兑换需要的道具ID*/
        readonly AWARD_ITEM_ID: number = 9900133;
        /** 唤醒总次数*/
        readonly MAX_FIND_CNT: number = 5;

        /**春雨收集时间戳 */
        rainTime: number;
        /**唤醒次数*/
        findTimes: number;
        /**购买次数 */
        buyTimes: number;
        /**套装兑换标记 */
        rewardFlag: number;
        constructor() { }

        initMsg(msg: pb.sc_new_spring_panel): void {
            this.findTimes = msg.foundTimes;
            this.rainTime = msg.rainTimeStamp;
            this.buyTimes = msg.buyTimes;
            this.rewardFlag = msg.rewardFlag;
        }

        dispose(): void {
        }
    }
}