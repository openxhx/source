namespace clientCore {
    /**系统开放管理 */
    export class SystemOpenManager {

        private static _ins: SystemOpenManager;
        private _xlsArr: Array<xls.systemTable>;
        /**k：systemTable中id v：是否开放*/
        private _openHash: util.HashMap<boolean>;

        public static fightSuccFlag: boolean;

        /**活动开启的hash */
        private _advHash: util.HashMap<{ id: number, startTime: number, endTime: number, eventOff: boolean }>;

        public static get ins(): SystemOpenManager {
            return this._ins || (this._ins = new SystemOpenManager());
        }

        /**必须在等级和关卡信息都拿到后 */
        async setup() {
            this._openHash = new util.HashMap();
            // await Promise.all([
            //     xls.load(xls.systemTable),
            //     xls.load(xls.eventControl),
            //     xls.load(xls.activityIcon)
            // ]);
            this._xlsArr = xls.get(xls.systemTable).getValues();
            this._advHash = new util.HashMap();
            for (const o of xls.get(xls.eventControl).getValues()) {
                let array: string[] = o.eventTime.split("_");
                this._advHash.add(o.eventId, {
                    id: o.eventId,
                    // startTime: new Date(array[0].replace(/\-/g, '/')).getTime() / 1000,
                    startTime: util.TimeUtil.formatTimeStrToSec(array[0]),
                    // endTime: new Date(array[1].replace(/\-/g, '/')).getTime() / 1000,
                    endTime: util.TimeUtil.formatTimeStrToSec(array[1]),
                    eventOff: o.eventOff == 1
                })
            }
            for (const info of this._xlsArr) {
                this._openHash.add(info.id, this.checkIsOpen(info.id));
                //初始化后先更新出去一次,防止有些按钮在setup前就初始化了
                EventManager.event(globalEvent.SYSTEM_OPEN_CHANGED, [info.id, this._openHash.get(info.id)]);
            }
            EventManager.on(globalEvent.CHECK_SYSTEM_OPEN, this, this.onCheckOpen);
            EventManager.on(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, this, this.onAdvInfoChange);
            EventManager.on(globalEvent.SHOW_SYSTEM_LOCK_INFO, this, this.showLockInfo);
            net.listen(pb.sc_event_control_info_notify, this, this.onAdvOpenStateChange);
            EventManager.on(globalEvent.USER_LEVEL_UP, this, this.checkAfterExpChange);

            EventManager.event(globalEvent.SYSTEM_OPEN_MANAGER_INIT_COMPLETE);
        }
        private showLockInfo(id: number) {
            let unlockRequire = xls.get(xls.systemTable).get(id).unlockRequire;
            if (unlockRequire.v1 == 1) {
                alert.showFWords(`等级达到${unlockRequire.v2}级后开启！`);
            }
            if (unlockRequire.v1 == 2) {
                //关卡通关
                let str = (unlockRequire.v2 % 1000).toString().replace("0", "-");
                alert.showFWords(`通过主线${str}后开启！`);
            }
        }

        private onCheckOpen(id: number) {
            EventManager.event(globalEvent.SYSTEM_OPEN_CHANGED, [id, this._openHash.get(id)]);
        }

        /**判断某个id是否已开启 */
        private checkIsOpen(id: number) {
            let unlockRequire = xls.get(xls.systemTable).get(id).unlockRequire;
            if (unlockRequire.v1 == 1) {
                //等级满足
                return LocalInfo.userLv >= unlockRequire.v2;
            }
            if (unlockRequire.v1 == 2) {
                //关卡通关
                let stageInfo = AdventureManager.instance.getOneStageInfo(unlockRequire.v2);
                return stageInfo ? stageInfo.state != STAGE_STATU.NO_COMPLETE : false
            }
            else {
                return true;
            }
        }

        get familyOpenLv(): number {
            let unlockRequire = xls.get(xls.systemTable).get(17).unlockRequire;
            return unlockRequire.v1 == 1 ? unlockRequire.v2 : 0;
        }

        /**根据模块id判断是否能打开 */
        checkOpenByModuleId(modId: number, needAlertReason: boolean = false) {
            let sysXls = _.find(this._xlsArr, (o) => { return o.moduleOpenId == modId });
            if (sysXls) {
                let opened = this._openHash.get(sysXls.id);
                if (needAlertReason && !opened)
                    this.showLockInfo(sysXls.id);
                return opened;
            }
            return true;
        }

        debugOpen(id: number, open: boolean) {
            this._openHash.add(id, open);
            EventManager.event(globalEvent.SYSTEM_OPEN_CHANGED, [id, open]);
        }

        /**判断系统是否打开
         * @param id systemTable中id
         */
        getIsOpen(id: number) {
            return this._openHash ? this._openHash.get(id) : false;
        }

        /**升级（等级数据更新）后 察看是否有系统解锁  */
        private checkAfterExpChange() {
            let nowLv = LocalInfo.userLv;
            //升级上报
            channel.ChannelControl.ins.reportRoleData(4);
            //过滤找出对应的开放信息 减少通知
            let arr = this._xlsArr.filter((stage) => {
                return stage.unlockRequire.v1 == 1 && stage.unlockRequire.v2 == nowLv;
            });
            let unlockMapItemArr = this.findUnlockMapItemInfo(nowLv);

            if ((arr.length > 0 && this.isSystemOpenPanelShow(arr)) || unlockMapItemArr.length > 0) {/**有系统解锁，并且弹框 */
                EventManager.once("system_alert_close", this, () => {
                    GuideMainManager.instance.checkGuideByLevelUp();
                });
            }
            else {
                GuideMainManager.instance.checkGuideByLevelUp();
            }
            if (arr.length > 0) {
                for (const o of arr) {
                    if (o.show) {
                        this.notifyAndAlertOpen(o.id, unlockMapItemArr, nowLv);
                    }
                    else {
                        if (!this._openHash.get(o.id)) {
                            this._openHash.add(o.id, true);
                            EventManager.event(globalEvent.SYSTEM_OPEN_CHANGED, [o.id, true]);
                        }
                    }
                }
            }
            else {/**升级比弹  如果没有解锁物品，就显示升级 */
                this.notifyAndAlertOpen(0, unlockMapItemArr, nowLv);
            }

        }
        private findUnlockMapItemInfo(lv: number): number[] {
            let arr = [];
            let shopInfoArr = xls.get(xls.shop).getValues();
            for (let i = 0; i < shopInfoArr.length; i++) {
                if (shopInfoArr[i].unlockConditions.length > 0 && shopInfoArr[i].unlockConditions[0].v1 == 1 && shopInfoArr[i].unlockConditions[0].v2 == lv) {
                    arr.push(shopInfoArr[i].itemId);
                }
            }
            return arr;
        }
        private isSystemOpenPanelShow(arr: xls.systemTable[]) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].show > 0) {
                    return true;
                }
            }
            return false;
        }

        /**关卡信息变动 */
        private onAdvInfoChange(stageId: number) {
            //过滤找出对应的开放信息 减少通知
            if (!SystemOpenManager.fightSuccFlag) {/**如果不是战斗胜利，那么就不弹出系统开启弹框 */
                return;
            }
            /**因为在冒险界面，领取保险的时候，也会广播这个事件，同时领取宝箱广播的关卡ID跟实际关卡ID一致
             * 会导致重新引导，但是重新引导触发了之后。因为不会弹出alert框（弹框逻辑里面做了过滤，如果已经开启的就不弹）
             * 所以在升级出现弹框之后，因为两个地方都是用的system_alert_close事件，同一个事件到导致这个引导重新开始
             * 所以这里现在做一个过滤，前面如果引导过。那么开宝箱这里就需要return掉
             */
            // if (this._openHash.get(stageId)) {
            //     return;
            // }
            let stageInfo = AdventureManager.instance.getOneStageInfo(stageId);
            if (stageInfo && stageInfo.state == STAGE_STATU.REWARDED) {
                return;
            }

            let arr = this._xlsArr.filter((stage) => {
                return stage.unlockRequire.v1 == 2 && stage.unlockRequire.v2 == stageId;
            });
            let stageID = arr.length > 0 ? arr[0].unlockRequire.v2 : 0;
            if (arr.length > 0 && this.isSystemOpenPanelShow(arr)) {/**有系统解锁，并且弹框 */
                EventManager.once("system_alert_close", this, () => {
                    GuideMainManager.instance.checkGuideByStageComplete(stageID);
                });
            }
            else {
                GuideMainManager.instance.checkGuideByStageComplete(stageID);
            }
            for (const o of arr) {
                this.notifyAndAlertOpen(o.id, [], 0);
            }
        }

        private notifyAndAlertOpen(id: number, mapItemArr: number[], level: number) {
            //当前是未开放状态 
            if (!this._openHash.get(id) || mapItemArr.length > 0) {
                if (id > 0) {
                    this._openHash.add(id, true);
                    EventManager.event(globalEvent.SYSTEM_OPEN_CHANGED, [id, true]);
                }
                //是否需要显示alert
                if ((id > 0 && xls.get(xls.systemTable).get(id).show) || mapItemArr.length > 0 || level > 0)
                    alert.showSystemOpen(id, mapItemArr, level, { funArr: [() => { }, () => { EventManager.event("system_alert_close") }], caller: this });
            }
        }

        private onAdvOpenStateChange(data: pb.sc_event_control_info_notify) {
            for (const o of data.eventInfo) {
                let array: string[] = o.eventTime.split("_");
                this._advHash.add(o.id, {
                    id: o.id,
                    // startTime: new Date(array[0].replace(/\-/g, '/')).getTime() / 1000,
                    startTime: util.TimeUtil.formatTimeStrToSec(array[0]),
                    // endTime: new Date(array[1].replace(/\-/g, '/')).getTime() / 1000,
                    endTime: util.TimeUtil.formatTimeStrToSec(array[1]),
                    eventOff: o.off == 1
                })
            }
        }

        /**
         * 判断活动是否结束（eventControl表）
         * @param id 表中id
         * @returns true：关闭了 false：开着呢
         */
        public checkActOver(id: number) {
            let data = this._advHash.get(id);
            //没有配置 默认永久
            if (!data) return false;
            //配置下架
            if (data.eventOff) return true;
            //没有在活动时间内
            let currTime: number = clientCore.ServerManager.curServerTime;
            return currTime < data.startTime || currTime > data.endTime;
        }

        /**根据模块id（moduleOpen表中id）判断活动是否开启（eventControl）
         * @param id moduleOpen表中id
         * @return 关闭了返回true
         */
        public checkActOverByModId(id: number, needAlertReason: boolean = false) {
            let rtn = false
            if (xls.get(xls.eventControl)) {
                let xlsInfo = _.find(xls.get(xls.eventControl).getValues(), (o) => { return o.relatedModule == id });
                rtn = xlsInfo ? this.checkActOver(xlsInfo.eventId) : false
            }
            //需要提示且不在事件内
            if (needAlertReason && rtn)
                alert.showFWords('暂未开放 敬请期待')
            return rtn;
        }

        /**获取活动开放时间区间数组 秒 */
        public getActTimeZone(id: number) {
            let data = this._advHash.get(id);
            if (!data)
                return [];
            return [data.startTime, data.endTime];
        }
    }
}