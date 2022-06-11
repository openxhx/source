namespace newActivity {
    /**
     * 活动
     * newActivity.NewActivityModule
     */
    export class NewActivityModule extends ui.newActivity.NewActivityModuleUI {

        private _waitCfg: xls.limitActivity[] = [];
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
                            this._waitCfg.push(element);
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
            this.list.hScrollBarSkin = '';
            this.list.scrollBar.elasticBackTime = 200;
            this.list.scrollBar.elasticDistance = 200;
            this.list.itemRender = ActivityItem;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.array = array;

            this.moduleList.hScrollBarSkin = '';
            this.moduleList.scrollBar.elasticBackTime = 200;
            this.moduleList.scrollBar.elasticDistance = 200;
            this.moduleList.itemRender = ModuleItem;
            this.moduleList.renderHandler = new Laya.Handler(this, this.moduleRender, null, false);
            this.moduleList.mouseHandler = new Laya.Handler(this, this.moduleMouse, null, false);
            this.moduleList.array = [125, 99, 124, 126, 127];
            // 启动定时器
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();
            // 打开界面的时候更新一次主界面红点
            EventManager.event(globalEvent.UPDATE_LIMIT_ACTIVITY_RED);
            // 默认打开活动
            this.onTab(1);
        }

        private onLimitActRedChange() {
            this.list.startIndex = this.list.startIndex;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            for (let i: number = 1; i < 3; i++) {
                BC.addEvent(this, this[`tab_${i}`], Laya.Event.CLICK, this, this.onTab, [i]);
            }
            EventManager.on(globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onLimitActRedChange);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
            EventManager.off(globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onLimitActRedChange);
        }

        destroy(): void {
            this._t?.dispose();
            if (this._waitCfg) this._waitCfg.length = 0;
            this._t = this._waitCfg = null;
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
            if (this._waitCfg.length <= 0) return;
            _.remove(this._waitCfg, (element: xls.limitActivity) => {
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

        private moduleRender(item: ModuleItem, index: number): void {
            item.setInfo(this, this.moduleList.array[index], index + 1);
        }

        private moduleMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let id: number = this.moduleList.array[index];
            let cfg: xls.systemTable = xls.get(xls.systemTable).get(id);
            if (cfg.unlockRequire.v2 <= clientCore.LocalInfo.userLv) { //等级足够
                switch (index) {
                    case 0:
                    case 1:
                    case 2:
                        clientCore.ToolTip.gotoMod(cfg.moduleOpenId);
                        break;
                    case 3:
                        clientCore.PartyManager.openFlag ? clientCore.MapManager.enterParty(clientCore.LocalInfo.uid) : clientCore.ToolTip.gotoMod(25);
                        break;
                    case 4:
                        clientCore.ToolTip.gotoMod(clientCore.RestaurantManager.checkTaskFinish() ? cfg.moduleOpenId : 25);
                        break;
                }
            }
        }

        private onTab(index: number): void {
            this.ani1.index = index - 1;
            this.list.visible = index == 1;
            this.moduleList.visible = index == 2;
        }
    }
}