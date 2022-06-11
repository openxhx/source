namespace offPrintComeback {
    export class OffPrintComebackControl implements clientCore.BaseControl {
        /**是否已经参与*/
        public getOffPrintComebackFlags(){
            return net.sendAndWait(new pb.cs_out_of_print_comeback_panel()).then((msg: pb.cs_out_of_print_comeback_chose_panel) => {
                return Promise.resolve(msg);
            });
        }
        /**绝版复出面板 */
        public getClothInfo() {
            return net.sendAndWait(new pb.cs_out_of_print_comeback_chose_panel()).then((msg: pb.sc_out_of_print_comeback_chose_panel) => {
                return Promise.resolve(msg);
            });
        }
        /**投票 */
        public vote(_chose: number, handle: Laya.Handler) {
            net.sendAndWait(new pb.cs_out_of_print_comeback_chose({ chose: _chose })).then((msg: pb.sc_out_of_print_comeback_chose) => {
                handle.runWith(msg);
            });
        }
    }
}