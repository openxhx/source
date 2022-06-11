/// <reference path="MainUIBase.ts" />
namespace clientCore {
    export class WorldMapMainUI extends MainUIBase {
        private _mainUI: ui.main.worldMap.WorldMapMainUIUI;
        private _contactBtnState: number = 1;
        constructor() {
            super();
        }
        public setUp() {
            if (this._mainUI) {
                return;
            }
            this._mainUI = new ui.main.worldMap.WorldMapMainUIUI();
            this._mainUI.mouseThrough = true;
            this._mainUI.mcLeftView.mouseThrough = true;
            this._mainUI.mcRightView.mouseThrough = true;
            this._mainUI.drawCallOptimize = true;
            this._mainUI.ani1.gotoAndStop(0);
            this.addEvent();
            this.showUserInfo();
            this.onTaskChange();
            this.onCpRedUpdate();
            this.setConcactBgWidth();
            this.onFunnyToyInfoUpdate();
            this.regLimitActivity();
        }
        private onCpRedUpdate() {
            if (this._mainUI.btnCp.parent) {
                let cpMgr = clientCore.CpManager.instance;
                this._mainUI.imgCpRed.visible = cpMgr.applyList.length > 0 || cpMgr.getDivorceAlert() != undefined;
                this.refreshContactRed();
            }
        }

        private refreshContactRed(): void {
            this._mainUI.imgContactRed.visible = this._mainUI.imgCpRed.visible;
        }

        private onFunnyToyInfoUpdate() {
            let propClearNum = 0;
            let now = clientCore.ServerManager.curServerTime;
            for (const info of LocalInfo.srvUserInfo.propStampInfo) {
                if (now <= info.clearPropStamp) {
                    propClearNum += 1;
                }
            }
            this._mainUI.btnFunnyClear.visible = propClearNum > 0;
            this._mainUI.txtFunnyClearNum.text = propClearNum.toString();
        }

        private addEvent() {
            BC.addEvent(this, this._mainUI.btnFunny, Laya.Event.CLICK, this, this.onBtnClick);
            // BC.addEvent(this, this._mainUI.btnActivity, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnFriend, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnWareHouse, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnWorldMap, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnFamily, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnTask, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnCloth, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.imgHead, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnPet, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnCp, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnContact, Laya.Event.CLICK, this, this.onContact);
            BC.addEvent(this, this._mainUI.btnFunnyClear, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnLimitAc, Laya.Event.CLICK, this, this.onBtnClick);
            EventManager.on(globalEvent.FUNNY_TOY_INFO_UPDATE, this, this.onFunnyToyInfoUpdate);
            //CP系统红点
            EventManager.on(globalEvent.CP_APPLY_LIST_UPDATE, this, this.onCpRedUpdate);
            EventManager.on(globalEvent.CP_INFO_UPDATE, this, this.onCpRedUpdate);
            EventManager.on(globalEvent.CP_DIVORCE_ALERT, this, this.onCpRedUpdate);

            EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.setConcactBgWidth);
            EventManager.on(globalEvent.TASK_STATE_CHANGE, this, this.onTaskChange);
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            EventManager.on(globalEvent.MAP_ITEM_PICK, this, this.showItemFly);
            EventManager.on(globalEvent.USER_HEAD_IMAGE_CHANGE, this, this.onHeadChange);
            EventManager.on(globalEvent.STAGE_RESIZE, this, this.onResize);
            EventManager.on(globalEvent.UPDATE_LIMIT_ACTIVITY_RED, this, this.regLimitActivity);
            EventManager.on(globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onLimitActRedChange);
        }
        private onResize(): void {
            this._mainUI.mcRightView.x = Laya.stage.width;
        }

        /**
         * 注册限时活动红点啦
         */
        private regLimitActivity(): void {
            let litteRed: number[] = [];
            _.forEach(xls.get(xls.limitActivity).getValues(), (element: xls.limitActivity) => {
                let ret: number = LimitActivityMgr.checkActivity(element);
                ret == 1 && (litteRed = _.concat(litteRed, element.littleRed));
            });
            this._mainUI.btnLimitAc.redPointArr = litteRed;
        }

        private onLimitActRedChange(show: boolean) {
            this._mainUI.imgHaveAwardGet.visible = show;
        }
        private onContact(e?: Laya.Event): void {
            if (e && e.type == Laya.Event.MOUSE_DOWN && e.target.name == 'tag_1') return;
            if (this._contactBtnState == 1) {
                if (!this.checkAllContact()) {
                    alert.showFWords(`社交功能尚未解锁哦~`);
                    return;
                }
                this._mainUI.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                this._contactBtnState = 0;
                this._mainUI.ani1.once(Laya.Event.COMPLETE, this, () => {
                    Laya.stage.once(Laya.Event.MOUSE_DOWN, this, this.onContact);
                })
            } else {
                this._mainUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                this._contactBtnState = 1;
            }
            this._mainUI.ani1.play(0, false);
        }
        private checkAllContact(): boolean {
            let array: number[] = [17, 58];
            for (let i: number = 0; i < 2; i++) {
                if (SystemOpenManager.ins.getIsOpen(array[i])) return true;
            }
            return false;
        }
        private onHeadChange() {
            this._mainUI.imgHead.skin = LocalInfo.headImgUrl;
            this._mainUI.imgFrame.skin = LocalInfo.frameImgUrl;
        }
        private showItemFly(itemInfo: pb.IItem, itemPos: Laya.Point) {
            // let pos = MapInfo.calPositionByRowAndCol(build.mapPosRow, build.mapPosCol);
            let pos = new Laya.Point(itemPos.x, itemPos.y);
            MapManager.mapItemsLayer.localToGlobal(pos);
            //如果多个奖励 统一显示5个动画
            let id = itemInfo.id;
            let cnt = itemInfo.cnt;
            for (let i = 0; i < (cnt > 1 ? 5 : 1); i++) {
                let icon = new Laya.Image(ItemsInfo.getItemIconUrl(id));
                icon.anchorX = icon.anchorY = 0.5;
                icon.pos(pos.x, pos.y);
                if (xls.get(xls.materialBag).has(id)) {
                    this.flyProduct(icon, 60 * i, new Laya.Point(1520, 375));
                }
                else {
                    this.flyProduct(icon, 60 * i, new Laya.Point(80, 80));
                }
            }
        }
        private flyProduct(icon: Laya.Image, delay: number, aimPos: Laya.Point) {
            LayerManager.upMainLayer.addChild(icon);
            Laya.Tween.to(icon, { x: aimPos.x, y: aimPos.y, scaleX: 0.5, scaleY: 0.5 }, 700, Laya.Ease.sineInOut, new Laya.Handler(this, () => {
                icon.destroy();
            }), delay);
        }
        private onTaskChange() {
            let mainTask = TaskManager.getMainTalkInfo()[0];
            if (mainTask) {
                let xlsInfo = xls.get(xls.taskData).get(mainTask.taskid);
                this._mainUI.boxTask.visible = true;
                this._mainUI.txtTaskTitle.text = xlsInfo.task_title;
                this._mainUI.txtTaskTarget.text = xlsInfo.task_target;
                this._mainUI.txtTaskStep.text = mainTask.step.toString();
                this._mainUI.txtTaskTotal.text = '/' + xlsInfo.task_condition.v3;
            }
            else {
                this._mainUI.boxTask.visible = false;
            }
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "worldMapMainUI") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (this._mainUI[objName]) {
                    var obj: any;
                    obj = this._mainUI[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }


            }
        }
        public showUserInfo() {
            let expInfo = LocalInfo.getLvInfo();
            this._mainUI.txtLevel.changeText("" + expInfo.lv);
            this._mainUI.txtName.changeText(LocalInfo.userInfo.nick);
            this._mainUI.mcExpMask.x = (expInfo.expPercent - 1) * this._mainUI.mcExpMask.width;
            this._mainUI.imgHead.skin = LocalInfo.headImgUrl;
            this.onHeadChange();
        }
        private onBtnClick(e: Laya.Event) {
            switch (e.currentTarget) {
                case this._mainUI.btnFunnyClear:
                    FunnyToyManager.openClearModule();
                    break;
                case this._mainUI.btnFunny:
                    clientCore.ModuleManager.open('weddingItem.WeddingItemModule')
                    break;
                case this._mainUI.btnCp:
                    this.onContact();
                    clientCore.ToolTip.gotoMod(110);
                    break;
                case this._mainUI.btnPet:
                    ModuleManager.open("flowerPet.FlowerPetModule");
                    break;
                case this._mainUI.imgHead:
                    clientCore.ModuleManager.open('selfInfo.SelfInfoModule');
                    break;
                // case this._mainUI.btnActivity:
                //     ModuleManager.open('activity.ActivityModule');
                //     break;
                case this._mainUI.btnFriend:
                    ModuleManager.open("friends.FriendMainModule");
                    break;
                case this._mainUI.btnWorldMap:
                    ModuleManager.open("worldMap.WorldMapModule");
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickWroldMapIcon") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    break;
                case this._mainUI.btnWareHouse:
                    ModuleManager.open("backpack.BackpackModule");
                    break;
                case this._mainUI.btnFamily:
                    this.onContact();
                    FamilyMgr.ins.openFamily();
                    break;
                case this._mainUI.btnTask:
                    ModuleManager.open('task.TaskModule');
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UITaskIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    break;
                case this._mainUI.btnCloth:
                    clientCore.ModuleManager.open('clothChange.ClothChangeModule');
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UIClothIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    break;
                case this._mainUI.btnLimitAc:
                    // clientCore.Logger.sendLog('系统', 'UI按钮触达', '点击限时按钮');
                    ModuleManager.open('newActivity.NewActivityModule');
                    break;
            }
        }
        public open() {
            this.onResize();
            this._mainUI.mcLeftView.x = 0;
            this._mainUI.alpha = 1;
            this._mainUI.mouseEnabled = true;
            LayerManager.uiLayer.addChild(this._mainUI);
            UIManager.showTalk();
            this.showUserInfo();
        }
        public close() {
            this._mainUI.removeSelf();
        }
        public hide() {
            Laya.Tween.to(this._mainUI, { alpha: 0 }, 200);
            this._mainUI.mouseEnabled = false;
        }
        public show() {
            Laya.Tween.clearAll(this._mainUI);
            Laya.Tween.to(this._mainUI, { alpha: 1 }, 200);
            this._mainUI.mouseEnabled = true;
        }

        public isHide() {
            return !this._mainUI.mouseEnabled;
        }

        private setConcactBgWidth() {
            let systems: number[] = [17, 58];
            let value: number = 215;
            _.forEach(systems, (element: number) => {
                SystemOpenManager.ins.getIsOpen(element) == false && (value -= 75);
            })
            this._mainUI.imgBg.width = value;
        }
    }
}