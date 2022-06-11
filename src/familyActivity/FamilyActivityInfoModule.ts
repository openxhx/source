namespace familyActivity {
    /**
     * 家族活动详细面板
     */
    export class FamilyActivityInfoModule extends ui.familyActivity.FamilyActivityModuleUI {
        private _showActivityArr: number[] = [1, 3, 4, 5];
        private _activityShowDayHashMap: util.HashMap<number[]>;
        constructor() {
            super();

        }
        init() {
            this.addPreLoad(xls.load(xls.familyActiShow));
            this.addPreLoad(xls.load(xls.familyActivity));
        }
        onPreloadOver() {
            this.parseActivityActDay();

            this.activityList.renderHandler = new Laya.Handler(this, this.activityRender, null, false);
            this.activityList.mouseHandler = new Laya.Handler(this, this.mouseSelect);
            this.activityList.hScrollBarSkin = "";
            this.activityList.array = this._showActivityArr;
            this.activityList.width = 855;
        }
        mouseSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "imgRule") {
                    alert.showRuleByID(this._showActivityArr[idx]);
                }
            }
        }
        parseActivityActDay() {
            this._activityShowDayHashMap = new util.HashMap();
            let arr = xls.get(xls.familyActivity).getValues();
            for (let info of arr) {
                for (let i = 0; i < info.activity.length; i++) {
                    if (info.activity[i] > 0) {
                        if (!this._activityShowDayHashMap.has(info.activity[i])) {
                            this._activityShowDayHashMap.add(info.activity[i], []);
                        }
                        this._activityShowDayHashMap.get(info.activity[i]).push(info.week);
                    }
                }
            }
        }
        activityRender(item: ui.familyActivity.render.ActivityRenderUI, index: number) {
            let actionID = this._showActivityArr[index];
            let dayArr = this._activityShowDayHashMap.get(actionID);
            // let curDate = new Date(clientCore.ServerManager.curServerTime*1000);
            let curDate = util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime);
            let curDay = curDate.getDay();
            let timeArr = xls.get(xls.familyActiShow).get(actionID).time.split("-");
            let curTime = Math.floor(curDate.getDate() / 1000);
            let activityStartTime = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.analysicYear(clientCore.ServerManager.curServerTime) + " " + timeArr[0]);
            let activityEndTime = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.analysicYear(clientCore.ServerManager.curServerTime) + " " + timeArr[1]);
            console.log(`活动开始时间：${activityStartTime}`);
            console.log(`当前服务器时间：${curTime}`);
            console.log(`活动结束时间：${activityStartTime}`);
            if (dayArr.indexOf(curDay) > -1) {/**今天有这个活动 */
                /**设置bg */
                if (curTime < activityEndTime) {
                    item.imgBg.skin = `familyActivity/bg_2.png`;
                }
                else {
                    item.imgBg.skin = `familyActivity/bg_1.png`;
                }
                /**设置文字 */
                if (curTime < activityStartTime) {/**活动未开始 */
                    item.txtActivityState.text = "即将开始";
                }
                else if (curTime > activityEndTime) {/**活动已经结束 */
                    item.txtActivityState.text = "已结束";
                }
                else {
                    item.txtActivityState.text = "进行中……";
                }

            }
            else {
                item.imgBg.skin = `familyActivity/bg_1.png`;
                item.txtActivityState.text = "活动时间外";
            }
            item.imgActivity.skin = `familyActivity/activityImg_${actionID}.png`;
            item.txtActivityName.text = xls.get(xls.familyActiShow).get(actionID).name;
            item.txtActivityDay.text = this.getDayTxt(dayArr);
            item.txtActivityTime.text = this.getTimeTxt(timeArr);
            item.imgWait.visible = false;
            item.rewardList.renderHandler = new Laya.Handler(this, this.rewardRender);
            item.rewardList.array = xls.get(xls.familyActiShow).get(actionID).award;
            item.rewardList.repeatX = item.rewardList.array.length;
        }
        rewardRender(item: ui.commonUI.item.RewardItemUI, index: number) {
            // item.num.value = data.v2.toString();
            let id = item.dataSource;
            item.num.visible = false;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            // item.txtName.text = clientCore.ItemsInfo.getItemName(id);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            item.ico.scale(1, 1);
        }
        getDayTxt(dayArr: number[]): string {
            let str = "";
            for (let i = 0; i < dayArr.length; i++) {
                str += "周" + util.StringUtils.getDayChinese(dayArr[i]) + "、";
            }
            str = str.substring(0, str.length - 1);
            return str;
        }
        getTimeTxt(timeArr: string[]): string {
            return timeArr[0].substring(0, timeArr[0].length - 3) + "-" + timeArr[1].substring(0, timeArr[1].length - 3);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }
        destroy() {
            super.destroy();
            BC.removeEvent(this);
        }
    }
}