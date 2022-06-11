namespace mapBean {
    export class RestaurantEnterBean implements core.IMapBean {
        private _mainUI: clientCore.MapTouchObject;
        start(ui?: any, data?: any): void {
            this._mainUI = ui;
            this.addEVentListners();
            this.init();
        }
        init() {
            this._mainUI.visible = this.checkTaskFinish();
        }
        addEVentListners() {
            BC.addEvent(this, EventManager, globalEvent.RESTAURANT_ENTER_OPEN_START, this, this.playOpenModule);
            // BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        // private findGuideHoleInfo() {
        //     if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "partyEnterBean") {
        //         let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
        //         if (objName == "partyInterImg") {
        //             EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this._mainUI);
        //         }
        //         else {
        //             EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
        //         }
        //     }
        // }

        private checkTaskFinish(){
            let task = clientCore.TaskManager.getTaskById(1034);
            if(clientCore.LocalInfo.userLv >= 40 && task == undefined) return true;
            if(task?.state == 3) return true;
            return false;
        }

        playOpenModule() {
            this._mainUI.visible = false;
            clientCore.RestaurantManager.openGuideFlag = true;
            let render: clientCore.Bone = clientCore.BoneMgr.ins.play(`res/animate/restaurant/restaurant.sk`, 0, false, clientCore.MapManager.mapItemsLayer);
            render.scaleX = render.scaleY = 0.96;
            render.pos(this._mainUI.x - 544, this._mainUI.y + 470);
            render.on(Laya.Event.COMPLETE, this, () => {
                this._mainUI.visible = true;
                render.dispose();
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "openMoviePlayOver") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            })
        }

        touch(): void {
            if (clientCore.MapInfo.mapEditState) {
                alert.showFWords("请先退出编辑状态，然后再进入餐厅吧");
                return;
            }
            if (clientCore.MapInfo.isSelfHome) {
                clientCore.ModuleManager.open("restaurant.RestaurantModule");
            }
            // //引导
            // if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickEnterParty") {
            //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            // }
        }
        redPointChange(): void {

        }
        destroy(): void {
            BC.removeEvent(this);
            clientCore.RestaurantManager.openGuideFlag = false;
        }
    }
}