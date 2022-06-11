namespace limitActivity {
    /**
     * 限时活动
     * limitActivity.LimitActivityModule
     * 策划案：\\files\incoming\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\1113\【优化】主UI优化20201113_Inory.docx
     */
    export class LimitActivityModule extends ui.limitActivity.LimitActivityModuleUI {

        private _wait: xls.limitActivity[] = [];
        private _t: time.GTime;

        constructor() { super(); }

        init(): void {
            let array: xls.limitActivity[] = [];
            let type: number = channel.ChannelControl.ins.isOfficial ? 1 : 2;
            _.forEach(xls.get(xls.limitActivity).getValues(), (element: xls.limitActivity) => {
                if (element.channel == 0 || element.channel == type) {
                    let ret: number = clientCore.LimitActivityMgr.checkActivity(element);
                    switch (ret) {
                        case 0:
                            this._wait.push(element);
                            break;
                        case 1:
                            array.push(element);
                            break;
                        default:
                            break;
                    }
                }
            })
            // 初始化UI
            this.list.vScrollBarSkin = '';
            this.list.itemRender = ActivityItem;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.array = array;
            // 启动定时器
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();
            // 打开界面的时候更新一次主界面红点
            EventManager.event(globalEvent.UPDATE_LIMIT_ACTIVITY_RED);
        }

        private onLimitActRedChange() {
            this.list.startIndex = this.list.startIndex;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            EventManager.on(globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onLimitActRedChange);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
            EventManager.off(globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onLimitActRedChange);
        }

        destroy(): void {
            this._t?.dispose();
            this._wait.length = 0;
            this._t = this._wait = null;
            super.destroy();
        }

        private onTime(): void {
            //检查活动
            let hasChange: boolean = false;
            let len: number = this.list.length;
            for (let i: number = 0; i < len; i++) {
                let ret: number = clientCore.LimitActivityMgr.checkActivity(this.list.array[i]);
                if (ret != 1) {
                    this.list.deleteItem(i);
                    hasChange = true;
                }
            }
            //检查等待活动
            if (this._wait.length <= 0) return;
            _.remove(this._wait, (element: xls.limitActivity) => {
                let ret: number = clientCore.LimitActivityMgr.checkActivity(element);
                if (ret == 1) {
                    this.list.addItem(element);
                    hasChange = true;
                }
                return ret != 0;
            })
            //更新一次主界面红点
            hasChange && EventManager.event(globalEvent.UPDATE_LIMIT_ACTIVITY_RED);
        }

        private listRender(item: ActivityItem, index: number): void {
            item.setInfo(this, this.list.array[index]);
        }
    }
}