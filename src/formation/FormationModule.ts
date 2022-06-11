namespace formation {
    import RoleManager = clientCore.RoleManager;
    export class FormationModule extends ui.formation.FormationModuleUI {

        /** 阵型*/
        private _layout: dialog.LayoutDialog;
        /** 神祈选择*/
        private _pray: dialog.PrayDialog;
        /**神祇技能 */
        private _skillComp: PraySkillDragControl;
        /**无可选提示 */
        private _noSelect: dialog.NoSelectDialog;

        init(d?: any): void {
            super.init(d);
            this.addPreLoad(clientCore.FormationControl.instance.initXml());
            this.listRole.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRole.mouseHandler = new Laya.Handler(this, this.onListMouse);

            this.mcGuide1.y -= 20;
            this.mcGuide2.y += 20;
        }

        initOver(): void {
            this.onSlotChange();
            this.roleSelf.dataSource = RoleManager.instance.getSelfInfo().id;
            this.onSelfRender(this.roleSelf);
            this._skillComp = new PraySkillDragControl(this, this.onSkillClick);
        }

        popupOver() {
            clientCore.UIManager.showCoinBox();
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "formationModuleOpen") {
                if (clientCore.GuideMainManager.instance.curGuideInfo.mainID == 17 && clientCore.GuideMainManager.instance.curGuideInfo.stepID < 13) {
                    if (clientCore.FormationControl.instance.slotArr[1] > 0) {
                        clientCore.GuideMainManager.instance.skipStep(17, 10);
                        clientCore.GuideMainManager.instance.startGuide();
                    }
                    else if (clientCore.FormationControl.instance.slotArr[0] > 0) {
                        clientCore.GuideMainManager.instance.skipStep(17, 7);
                        clientCore.GuideMainManager.instance.startGuide();
                    }
                    else {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                    }
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            }
        }

        private getStarDataSource(star: number) {
            return _.map(new Array(5), (v, idx) => {
                let a = (idx + 1) * 2;
                let b = a - 1;
                if (a <= star) {
                    return { 'index': 2 };
                }
                else if (b <= star) {
                    return { 'index': 1 };
                }
                else {
                    return { 'index': 0 };
                }
            })
        }

        private onSelfRender(cell: ui.formation.render.RoleSelfRenderUI) {
            let roleInfo = RoleManager.instance.getRoleById(cell.dataSource);
            cell.imgRoleRect.skin = pathConfig.getRoleRectImg(roleInfo.srvData.curPray);//是玩家自身的话 显示当前觉醒
            cell.imgAttr.skin = pathConfig.getRoleAttrIco(roleInfo.xlsPray.Identity);
            cell.txtName.text = clientCore.LocalInfo.userInfo.nick
            cell.txtFight.text = roleInfo.fight.toString();
            cell.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(roleInfo.battleType);
            cell.txtLv.text = 'LV' + roleInfo.lv;
            cell.listStar.dataSource = this.getStarDataSource(roleInfo.star);
        }

        private onListRender(cell: ui.formation.render.RoleRenderUI, idx: number) {
            if (idx > -1)
                cell.y = idx % 2 == 0 ? -20 : 20;
            //datasource: 0-空槽  -1-未解锁  其他情况为角色id
            let haveCardShow = cell.dataSource != undefined && cell.dataSource > 0;
            cell.boxLock.visible = xls.get(xls.globaltest).get(1)['levelOfColumn' + (idx + 1)] > clientCore.LocalInfo.userLv;
            cell.imgAdd.visible = cell.dataSource == 0 && !cell.boxLock.visible;
            //
            cell.boxInfo.visible = haveCardShow;
            cell.imgAttr.visible = haveCardShow;
            cell.imgArrtBg.visible = haveCardShow;
            cell.imgBattleType.visible = haveCardShow;
            cell.imgInfoBg.visible = haveCardShow;
            cell.imgRoleRect.visible = haveCardShow;
            cell.imgFrameBg.visible = haveCardShow;
            cell.imgDeco_0.visible = cell.imgDeco_1.visible = haveCardShow;
            if (cell.boxInfo.visible) {
                let roleInfo = RoleManager.instance.getRoleById(cell.dataSource);
                let isSelf = RoleManager.instance.getSelfInfo().id == roleInfo.id;
                let quality = isSelf ? 0 : roleInfo.xlsId.quality;
                cell.imgRoleRect.skin = pathConfig.getRoleRectImg(isSelf ? roleInfo.srvData.curPray : roleInfo.id);//是玩家自身的话 显示当前觉醒
                cell.imgAttr.skin = pathConfig.getRoleAttrIco(isSelf ? roleInfo.xlsPray.Identity : roleInfo.xlsId.Identity);
                cell.imgArrtBg.skin = pathConfig.getRoleAttrBg(roleInfo.xlsId.Identity);
                cell.txtName.text = isSelf ? clientCore.LocalInfo.userInfo.nick : roleInfo.name;
                cell.imgFrame.skin = pathConfig.getRoleQuality(quality);
                cell.imgDeco_0.skin = cell.imgDeco_1.skin = pathConfig.getRoleQualityDeco(quality);
                cell.imgFrameBg.skin = pathConfig.getRoleQualityBG(quality);
                cell.txtFight.text = "战斗力 " + roleInfo.fight;
                cell.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(roleInfo.xlsId.battleType);
                cell.txtLv.text = 'LV' + roleInfo.lv;
                cell.txtLv.color = isSelf ? '#ff0000' : '#ffffff';
                cell.listStar.dataSource = this.getStarDataSource(roleInfo.star);
                cell.listStar1.dataSource = _.map(new Array(3), (v, idx) => {
                    return { 'index': roleInfo.star < idx + 1 ? 0 : 2 };
                })
                cell.listStar.visible = roleInfo.maxStar > 3;
                cell.listStar1.visible = roleInfo.maxStar == 3;

            }
            if (cell.boxLock.visible) {
                cell.txtUnlock.text = '等级达到 ' + xls.get(xls.globaltest).get(1)['levelOfColumn' + (idx + 1)];
                cell.imgFrame.skin = pathConfig.getRoleQuality(0);
            }
            if (cell.imgAdd.visible) {
                cell.imgFrame.skin = pathConfig.getRoleQuality(0);
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (clientCore.FormationControl.instance.slotArr[idx] != undefined && !e.currentTarget['boxLock'].visible) {
                    let roleId = clientCore.FormationControl.instance.slotArr[idx];
                    let canselectArr = clientCore.FormationControl.instance.getPartnerArrBySelectId(roleId)
                    if (canselectArr.length == 0) {
                        this.openNoSelectDiag('role');
                    }
                    else {
                        this.openRoleSelect(roleId, idx);
                    }


                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelectRole") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                }
            }
        }

        private async openRoleSelect(currRoleId: number, idx: number) {
            let nowTeamArr = clientCore.FormationControl.instance.slotArr;//当前
            let data = {
                list: [],
                initSelectId: currRoleId,//已选则的可以更改
                mustSelect: false,
                filterIds: _.compact(_.without(nowTeamArr, nowTeamArr[idx]))//另外两个槽上的角色互斥过滤
            };
            let selfId = clientCore.RoleManager.instance.getSelfInfo().id;
            let otherSlotRole = _.compact(nowTeamArr);//其他槽上已选择的角色
            data.list = _.map(clientCore.RoleManager.instance.getAllRoles(), (role) => {
                return role.id;
            }).filter((id) => {
                //主角不能参与
                return id != selfId;
            }).filter((id) => {
                //另外两个槽选过的不能参与(本身可以放进列表)
                let idx1 = nowTeamArr.indexOf(id);
                return idx1 == -1 || idx1 == idx;
            });
            let selectId = await clientCore.RoleManager.instance.openRoleSelect(data);
            if (selectId != currRoleId)
                clientCore.FormationControl.instance.setSlotArray(selectId, idx);
        }

        private openNoSelectDiag(title: 'role' | 'pray') {
            if (!this._noSelect)
                this._noSelect = new dialog.NoSelectDialog();
            this._noSelect.show(title);
        }

        /** 前往培养模块*/
        private goFoster(): void {
            this.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickFormationFosterBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            clientCore.ModuleManager.open("foster.FosterModule", null, { openWhenClose: 'formation.FormationModule' });
        }

        /** 前往阵型面板*/
        private goFormation(): void {
            // if (!this._layout)
            //     this._layout = new dialog.LayoutDialog();
            // this._layout.show();
            this.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickFormationBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            clientCore.ModuleManager.open("battleArray.BattleArrayModule", null, { openWhenClose: 'formation.FormationModule' });
        }

        private onChangeSelfPray() {
            if (clientCore.SystemOpenManager.ins.getIsOpen(15)) {
                this.destroy();
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelfRole") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
                clientCore.ModuleManager.open('pray.PrayModule', null, { openWhenClose: 'formation.FormationModule' });
            }
            else {
                alert.showFWords('神祈功能尚未开启');
            }
        }

        private onSlotChange() {
            this.listRole.dataSource = clientCore.FormationControl.instance.slotArr;
        }

        private onSkillClick(idx: number, id: number) {
            if (clientCore.FormationControl.instance.getPraySkillArrBySelectId(id).length == 0) {
                this.openNoSelectDiag('pray');
            }
            else {
                if (!this._pray)
                    this._pray = new dialog.PrayDialog();
                this._pray.show(id, idx);
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPraySkillIcon") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnFormation, Laya.Event.CLICK, this, this.goFormation);
            BC.addEvent(this, this.btnFoster, Laya.Event.CLICK, this, this.goFoster);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.roleSelf, Laya.Event.CLICK, this, this.onChangeSelfPray);
            EventManager.on(globalEvent.EV_SLOT_INFO_UPDATE, this, this.onSlotChange);
            EventManager.on(EV_GO_TO_MODULE, this, this.destroy);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "formationModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "listRoldCell_0") {
                    var obj: any;
                    obj = this.listRole.getCell(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "listRoldCell_1") {
                    var obj: any;
                    obj = this.listRole.getCell(1);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
            EventManager.off(globalEvent.EV_SLOT_INFO_UPDATE, this, this.onSlotChange);
            EventManager.off(EV_GO_TO_MODULE, this, this.destroy);
        }


        destroy(): void {
            super.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickFormationCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            if (this._pray)
                this._pray.destroy();
            if (this._layout)
                this._layout.destroy();
            if (this._noSelect)
                this._noSelect.destroy();
            this._skillComp.destory();
            this._skillComp = this._pray = this._layout = this._noSelect = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}