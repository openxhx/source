namespace beachDeliveryMan {
    export class BeachDeliveryManControl implements clientCore.BaseControl {
        /**获取初始面板*/
        public getInitPanel(): Promise<pb.sc_beach_housekeeper_panel> {
            return net.sendAndWait(new pb.cs_beach_housekeeper_panel()).then((msg: pb.sc_beach_housekeeper_panel) => {
                return Promise.resolve(msg);
            });
        }
        /**获取签到奖励*/
        public getSignInReward(): Promise<pb.sc_beach_housekeeper_sign> {
            return net.sendAndWait(new pb.cs_beach_housekeeper_sign()).then((msg: pb.sc_beach_housekeeper_sign) => {
                return Promise.resolve(msg);
            });
        }
        /**领取任务订单奖励*/
        public getOrderReward(id: number, type: number): Promise<pb.sc_get_beach_housekeeper_task_reward> {
            return net.sendAndWait(new pb.cs_get_beach_housekeeper_task_reward({ id: id, type: type })).then((msg: pb.sc_get_beach_housekeeper_task_reward) => {
                return Promise.resolve(msg);
            });
        }

    }
}