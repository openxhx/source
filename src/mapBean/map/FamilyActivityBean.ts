namespace mapBean {
    export class FamilyActivityBean implements core.IMapBean {
        private _destroy: boolean = false;
        private _activityInfoArr: pb.IFamilyActivity[];
        private _activityArr: IFamilyActivity[];
        async start() {
            let activityInfo = await net.sendAndWait(new pb.cs_get_family_activity_info({}));
            this._activityInfoArr = activityInfo.activities;
            await Promise.all([
                clientCore.ModuleManager.loadatlas('familyQABean')
            ]);
            if (!this._destroy) {
                this.init();
            }
        }
        init() {
            this._activityArr = [];
            let serverTime = clientCore.ServerManager.curServerTime;
            for (let info of this._activityInfoArr) {
                if (serverTime >= (info.startTime - 30 * 60) && serverTime < info.endTime) {
                    this.initActivity(info);
                }
            }
        }
        initActivity(info: pb.IFamilyActivity) {
            let activityBean: IFamilyActivity;
            switch (info.eventId) {
                case 1:
                    //家族答题
                    console.log(`答题活动开始时间 ${(new Date(info.startTime * 1000)).toString()}`);
                    console.log(`当前服务器时间 ${(new Date(clientCore.ServerManager.curServerTime * 1000)).toString()}`);
                    activityBean = new FamilyQABean();
                    break;
                case 2:
                    break;
                case 3:
                    //家族采摘
                    activityBean = new FamilyPickItemBean();
                    break;
                case 4:
                    //彩色方块
                    activityBean = new FamilyColorBlockBean();
                    break;
                case 5:
                    activityBean = new FamilyPartyBean();
                default:
                    break;
            }
            activityBean.start(info);
            this._activityArr.push(activityBean);
        }
        touch(): void {

        }
        redPointChange(): void {

        }
        destroy(): void {
            if (this._activityArr) {
                for (let ac of this._activityArr) {
                    ac.destroy();
                }
            }
        }
    }
}