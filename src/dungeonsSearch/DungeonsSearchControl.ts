namespace dungeonsSearch {
    export class DungeonsSearchControl implements clientCore.BaseControl {
        /**面板信息 */
        public getInfo() {
            return net.sendAndWait(new pb.cs_ten_years_active_second_week()).then((msg: pb.sc_ten_years_active_second_week) => {
                return Promise.resolve(msg);
            });
        }

        /**领取火把 */
        public getTorch() {
            return net.sendAndWait(new pb.cs_ten_years_active_get_torch()).then((msg: pb.sc_ten_years_active_get_torch) => {
                return Promise.resolve(msg);
            });
        }

        /**领取火把 */
        public consumeTorch() {
            return net.sendAndWait(new pb.cs_ten_year_active_consume_torch()).then((msg: pb.sc_ten_year_active_consume_torch) => {
                return Promise.resolve(msg);
            });
        }
    }
}