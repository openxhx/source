namespace impossibleTasks {
    export class ImpossibleTasksControl implements clientCore.BaseControl {
        public model: ImpossibleTasksModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_impossible_task_panel> {
            return net.sendAndWait(new pb.cs_impossible_task_panel()).then((msg: pb.sc_impossible_task_panel) => {
                if (this.model) {
                    this.model.updateInfo(msg);
                }
                return Promise.resolve(msg);
            });
        }

        /** 奖励兑换*/
        public exchange(id: number, pos: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_impossible_task_exchange({ id: id, pos: pos })).then((msg: pb.sc_impossible_task_exchange) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 说服*/
        public persuade(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_impossible_task_persuade()).then((msg: pb.sc_impossible_task_persuade) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 扫荡*/
        public sweepBattle(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_impossible_task_mop_up()).then((msg: pb.sc_impossible_task_mop_up) => {
                if (this.model) {
                    this.model.bossCnt++;
                }
                handler?.runWith(msg);
            })
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