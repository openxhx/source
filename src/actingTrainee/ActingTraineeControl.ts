namespace actingTrainee {
    export class ActingTraineeControl implements clientCore.BaseControl {
        public model: ActingTraineeModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_drama_actor_panel> {
            return net.sendAndWait(new pb.cs_drama_actor_panel()).then((msg: pb.sc_drama_actor_panel) => {
                if (this.model) {
                    this.model.updateInfo(msg);
                }
                return Promise.resolve(msg);
            });
        }

        /** 奖励兑换*/
        public exchange(id: number, pos: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_drama_actor_exchange({ id: id, pos: pos })).then((msg: pb.sc_drama_actor_exchange) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 答题*/
        public answer(questionIdList: number[], answerIdList: number[], handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_drama_actor_start_answer({ questionIdList: questionIdList, answerIdList: answerIdList })).then((msg: pb.sc_drama_actor_start_answer) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 购买*/
        public commonBuy(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_common_buy({ activityId: this.model.activityId })).then((msg: pb.sc_common_buy) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                    this.model.buyTimes++;
                    this.model.updateBuyTimes();
                }
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}