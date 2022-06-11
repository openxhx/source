namespace mapBean {
    export class FamilyActivityNoticeBean implements core.IGlobalBean {
        private _noticeMsgHashMap: util.HashMap<xls.familyActivityAlert[]>;
        private _noticeMsgArr: NoticeInfo[];
        start(data?: any): void {
            this.init();
        }
        async init() {
            await Promise.all([
                xls.load(xls.familyActivity),
                xls.load(xls.familyActivityAlert),
                xls.load(xls.familyAlert)
            ]);
            this.parseXls();
            this.initNoticeMessage();
            this.addEVentListners();
        }
        parseXls() {
            this._noticeMsgHashMap = new util.HashMap();
            let arr = xls.get(xls.familyActivityAlert).getValues();
            for (let i = 0; i < arr.length; i++) {
                let activityID = Math.floor(arr[i].id / 100);
                if (!this._noticeMsgHashMap.has(activityID)) {
                    this._noticeMsgHashMap.add(activityID, []);
                }
                this._noticeMsgHashMap.get(activityID).push(arr[i]);
            }
        }
        initNoticeMessage() {
            this._noticeMsgArr = [];
            let curDate = util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime);
            let activityArr = xls.get(xls.familyActivity).getValues();
            for (let i = 0; i < activityArr.length; i++) {
                if (activityArr[i].week == curDate.getDay()) {
                    this.addNoticeMessage(activityArr[i].activity, activityArr[i].openTime);
                    break;
                }
            }
        }
        addNoticeMessage(arr: number[], timeArr: string[]) {
            for (let i = 0; i < arr.length; i++) {
                if (this._noticeMsgHashMap.has(arr[i])) {
                    this.createMessages(this._noticeMsgHashMap.get(arr[i]), timeArr[i]);
                }
            }
        }
        /**
         * 家族活动开始通知
         * @param arr 
         * @param timeStr 
         */
        createMessages(arr: xls.familyActivityAlert[], timeStr: string) {
            let openTime = "";
            // let curDate = new Date(clientCore.ServerManager.curServerTime * 1000);
            let curDate = util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime);
            openTime = `${curDate.getFullYear()}/${curDate.getMonth() + 1}/${curDate.getDate()} ${timeStr}`;
            // let activityDate = new Date(openTime);
            let openTimeSec = util.TimeUtil.formatTimeStrToSec(openTime);
            // let openTimeSec = Math.floor(activityDate.getTime() / 1000);
            console.log(openTime);
            for (let i = 0; i < arr.length; i++) {
                let showTime = 0;
                if (arr[i].alertTime.v1 == 1) {
                    showTime = openTimeSec - arr[i].alertTime.v2 * 60;
                }
                else if (arr[i].alertTime.v1 == 2) {
                    showTime = openTimeSec + arr[i].alertTime.v2 * 60;
                }
                if (showTime > clientCore.ServerManager.curServerTime) {
                    let info = new NoticeInfo(showTime,arr[i].alertCon);
                    this._noticeMsgArr.push(info);
                }
            }
        }
        addEVentListners() {
            Laya.timer.loop(1000, this, this.checkShowMsg);
            net.listen(pb.sc_family_channel_sys_notify,this,this.serverMsgNotice);
        }

        serverMsgNotice(data:pb.sc_family_channel_sys_notify){
            for (let msg of data.content){
                let noticeStr = xls.get(xls.familyAlert).get(msg.id).content;
                let noticeArr = noticeStr.split("para");
                let str = "";
                for(let i = 0;i<msg.params.length;i++){
                    str += noticeArr[i]+msg.params[i];
                }
                str += noticeArr[noticeArr.length-1];
                this.createOneMsg(new NoticeInfo(clientCore.ServerManager.curServerTime,str));
            }
        }

        checkShowMsg() {
            if (clientCore.FamilyMgr.ins.checkInFamily() && this._noticeMsgArr) {
                for (let i = this._noticeMsgArr.length - 1; i >= 0; i--) {
                    if (this._noticeMsgArr[i].time <= clientCore.ServerManager.curServerTime) {
                        /** */
                        this.createOneMsg(this._noticeMsgArr[i]);
                        this._noticeMsgArr.splice(i, 1);
                    }
                }
            }
        }
        createOneMsg(info: NoticeInfo) {
            let msg = new pb.chat_msg_t();
            msg.chatType = 3;
            msg.sendUid = 0;
            msg.recvUid = clientCore.LocalInfo.uid;
            msg.content = info.msg;
            msg.sendTime = info.time;
            msg.special = 0;
            msg.sendNick = "家族公告";
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, msg);
        }
        destory(): void {

        }
    }
    class NoticeInfo {
        public time: number;
        public msg: string;
        constructor(t:number,m:string){
            this.time = t;
            this.msg = m;
        }
    }
}