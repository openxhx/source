namespace clientCore {
    /**
     * 邮件管理
     */
    export class MailManager {

        /** 邮件*/
        private _mailMap: util.HashMap<pb.IMailInfo>;
        /** 邀请函*/
        private _letterMap: util.HashMap<pb.IMailInfo>;
        /** 是否初始化过*/
        public hasInit: boolean;

        constructor() { }

        public setup(): void {
            this.hasInit = false;
            this._mailMap = new util.HashMap<pb.IMailInfo>();
            this._letterMap = new util.HashMap<pb.IMailInfo>();
            net.listen(pb.sc_new_mail_notify, this, this.mailNotify);
        }

        /**
         * 初始化邮件 客户端缓存邮件信息
         * @param msg 
         */
        public initMail(msg: pb.sc_get_mail_info): void {
            this.hasInit = true;
            _.forEach(msg.mailInfo, (element: pb.IMailInfo) => {
                this.addMail(element);
            })
        }

        public addMail(element: pb.IMailInfo): void {
            let map: util.HashMap<pb.IMailInfo> = element.type == 2 ? this._letterMap : this._mailMap;
            map.add(element.seq, element);
        }

        public removeMail(type: number, seq: number): void {
            let map: util.HashMap<pb.IMailInfo> = type == 2 ? this._letterMap : this._mailMap;
            map.remove(seq);
        }

        public removeAll(type: number): void {
            let map: util.HashMap<pb.IMailInfo> = type == 2 ? this._letterMap : this._mailMap;
            map.clear();
        }

        /**
         * 获取邮件信息
         * @param type 1-邮件 2-邀请函
         */
        public getMails(type: number): pb.IMailInfo[] {
            let map: util.HashMap<pb.IMailInfo> = type == 2 ? this._letterMap : this._mailMap;
            return map.getValues();
        }

        public getMail(seq: number): pb.IMailInfo {
            return this._mailMap.get(seq);
        }

        /**
         * 新邮件通知
         * @param msg 
         */
        private mailNotify(msg: pb.sc_new_mail_notify): void {
            if (!this.hasInit) return;
            this.addMail(msg.mail);
            EventManager.event(globalEvent.NEW_MAIN_NOTIFY, msg.mail);
        }

        /**
         * 获取剩余过期时间
         * @param gettime 
         */
        public getTimeOut(data: pb.IMailInfo): number {
            return (data.type == 3 ? GlobalConfig.bossMailTimeOut : GlobalConfig.mailTimeOut) - ServerManager.curServerTime + data.getTime;
        }

        private static _ins: MailManager;
        public static get ins(): MailManager {
            return this._ins || (this._ins = new MailManager());
        }
    }
}