namespace mapBean {
    /**
     * boss
     */
    export class BossNoticeBean implements core.IGlobalBean {
        private _startTime: number;
        private _tenMinutesBeforeStart: number;
        start(): void {
            //获取东八区的年月日
            let dateStr = util.TimeUtil.analysicYear(clientCore.ServerManager.curServerTime) + " 20:00:00";
            this._startTime = util.TimeUtil.formatTimeStrToSec(dateStr);
            this._tenMinutesBeforeStart = this._startTime - 600;
            /**
             * 玩家在19:50到19:59直接登陆，推送一次活动准备公告
             */
            if (this._tenMinutesBeforeStart < clientCore.ServerManager.curServerTime && clientCore.ServerManager.curServerTime <= this._startTime) {
                this.showPrepareNotice();
            }
            /** 判断战斗结束了吗 */
            if (clientCore.ServerManager.curServerTime > this._startTime) {
                this.checkFightBossOver();
            }

            if (clientCore.ServerManager.curServerTime < this._startTime) {
                Laya.timer.loop(1000, this, this.timeLoop);
            }
        }

        timeLoop() {
            if (clientCore.ServerManager.curServerTime == this._tenMinutesBeforeStart) {
                this.showPrepareNotice();
            }
            else if (clientCore.ServerManager.curServerTime == this._startTime) {
                this.showBossStartNotice();
                Laya.timer.clear(this, this.timeLoop);
            }
        }

        async checkFightBossOver() {
            let data = clientCore.BossManager.ins.bossInfo;
            if (clientCore.ServerManager.curServerTime < data.closeTime && parseFloat(data.remainBlood) > 0) {
                this.showBossStartNotice();
            }
        }

        showBossStartNotice() {
            this.showNotice("净化水魔的战斗开始了！赶快前往古灵仙地一起战斗吧！");
        }

        showPrepareNotice() {
            this.showNotice("水魔出现在了古灵仙地，净化水魔的战斗即将开始！");
        }

        showNotice(str: string) {
            let info = { time: clientCore.ServerManager.curServerTime, msg: str };
            let noticeMsg1 = this.createOneMsg(info, 1);
            let noticeMsg2 = this.createOneMsg(info, 5);
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, noticeMsg1);
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, noticeMsg2);
            // alert.showScrollWords(info.msg);
            //跑马灯
            let scrollInfo: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            scrollInfo.bgPath = 'res/alert/worldNotice/105.png';
            scrollInfo.width = 700;
            scrollInfo.y = 35;
            scrollInfo.value = info.msg;
            scrollInfo.sizeGrid = '0,121,0,128';
            scrollInfo.sign = alert.Sign.BOSS_XM;
            alert.showWorlds(scrollInfo);
        }


        createOneMsg(info: any, chatType: number) {
            let msg = new pb.chat_msg_t();
            msg.chatType = chatType;
            msg.sendUid = 0;
            msg.recvUid = clientCore.LocalInfo.uid;
            msg.content = info.msg;
            msg.sendTime = info.time;
            msg.special = 0;
            msg.sendNick = "系统公告";
            return msg;
        }
        destory() {

        }
    }
}