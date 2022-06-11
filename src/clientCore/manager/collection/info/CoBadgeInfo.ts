
namespace clientCore {
    export class CoBadgeInfo {
        public readonly srvData: pb.IbadgeCollect;
        public readonly xlsData: xls.collectAchievement;
        /**当前正在进行的步骤下标 */
        public readonly currStep: number;
        constructor(srvData: pb.IbadgeCollect) {
            this.srvData = srvData;
            this.xlsData = xls.get(xls.collectAchievement).get(srvData.badgeId);
            this.currStep = _.clamp(this.xlsData.achievementNeeds.indexOf(srvData.rewardStep) + 1, 0, this.xlsData.achievementNeeds.length - 1);
        }

        get nowHaveReward() {
            let pro = this.progress;
            return !this.isComplete && (pro.now == pro.total);
        }

        get reward() {
            return LocalInfo.sex == 1 ? this.xlsData.achi_f_Reward[this.currStep] : this.xlsData.achi_m_Reward[this.currStep];
        }

        get point() {
            return this.xlsData.achievementPoint[this.currStep];
        }

        /**是否已经完成了这一系列徽章 */
        get isComplete() {
            return this.srvData.rewardStep == _.last(this.xlsData.achievementNeeds);
        }

        get type() {
            return this.xlsData.achievementType;
        }

        /**描述文本（做好了替换文本的） */
        get des() {
            return this.xlsData.achievementDes.replace('#', this.xlsData.achievementNeeds[this.currStep].toString());
        }

        /**进度信息 */
        get progress() {
            let now = this.srvData.step;
            let total = this.xlsData.achievementNeeds[this.currStep];
            return {
                now: Math.min(now, total),
                total: total
            }
        }

        /**获取当前状态 本徽章总共获取了多少点数 */
        get totalGetPoint() {
            let sum = 0;
            if (this.isComplete) {
                sum += _.last(this.xlsData.achievementPoint);
            }
            for (let i = 0; i < this.currStep; i++) {
                sum += this.xlsData.achievementPoint[i];
            }
            return sum;
        }
    }
}