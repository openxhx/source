namespace springLoveSong {
    export class SpringLoveSongModel implements clientCore.BaseModel {
        /**剩余限量套装 */
        public limitCnt: number;

        /**祝福数量 */
        public wishNum: number;
        /**发起人形象 */
        public userClothesList: number[];
        /**对象形象 */
        public friendClothesList: number[];
        /**发起人uid */
        public uid: number;
        /**对象uid */
        public friendUid: number;
        /**今日是否可替换 */
        public changeFlag: number;
        /**当前背景 */
        public curBg: number;
        /**临时背景 */
        public tempBg: number;
        /**走秀队列 */
        public allShow: pb.IshowInfo[];
        /**当前服务器最大数量 */
        public maxShowCnt: number;

        initMsg(msg: pb.sc_spring_song_show_panel) {
            this.wishNum = msg.wishNum;
            this.userClothesList = msg.userClotheList;
            this.friendClothesList = msg.friendClotheList;
            this.uid = msg.uid;
            this.friendUid = msg.friendUid;
            this.changeFlag = msg.flag;
            this.curBg = msg.bgShow;
        }
        dispose() {

        }
    }
}