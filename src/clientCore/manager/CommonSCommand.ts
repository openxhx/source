namespace clientCore {
    /**
     * 通用的协议
     */
    export class CommonSCommand {

        /**
         * 添加好友
         * @param uid 
         */
        public addFriend(uid: number): void {
            net.send(new pb.cs_apply_add_friend({ friendUid: [uid] }))
            alert.showFWords("已发送！！");
        }

        private static _ins: CommonSCommand;
        public static get ins(): CommonSCommand {
            return this._ins || (this._ins = new CommonSCommand());
        }
    }
}