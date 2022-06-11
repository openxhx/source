namespace clientCore.mentor {
    export class ApplyMgr {
        teacherApplyArr:pb.INoticeInfo[];//拜师信息
        studentApplyArr:pb.INoticeInfo[];//收徒信息
        selfNoticeInfo:pb.INoticeInfo;

        /** 
         * 点击聊天信息，需要打开收徒面板进行
         * 聊天信息的special字段，作为key，映射到拜师或者收徒信息来
         */
        MESSAGE_VARIFY_ID:number = 100000000;//这个

        applyMessageHashMap:util.HashMap<MentorNoticeInfo>;

        graduateRewardInfo:pb.sc_get_education_gifts_info;

        refreshTime:number = 0;
        constructor(){
            this.teacherApplyArr = [];
            this.studentApplyArr = [];
            this.applyMessageHashMap = new util.HashMap();
        }
        
    }
}