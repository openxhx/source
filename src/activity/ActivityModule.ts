namespace activity {
    enum TAB {
        loginReward,
        levelReward,
        clover,
        sevenChallange,
        leaf
    }
    export class ActivityModule extends ui.activity.ActivityModuleUI {
        private _tab: number = -1;
        private _activityId: number;
        private _panelHash: util.HashMap<ActivityBasePanel<any>>;
        private _oldPanel: ActivityBasePanel<any>;
        private _items: Array<ActivityItem>;
        private _sevenDayClose: boolean = false;//七日挑战是否关闭（只判断是否超过领奖时间）
        private _leafClose: boolean = false;//神叶成长是否关闭（买过且全部领完）
        init(d: any) {
            if (d != undefined) {
                this._tab = d;
            }
            this._panelHash = new util.HashMap();
            this.addPreLoad(net.sendAndWait(new pb.cs_get_seven_day_accumulate_reward_status()).then((data: pb.sc_get_seven_day_accumulate_reward_status) => {
                let timeInfo = xls.get(xls.globaltest).get(1).newbieChallengeTime;
                let rwdTime = (timeInfo.v2 - 1) * 86400 - clientCore.ServerManager.curServerTime + data.startTime;
                if (rwdTime <= 0) {
                    this._sevenDayClose = true;
                }
            }));
            this.addPreLoad(xls.load(xls.growPlan));
        }

        async seqPreLoad() {
            await net.sendAndWait(new pb.cs_get_grow_plan_info()).then((data: pb.sc_get_grow_plan_info) => {
                if (data.hasGrowPlan) {
                    this._leafClose = util.get1num(data.rewardStatus) == xls.get(xls.growPlan).length;
                }
            });
        }

        initOver(): void {
            let arr = this.creItems();
            //取第一个展示
            if (this._tab > -1) {
                this.onClick(arr[this._tab]);
            }
            else {
                this.onClick(arr[0]);
            }
        }

        popupOver() {
            if (clientCore.GlobalConfig.guideAutoPlay && clientCore.GuideMainManager.instance.isGuideAction) {
                Laya.timer.once(600, this, () => {
                    let event = new Laya.Event();
                    this.btnClose.event(Laya.Event.CLICK, event.setTo(Laya.Event.CLICK, this.btnClose, this.btnClose));
                });
            }
        }

        creItems() {
            this.cleanItems();
            this._items = [];
            let array: number[] = [22, 20, 1, 2, 6, 3, 4]; //活动在界面的顺序排序
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                array = [1, 2, 6];
            }
            array = _.filter(array, (id) => { return !clientCore.SystemOpenManager.ins.checkActOver(id) });
            //神叶养成和七日挑战根据条件排除
            if (this._sevenDayClose)
                _.pull(array, 3);
            if (this._leafClose)
                _.pull(array, 4);
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let item: ActivityItem = ActivityItem.create();
                item.setInfo(i, array[i], this);
                this._items.push(item);
            }
            return array
        }

        cleanItems(): void {
            if (this._items) {
                _.forEach(this._items, (element: ActivityItem) => {
                    element && element.dispose();
                })
                this._items = null;
            }
        }

        async onClick(activityId: number): Promise<void> {
            //检查活动是否下架
            if (clientCore.SystemOpenManager.ins.checkActOver(activityId)) {
                alert.showFWords("活动已经结束了");
                this.creItems(); //重新刷新界面
                return;
            }
            if (this._activityId == activityId) return;
            _.forEach(this._items, (element: ActivityItem) => {
                element.updateBG(activityId);
            })
            this._activityId = activityId;
            this._oldPanel && this._oldPanel.ui.removeSelf();
            this._oldPanel = await this.crePanel(activityId);
        }

        private async crePanel(activityId: number): Promise<ActivityBasePanel<any>> {
            let panel: ActivityBasePanel<any> = this._panelHash.get(activityId);
            if (!panel) {
                switch (activityId) {
                    case 1://勇气国的七日补给
                        panel = new SigninPanel(ui.activity.panel.DailyLoginPanel2UI);
                        break;
                    case 2://等级奖励
                        panel = new LvRewardPanel(ui.activity.panel.LvRewardPanelUI);
                        break;
                    case 3://芬妮的七日挑战
                        panel = new SevenChallangePanel(ui.activity.panel.SevenChallangeUI);
                        break;
                    case 4://成长计划
                        panel = new LeafPanel(ui.activity.panel.LeafPanelUI);
                        break;
                    case 6://四叶之约
                        panel = new CloverPanel(ui.activity.panel.CloverPanelUI);
                        break;
                    case 20://立夏之约
                        panel = new SummerDataPanel(ui.activity.panel.SummerPanelUI);
                        break;
                    case 22://夏日狂想曲
                        panel = new SummerDataPanel(ui.activity.panel.SummerPanelUI);
                        break;
                    default:
                        break;
                }
                if (panel.preLoadLen > 0) {
                    clientCore.LoadingManager.showSmall();
                    await panel.waitPreLoad();
                    clientCore.LoadingManager.hideSmall();
                    panel.preLoadOver();
                }
                this._panelHash.add(activityId, panel);
            }
            this.spCon.addChild(panel.ui);
            return panel;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            for (const panel of this._panelHash.getValues()) {
                panel.destory();
            }
            this._panelHash.clear();
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitActivityModuleClose") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }

            this.cleanItems();
// 如果是强弹打开的话 通知强弹
            EventManager.event(globalEvent.SIGN_ALERT_CLOSE);
        }
    }
}