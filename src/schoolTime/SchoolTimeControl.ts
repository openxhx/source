namespace schoolTime {
    export class SchoolTimeControl implements clientCore.BaseControl {
        sign:number;
        
        /**面板信息 */
        public getInfo() {
            return net.sendAndWait(new pb.cs_get_finish_school_times_info()).then((msg: pb.sc_get_finish_school_times_info) => {
                let model = clientCore.CManager.getModel(this.sign) as SchoolTimeModel;
                model.setEventInfo(msg);
                return Promise.resolve();
            });
        }

        /**签到 */
        public daySign() {
            return net.sendAndWait(new pb.cs_finish_school_times_sign()).then((msg: pb.sc_finish_school_times_sign) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return Promise.reject(null);
            });
        }

        /**神叶购买代币 */
        public buyCoin() {
            return net.sendAndWait(new pb.cs_buy_finish_school_times_token()).then((msg: pb.sc_buy_finish_school_times_token) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return Promise.reject(null);
            });
        }
    }
}