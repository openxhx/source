
namespace rechargeActivity {
    export class CumulativeRechargePanel extends BasePanel {
        constructor() {
            super();
        }
        init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info) {
            super.init(data, info);
            this._mainUI = new ui.rechargeActivity.panel.CumulativeRechargePanelUI();
            this.addChild(this._mainUI);
            this.initPanel();
            this.addEventListenters();
            this._mainUI["txtActivityContent"].text = "活动内容：活动时间内，累计充值到指定数额，即可领取相应奖励";
            // this._mainUI['imgSuit'].skin = clientCore.LocalInfo.sex == 1 ? 'unpack/rechargeActivity/suitFemale.png' : 'unpack/rechargeActivity/suitMale.png'
            this._mainUI['view'].boxNan.visible = clientCore.LocalInfo.sex == 2;
            this._mainUI['view'].boxNv.visible = clientCore.LocalInfo.sex == 1;
            clientCore.Logger.sendLog('2021年2月5日活动', '【付费】累计充值', '打开活动面板');
        }
        refreshGetBitData() {
            this.bitData = this.rechargeInfo.accumulatePayStatus;
        }
        protected itemRender(item: RechargeRender, index: number) {
            item.setInfo(this.type, item.dataSource, this.rechargeInfo.accumulatePayCnt);
        }
        refreshTime() {
            let serverTime = clientCore.ServerManager.curServerTime;
            let endTime = util.TimeUtil.formatTimeStrToSec(this.oriDataArr[0].closeDate);
            let disTime = endTime - serverTime;
            if (disTime < 0) {
                disTime = 0;
            }
            let d = Math.floor(disTime / 86400);
            disTime = disTime % 86400;
            let h = Math.floor(disTime / 3600);
            disTime = disTime % 3600;
            let m = Math.floor(disTime / 60);

            this._mainUI["txtDay"].text = d.toString();
            this._mainUI["txtHour"].text = h.toString();
            this._mainUI["txtMinute"].text = m.toString();
        }

        private onTry(i: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', i == 1 ? 2110010 : 2100114);
        }
        addEventListenters() {
            super.addEventListenters();
            for (let i = 1; i <= 2; i++) {
                BC.addEvent(this, this._mainUI['view']['btnTry' + i], Laya.Event.CLICK, this, this.onTry, [i]);
            }
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}