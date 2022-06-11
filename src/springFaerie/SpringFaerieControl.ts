namespace springFaerie {

    export class SpringFaerieControl implements clientCore.BaseControl {
        private sign: number;

        /**面板信息 */
        public getEventInfo() {
            return net.sendAndWait(new pb.cs_gu_ling_xian_info()).then((msg: pb.sc_gu_ling_xian_info) => {
                let model = clientCore.CManager.getModel(this.sign) as SpringFaerieModel;
                model.scoreNum = msg.taoYun;
                model.shareTag = msg.share;
            })
        }

        /**制作桃符 */
        public makeTaoFu(id: number, time: number) {
            return net.sendAndWait(new pb.cs_gu_ling_xian_make({ id: id, time: time })).then((msg: pb.sc_gu_ling_xian_make) => {
                let model = clientCore.CManager.getModel(this.sign) as SpringFaerieModel;
                model.scoreNum = msg.taoYun;
                EventManager.event("SCORE_CHANGE");
                return Promise.resolve(msg);
            })
        }

        /**获取积分奖励 */
        public getScoreReward(index: number) {
            return net.sendAndWait(new pb.cs_gu_ling_xian_reward({ id: index })).then((msg: pb.sc_gu_ling_xian_reward) => {
                alert.showReward(msg.item);
            })
        }

        /**获取分享奖励 */
        public getShareReward() {
            return net.sendAndWait(new pb.cs_gu_ling_xian_share({ })).then((msg: pb.sc_gu_ling_xian_share) => {
                alert.showReward(msg.item);
                let model = clientCore.CManager.getModel(this.sign) as SpringFaerieModel;
                model.shareTag = 1;
            })
        }

    }
}