namespace allGoesWell {
    export class AllGoesWellControl implements clientCore.BaseControl {
        private sign: number;

        /**面板信息 */
        public getEventInfo() {
            return net.sendAndWait(new pb.cs_agreeable_yuan_xiao_info()).then((msg: pb.sc_agreeable_yuan_xiao_info) => {
                let model = clientCore.CManager.getModel(this.sign) as AllGoesWellModel;
                model.setTimes = msg.setTime;
                model.eatTimes = msg.eatTime;
                model.point = msg.fortune;
            })
        }

        /**请求礼盒 */
        public getBoxInfo() {
            return net.sendAndWait(new pb.cs_agreeable_yuan_xiao_panel({ uid: clientCore.LocalInfo.uid })).then((msg: pb.sc_agreeable_yuan_xiao_panel) => {
                let model = clientCore.CManager.getModel(this.sign) as AllGoesWellModel;
                if (!msg.yuanxiao) {
                    model.curCnt = 0;
                } else {
                    model.curCnt = _.filter(msg.eatUid, (o) => { return o == 0 }).length;
                }
            });
        }

        /**制作礼盒 */
        public setTangyuan(pos: number[]) {
            return net.sendAndWait(new pb.cs_agreeable_yuan_xiao_plant({ yuanxiao: pos })).then((msg: pb.sc_agreeable_yuan_xiao_plant) => {
                let model = clientCore.CManager.getModel(this.sign) as AllGoesWellModel;
                model.point += 20;
                model.curCnt = 9;
                EventManager.event(ON_POINT_CHANGE, model.point);
                alert.showFWords("福气积分+20");
            })
        }

        /**获取邀请 */
        public getInvitation() {
            return net.sendAndWait(new pb.cs_get_agreeable_yuan_xiao_invitation()).then((msg: pb.sc_get_agreeable_yuan_xiao_invitation) => {
                return Promise.resolve(msg.uid);
            })
        }

        public listenEat() {
            net.listen(pb.sc_agreeable_yuan_xiao_be_eaten_notify, this, this.onEat);
        }

        private onEat(msg: pb.sc_agreeable_yuan_xiao_be_eaten_notify) {
            let model = clientCore.CManager.getModel(this.sign) as AllGoesWellModel;
            model.point = msg.fortune;
            model.curCnt--;
            EventManager.event(ON_POINT_CHANGE, msg.fortune);
        }
    }
}