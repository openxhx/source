namespace clientCore {
    export class GiveFlowerManager {
        static _instance: GiveFlowerManager;
        static get instance() {
            this._instance = this._instance || new GiveFlowerManager();
            return this._instance;
        }

        async init() {
            await xls.load(xls.rechargeActivity);
            net.listen(pb.sc_player_give_flower_notify, this, this.onSomeGiveFlower);
            net.listen(pb.sc_all_world_give_flower_notify, this, this.onSomveGiveBroadCast);
        }

        isInActTime() {
            let info = xls.get(xls.eventControl)?.get(31);
            if (info) {
                let time = info.eventTime.split('_');
                let st = util.TimeUtil.formatTimeStrToSec(time[0]);
                let et = util.TimeUtil.formatTimeStrToSec(time[1]);
                let serverTime = clientCore.ServerManager.curServerTime;
                return serverTime >= st && serverTime <= et;
            }
            return false;
        }

        private onSomeGiveFlower(data: pb.sc_player_give_flower_notify) {
            if (data.fRecord) {
                //自己获赠,更新userInfo里的数据
                if (data.fRecord.type == 1) {
                    LocalInfo.srvUserInfo.gotFlowerCnt += data.fRecord.num;
                }
            }
        }

        private onSomveGiveBroadCast(data: pb.sc_all_world_give_flower_notify) {
            if (data.num >= 520 && this.isInActTime()) {
                let style: alert.IScrollStyle = {
                    skin: 'res/giveFlower/scrollNotice.png',
                    grid: '0,0,0,0',
                    width: 931,
                    height: 105,
                    scrollRect: new Laya.Rectangle(50, 5, 880)
                };
                alert.showWordsWithStyle(`【${data.nickA}】为【${data.nickB}】单次赠送${data.num}朵爱之花，以此证明【${data.nickA}】与【${data.nickB}】情谊长久。`, style)
            }
        }
    }
}