namespace schoolTeachersDay {
    export class SchoolTeachersDayControl implements clientCore.BaseControl {
        public model: SchoolTeachersDayModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_teachers_day_panel> {
            return net.sendAndWait(new pb.cs_teachers_day_panel()).then((msg: pb.sc_teachers_day_panel) => {
                return Promise.resolve(msg);
            });
        }

        /** 奖励兑换*/
        public exchange(id: number, pos: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_teachers_day_exchange({ id: id, pos: pos })).then((msg: pb.sc_teachers_day_exchange) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 答题*/
        public answer(chooseId: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_teachers_day_answer({ chooseId: chooseId })).then((msg: pb.sc_teachers_day_answer) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 取题*/
        public getQuestion(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_teachers_day_get_question()).then((msg: pb.sc_teachers_day_get_question) => {
                handler?.runWith(msg);
            });
        }

        /** 购买*/
        public commonBuy(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_common_buy({ activityId: this.model.activityId })).then((msg: pb.sc_common_buy) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}