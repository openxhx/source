namespace selfInfo {
    export class BattleInfoData {
        id?: number;
        level?: number;
        star?: number;
        power?: number;
        prayData?: { name: string, Identity: number, battleType: number, quality: number };
    }
    export class BattleInfoTab implements IselfInfoTabModule {
        public tab: number;
        private _mainUI: ui.selfInfo.tab.BattleInfoTabUI;
        private _model: SelfInfoModel;
        private _control: SelfInfoControl;
        private _noSelect: NoSelectDialog;

        constructor(ui: ui.selfInfo.tab.BattleInfoTabUI, sign: number) {
            this._mainUI = ui;
            this._model = clientCore.CManager.getModel(sign) as SelfInfoModel;
            this._control = clientCore.CManager.getControl(sign) as SelfInfoControl;
            this.initTab();
            this.addEventListeners();
        }

        private initTab() {
            this._mainUI.listRole.renderHandler = new Laya.Handler(this, this.onListRender);
            if (this._model.isSelf) {
                this._mainUI.listRole.mouseHandler = new Laya.Handler(this, this.onListMouse);
            }

            if (this._model.battle_self) {
                this.onSelfRender(this._mainUI.roleSelf, this._model.battle_self);

                this._mainUI.labGodPray.text = this._model.battle_godPray + "";
                this._mainUI.labAwake.text = this._model.battle_awake + "";
                if (this._model.battle_stageId > 0) {
                    this._mainUI.labStage.text = xls.get(xls.stageBase).get(this._model.battle_stageId).stageTitle + "";
                } else {
                    this._mainUI.labStage.text = "暂无通关记录";
                }
                this._mainUI.labTower.text = "暂未开放";

                this.updateView();
            }
        }

        private updateView(): void {
            let powers = this._model.battle_self.power;
            for (let i = 0; i < this._model.battle_roles.length; i++) {
                let data = this._model.battle_roles[i];
                if (data && data.id > 0) {
                    powers += data.power;
                }
            }
            this._mainUI.labPowers.text = powers + "";

            this._mainUI.listRole.dataSource = this._model.battle_roles;
        }

        private onSelfRender(cell: ui.selfInfo.render.BattleRoleSelfRenderUI, data: BattleInfoData) {
            cell.imgRoleRect.skin = pathConfig.getRoleRectImg(data.id);//是玩家自身的话 显示当前觉醒
            cell.imgAttr.skin = pathConfig.getRoleAttrIco(data.prayData.Identity);
            cell.txtName.text = this._model.userBaseInfo.nick;
            cell.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(data.prayData.battleType);
            cell.txtLv.text = 'LV' + data.level;
            cell.listStar.dataSource = this.getStarDataSource(data.star);
        }

        private onListRender(cell: ui.selfInfo.render.BattleRoleRenderUI) {
            let data: BattleInfoData = cell.dataSource;
            let haveCardShow = data && data.id > 0;
            cell.imgAdd.visible = false;
            cell.imgNo.visible = false;
            if (!haveCardShow) {
                if (this._model.isSelf) {
                    cell.imgAdd.visible = true;
                } else {
                    cell.imgNo.visible = true;
                }
            }
            //
            cell.imgFrameBg.visible = haveCardShow;
            cell.imgRoleRect.visible = haveCardShow;
            cell.boxAtt.visible = haveCardShow;
            cell.boxInfo.visible = haveCardShow;
            cell.imgDeco_0.visible = cell.imgDeco_1.visible = haveCardShow;
            if (haveCardShow) {
                cell.imgRoleRect.skin = pathConfig.getRoleRectImg(data.id);//是玩家自身的话 显示当前觉醒
                cell.imgAttr.skin = pathConfig.getRoleAttrIco(data.prayData.Identity);
                cell.imgArrtBg.skin = pathConfig.getRoleAttrBg(data.prayData.Identity);
                cell.txtName.text = data.prayData.name;
                cell.imgFrame.skin = pathConfig.getRoleQuality(data.prayData.quality);
                cell.imgDeco_0.skin = cell.imgDeco_1.skin = pathConfig.getRoleQualityDeco(data.prayData.quality);
                cell.imgFrameBg.skin = pathConfig.getRoleQualityBG(data.prayData.quality);
                cell.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(data.prayData.battleType);
                cell.txtLv.text = 'LV' + data.level;
                cell.txtLv.color = '#ffffff';
                cell.listStar.dataSource = this.getStarDataSource(data.star);
                cell.listStar1.dataSource = _.map(new Array(3), (v, idx) => {
                    return { 'index': data.star < idx + 1 ? 0 : 2 };
                })

                let maxStar = xls.get(xls.characterStar).get(data.id).maxStarLevel;
                cell.listStar.visible = maxStar > 3;
                cell.listStar1.visible = maxStar == 3;
            } else {
                cell.imgFrame.skin = pathConfig.getRoleQuality(0);
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this._mainUI.listRole.array[idx];
                let roleId = data.id || 0;
                let canselectArr = this.getPartnerArrBySelectId(roleId);
                if (canselectArr.length == 0) {
                    this.openNoSelectDiag('role');
                }
                else {
                    this.openRoleSelect(roleId, idx);
                }
            }
        }

        private onChangeSelfPray() {
            if (clientCore.SystemOpenManager.ins.getIsOpen(15)) {
                let openData = { tab: this.tab, uid: this._model.uid, inof: this._model.mentorInfo };
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.DialogMgr.ins.closeAllDialog();
                clientCore.ModuleManager.open('pray.PrayModule', null, { openWhenClose: 'selfInfo.SelfInfoModule', openData: openData });
            }
            else {
                alert.showFWords('神祈功能尚未开启');
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

        private openNoSelectDiag(title: 'role' | 'pray') {
            if (!this._noSelect)
                this._noSelect = new NoSelectDialog();
            this._noSelect.show(title);
        }

        private async openRoleSelect(currRoleId: number, idx: number) {
            let nowTeamArr = [];//当前
            for (let i = 0; i < this._model.battle_roles.length; i++) {
                let data = this._model.battle_roles[i];
                if (data && data.id) {
                    nowTeamArr.push(data.id);
                } else {
                    nowTeamArr.push(0);
                }
            }
            let data = {
                list: [],
                initSelectId: currRoleId,//已选则的可以更改
                mustSelect: false,
                filterIds: _.compact(_.without(nowTeamArr, nowTeamArr[idx]))//另外两个槽上的角色互斥过滤
            };
            let selfId = clientCore.RoleManager.instance.getSelfInfo().id;
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
            if (selectId != currRoleId) {
                this._control.rolesShow(idx, selectId, Laya.Handler.create(this, () => {
                    this.updateView();
                }));
            }
        }

        /**根据所选id获取能选择的角色数组 */
        getPartnerArrBySelectId(id: number) {
            let selfId = this._model.battle_self.id;
            let arr = _.map(clientCore.RoleManager.instance.getAllRoles(), (role) => {
                return role.id;
            })
            let mutuxIdArr = _.map(this._model.battle_roles, (data) => {
                if (data && data.id) {
                    return clientCore.RoleManager.instance.getRoleById(data.id).xlsId.mutexId;
                }
            })
            //排除主角、已上阵的同互斥id
            arr = _.filter(arr, (roleId) => {
                if (roleId == selfId)
                    return false;
                let mutuxId = clientCore.RoleManager.instance.getRoleById(roleId).xlsId.mutexId;
                if (mutuxIdArr.indexOf(mutuxId) > -1)
                    return false;
                return true;
            })
            //自身可以被换下 所以强行push进去 
            if (id > 0)
                arr.push(id);
            return _.uniq(arr);
        }

        private addEventListeners() {
            if (this._model.isSelf) {
                BC.addEvent(this, this._mainUI.roleSelf, Laya.Event.CLICK, this, this.onChangeSelfPray);
            }
        }

        show() {
            this._mainUI.visible = true;
        }

        hide() {
            this._mainUI.visible = false;
        }

        destroy() {
            this._model = this._control = null;
            this._noSelect?.destroy();
            this._noSelect = null;
            BC.removeEvent(this);
        }
    }
}