namespace clientCore {
    /**
     * 活动面板
     */
    export class ActivityBarView extends Laya.Sprite {

        private _activityMap: util.HashMap<ActivityItem> = new util.HashMap<ActivityItem>();
        private _unlockMap: xls.activityIcon[] = [];
        /**x方向数量 */
        private _rx: number; //x方向数量
        /**x方向间隔 */
        private _sx: number; //x方向间隔
        /**y方向间隔 */
        private _sy: number; //y方向间隔
        /**当前x方向数量 */
        private _cx: number; //当前x方向数量
        /**当前y方向数量 */
        private _cy: number; //当前y方向数量
        /**第二行头部位置 */
        private _fixX: number;

        private _t: time.GTime;

        constructor() { super(); }

        /**
         * 初始化活动面板
         * @param rx x方向数量
         * @param sx x方向间隔
         * @param sy y方向间隔
         * @param w 宽度
         * @param h 高度
         */
        public init(rx: number, sx: number, sy: number, w: number, h: number): void {
            this.mouseThrough = true;
            this.addEvents();
            this.drawCallOptimize = true;
            this._rx = rx;
            this._sx = sx;
            this._sy = sy;
            this._cx = this._cy = 0;
            this.width = w;
            this.height = h;
            this._fixX = 0;
            this.creItems();
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();

            this.checkThreeDay();
        }

        private checkThreeDay() {
            // net.sendAndWait(new pb.cs_get_login_activity_status()).then((data: pb.sc_get_login_activity_status) => {
            //     //第三天奖励已领取
            //     if (util.getBit(data.flag, 3) == 1) {
            //         this.removeItem(2);
            //         this.layoutItems();
            //     }
            // })
        }

        public fixXChange(x: number) {
            if (this._fixX != x) {
                this._fixX = x;
                this.layoutItems();
            }
        }


        private addEvents(): void {
            BC.addEvent(this, EventManager, globalEvent.SYSTEM_OPEN_CHANGED, this, this.onUpdate);
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        private onTime(): void {
            _.forEach(this._activityMap.getValues(), (element) => {
                let result: number = this.checkActivity(element.data);
                if (result != 1) {
                    console.log("remove activityitem: " + result);
                    this.removeItem(element.id);
                    this.layoutItems();
                }
            })
        }

        /**
         * 这里全量创建开启且在活动时间内的item
         * 未开启且未开启或者已经开始的活动会加入到列表里面等待检查
         */
        private creItems(): void {
            let activitys: xls.activityIcon[] = xls.get(xls.activityIcon).getValues();
            activitys = _.filter(activitys, (o) => {
                if (channel.ChannelControl.ins.isOfficial)
                    return o.channel == 0 || o.channel == 1;
                else
                    return o.channel == 0 || o.channel == 2;
            })
            _.forEach(activitys, (element) => {
                if (channel.ChannelControl.ins.isOfficial || element.id != 31) { //去除非官服的屈臣氏
                    let result: number = this.checkActivity(element);
                    let open: boolean = this.checkOpen(element);
                    if (open && result == 1) {
                        this.addItem(this.creItem(element.id))
                    } else if (!open && result != 2) {
                        this._unlockMap.push(element);
                    }
                }
            })
        }

        private creItem(id: number): ActivityItem {
            let data: xls.activityIcon = xls.get(xls.activityIcon).get(id);
            if (!data) {
                console.error("activityIcon表不存在id：" + id);
                return;
            }
            let item: ActivityItem = new ActivityItem();
            item.data = data;
            return item;
        }

        private getItem(activityId: number): ActivityItem {
            return this._activityMap.get(activityId);
        }

        private removeItem(activityId: number): void {
            let item: ActivityItem = this.getItem(activityId);
            item?.destroy();
            this._activityMap.remove(activityId);
        }

        private addItem(item: ActivityItem): void {
            if (!item) return;
            this._activityMap.add(item.id, item);
            this.layoutItem(item);
            this.addChild(item);
        }

        /**
         * 活动更新
         * @param id 序号id
         * @param bAdd
         */
        private updateActivity(id: number, bAdd: boolean): void {
            if (bAdd) {
                this.addItem(this.creItem(id));
                return;
            }
            this.removeItem(id);
            this.layoutItems();
        }

        public setItemRed(activityId: number, isShow: boolean): void {
            let item: ActivityItem = this.getItem(activityId);
            item && (item.redPoint = isShow);
        }

        /**
         * 对item排版 以activityIcon表的序号顺序排序
         */
        private layoutItems(): void {
            this._cx = this._cy = 0;
            let array: ActivityItem[] = _.sortBy(this._activityMap.getValues(), "id");
            _.forEach(array, (element: ActivityItem) => { this.layoutItem(element); })
        }

        private layoutItem(item: ActivityItem): void {
            item.x = this.width - this._cx * item.width - this._sx - this._cy * this._fixX;
            item.y = this._cy * (item.height + this._sy);
            if (++this._cx >= this._rx) {
                this._cx = 0;
                this._cy++;
            }
        }

        /**
         * 检查活动
         * @param value 
         * @return 返回 0-活动未开始 1-活动中 2-没有关联活动、活动不存在、活动结束了、活动下架了
         */
        private checkActivity(value: xls.activityIcon): number {
            let data: xls.eventControl = xls.get(xls.eventControl).get(value.relationActivity);
            if (!data) {
                console.log(`序号${value.id}没有关联活动、或关联的活动并不存在。`);
                return 2;
            }
            if (data.eventOff) return 2;
            if (data.eventTime) {
                let array: string[] = data.eventTime.split("_");
                let st: number = util.TimeUtil.formatTimeStrToSec(array[0]);
                let et: number = util.TimeUtil.formatTimeStrToSec(array[1]);
                let ct: number = clientCore.ServerManager.curServerTime;
                if (ct < st) return 0;
                if (ct > et) return 2;
            }
            return 1;
        }

        /**
         * 检查活动是否开启
         * @param value 
         */
        private checkOpen(value: xls.activityIcon): boolean {
            let data: xls.systemTable = xls.get(xls.systemTable).get(value.relationSystem);
            if (data) {
                let type: number = data.unlockRequire.v1;
                if (type == 1) { //等级
                    return clientCore.LocalInfo.userLv >= data.unlockRequire.v2;
                } else if (type == 2) { //主线关卡解锁
                    let stageInfo = AdventureManager.instance.getOneStageInfo(data.unlockRequire.v2);
                    return stageInfo ? stageInfo.state != STAGE_STATU.NO_COMPLETE : false
                }
            }
            return false;
        }

        private onUpdate(): void {
            let len: number = this._unlockMap.length;
            if (len <= 0) return;
            _.remove(this._unlockMap, (element) => {
                let open: boolean = this.checkOpen(element);
                let result: number = this.checkActivity(element);
                open && result == 1 && this.updateActivity(element.id, true); //开启且在活动时间内才显示出来
                return open || result == 2;
            })
        }
    }
}