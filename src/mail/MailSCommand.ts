namespace mail {
    /**
     * 邮件的协议控制
     */
    export class MailSCommand {

        /** 获取邮件信息*/
        public getMailInfo(): Promise<void> {
            return new Promise((suc) => {
                let ins: clientCore.MailManager = clientCore.MailManager.ins;
                ins.hasInit ? suc() : net.sendAndWait(new pb.cs_get_mail_info()).then((msg: pb.sc_get_mail_info) => {
                    ins.initMail(msg);
                    suc();
                })
            })
        }

        /**
         * 领取邮件奖励
         * @param seq 
         * @param handler 
         */
        public getReward(seq: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_mail_reward({ flag: 0, seq: seq })).then((msg: pb.sc_get_mail_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item), "领取成功");
                handler && handler.run();
                util.RedPoint.reqRedPointRefresh(4501);
            })
        }

        /**
         * 锁住或解锁邀请函
         * @param type 0 解锁  1 锁定
         * @param seq 
         * @param handler 
         */
        public handlerLetter(type: number, seq: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_lock_invitation({ flag: type, seq: seq })).then((msg: pb.sc_lock_invitation) => {
                handler && handler.run();
            })
        }

        /**
         * 阅读邮件
         * @param seq 
         */
        public readMail(seq: number): void {
            net.sendAndWait(new pb.cs_read_mail({ seq: seq })).then(() => {
                util.RedPoint.reqRedPointRefreshArr([4503, 4502]);
            });
        }

        /**
         * 删除邮件
         * @param type 一键删除填入类型 1 普通邮件  2 邀请函 单个删除为 0
         * @param handler 
         * @param seq 
         */
        public deleteMail(type: number, handler: Laya.Handler, seq?: number): void {
            net.sendAndWait(new pb.cs_del_mail_info({ type: type, seq: seq })).then((msg: pb.sc_del_mail_info) => {
                handler && handler.runWith([msg.seq]);
                util.RedPoint.reqRedPointRefreshArr([4503, 4502]);
            })
        }

        private static _ins: MailSCommand;
        public static get ins(): MailSCommand {
            return this._ins || (this._ins = new MailSCommand());
        }
    }
}