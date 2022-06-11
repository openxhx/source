namespace task {
    export enum TAB {
        MAIN,
        DAIRY
    }
    export class TaskModule extends ui.task.TaskModuleUI {
        // private _detailPanel: TaskDetailPanel;
        private _mainPanel: TaskMainPanel;
        private _dairyPanel: TaskDailyPanel;
        private _tab: TAB;
        constructor() {
            super();
        }
        public init(d: any) {
            super.init(d);
            this._mainPanel = new TaskMainPanel(this.mcMainTaskPanel);
            this._dairyPanel = new TaskDailyPanel(this.mcDiaryTalkPanel);
            this.mcMainTaskPanel.visible = this.mcDiaryTalkPanel.visible = false;
            if (d != undefined)
                this.showPanel(d);
            else
                this.showPanel(TAB.MAIN);

            this.mcDailyTab.visible = clientCore.LocalInfo.userLv >= 8;
        }
        public onPreloadOver() {

        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "taskModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }
        private showPanel(tab: TAB) {
            if (this._tab != tab) {
                if (tab == TAB.MAIN) {
                    this._mainPanel.show();
                    this.setChildIndex(this.mcMainTab, this.getChildIndex(this.mcBg) + 1);
                }
                else {
                    this._mainPanel.hide();
                    this.setChildIndex(this.mcMainTab, 0);
                }
                if (tab == TAB.DAIRY) {
                    this._dairyPanel.show();
                    this.setChildIndex(this.mcDailyTab, this.getChildIndex(this.mcBg) + 1);
                }
                else {
                    this._dairyPanel.hide();
                    this.setChildIndex(this.mcDailyTab, 0);
                }
                this.tabMain.skin = tab == TAB.MAIN ? "task/tabTask1.png" : "task/tabTask.png";
                this.tabDairy.skin = tab == TAB.DAIRY ? "task/tabDaily1.png" : "task/tabDaily.png";
                this._tab = tab;
            }
        }

        private onOpenDetail(info: pb.ITask) {
            // clientCore.DialogMgr.ins.open(this._detailPanel);
            // this._detailPanel.show(info);
        }

        private async onGo(interfaceId: number,extData:number) {
            let exit = true;
            //新手引导，不走直接跳转逻辑，走打开世界地图逻辑
            if(clientCore.GuideMainManager.instance.isGuideAction){
                extData = 0;
            }
            let jumpSuccFlag = false;
            if(extData && extData > 0){
                jumpSuccFlag = await clientCore.JumpManager.jumpByItemID(extData)
            }
            if(!jumpSuccFlag){
                clientCore.ToolTip.gotoMod(interfaceId);
            }
            if (exit) {
                this.onClose();
            }
        }

        private onClose() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickTaskCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.destroy();
        }

        public addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.mcMainTab, Laya.Event.CLICK, this, this.showPanel, [TAB.MAIN]);
            BC.addEvent(this, this.mcDailyTab, Laya.Event.CLICK, this, this.showPanel, [TAB.DAIRY]);
            EventManager.on(TaskEvent.OPEN_DETAIL, this, this.onOpenDetail);
            EventManager.on(TaskEvent.GO_TASK_MODULE, this, this.onGo);

            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "taskModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "btnReward") {
                    var obj: any;
                    let taskID = isNaN(parseInt(clientCore.GuideMainManager.instance.curGuideInfo.data)) ? 0 : parseInt(clientCore.GuideMainManager.instance.curGuideInfo.data);
                    obj = this._mainPanel.getBtnGetReward(taskID);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnGo") {
                    var obj: any;
                    obj = this._mainPanel.getBtnGetReward(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        public removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(TaskEvent.GO_TASK_MODULE, this, this.onGo);
            EventManager.off(TaskEvent.OPEN_DETAIL, this, this.onOpenDetail);
            EventManager.off(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        public destroy() {
            super.destroy();
            this._mainPanel?.destory();
            this._dairyPanel?.destory();
            this._mainPanel = null;
            this._dairyPanel = null;
        }
    }
}