namespace adventureMission {
    import AdventureMissonManager = clientCore.AdventureMissonManager;
    import AdventureManager = clientCore.AdventureManager;
    import TEAM_STATE = clientCore.TEAM_STATE;
    import TeamInfo = clientCore.TeamInfo;

    export class AdventureMissionModule extends ui.adventureMission.adventureMissionModuleUI {
        private _preparePanel: MissionPreparePanel;
        private _searchPanel: MissionSearchingPanel;
        private _currTeamArr: number[];//当前选择好的角色id数组

        constructor() {
            super();
            this._currTeamArr = [];
            this.listMap.itemRender = MiniMapRender;
            this.listMap.hScrollBarSkin = null;
            this.listMap.mouseHandler = new Laya.Handler(this, this.onListMapMouse);
            this.listMap.mouseEnabled = true;
            this.listTeam.renderHandler = new Laya.Handler(this, this.onTeamListRender);
            this.listTeam.selectHandler = new Laya.Handler(this, this.onTeamSelect);
            this.listTeam.selectEnable = this.listTeam.mouseEnabled = true;
            this.addPreLoad(AdventureMissonManager.instance.initXlsAndSrvData());
            this.addPreLoad(clientCore.RoleManager.instance.initXml());
        }

        public async seqPreLoad() {
            await AdventureManager.instance.updateAllByType(0);
        }

        public onPreloadOver() {
            this._preparePanel = new MissionPreparePanel();
            this._searchPanel = new MissionSearchingPanel();
            this.mcPanelCon.addChild(this._preparePanel);
            this.mcPanelCon.addChild(this._searchPanel);
            this.listTeam.dataSource = AdventureMissonManager.instance.teamsInfo;
            this.listMap.dataSource = xls.get(xls.exploreBase).getValues();
            this.listTeam.selectedIndex = 0;
            Laya.timer.loop(1000, this, this.onTimer);

            let rect: Laya.Rectangle = Laya.Rectangle.create();
            rect.setTo(0, 0, this.mapCon.width, this.mapCon.height);
            this.mapCon.scrollRect = rect;
            clientCore.Logger.sendLog('关卡系统', '探索小队', `打开探索小队面板`);
        }

        private onTimer() {
            let hasTeam = _.find(AdventureMissonManager.instance.teamsInfo, (team) => {
                return team.state != TEAM_STATE.WAIT_SET;
            })
            if (hasTeam)
                this.listTeam.refresh();
        }

        /**顶部小队栏信息 */
        private onTeamListRender(ui: ui.adventureMission.panel.TabPanelUI, idx: number) {
            let info = ui.dataSource as TeamInfo;
            ui.clipBg.index = idx == this.listTeam.selectedIndex ? 2 : 0;
            ui.txtTeamName.text = "小队" + info.teamName;
            ui.mcTeam.visible = info.unlocked;
            ui.mcLock.visible = !info.unlocked;
            ui.txtLockInfo.text = AdventureMissonManager.UNLOCK_STRING[idx];
            ui.txtInfo.color = info.state == TEAM_STATE.COMPLETE ? '#04f317' : '#805329';
            if (info.state == TEAM_STATE.WAIT_SET)
                ui.txtInfo.text = '待配置';
            if (info.state == TEAM_STATE.WORKING)
                ui.txtInfo.text = util.StringUtils.getDateStr(info.restTime, ':');
            if (info.state == TEAM_STATE.COMPLETE)
                ui.txtInfo.text = '探索完毕';
            let per = info.state == TEAM_STATE.WORKING ? 1 - info.restTime / info.srvData.lastTime : 0;
            ui.imgMask.x = 198 * (per - 1);
        }

        private onListMapMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let item: any = this.listMap.getCell(idx);
                if (item.canCheck && idx != this.listMap.selectedIndex) {
                    this.listMap.selectedIndex = idx;
                    this._preparePanel?.resetTime();
                    this.showTeamSk(this.listTeam.selectedItem.srvData.roleId);
                }
            }
        }

        /**选队伍的时候 角色变,地图列表也变 */
        private onTeamSelect(idx: number) {
            let teamInfo = this.listTeam.selectedItem as TeamInfo;
            if (teamInfo.state == TEAM_STATE.WAIT_SET)
                //选一个没有队伍的地图
                this.listMap.selectedIndex = _.findIndex(this.listMap.dataSource, (v: any) => {
                    return AdventureMissonManager.instance.getTeamInfoByExploreId(v.id) == undefined;
                });
            else
                //当前队伍在的地图
                this.listMap.selectedIndex = _.findIndex(xls.get(xls.exploreBase).getValues(), { 'id': teamInfo.srvData.exploreId });
            //角色
            this._preparePanel?.resetTime();
            this.showTeamSk(teamInfo.srvData.roleId);
            this.listMap.visible = teamInfo.state == TEAM_STATE.WAIT_SET;
            this._preparePanel.visible = teamInfo.state == TEAM_STATE.WAIT_SET;
            this._searchPanel.visible = teamInfo.state != TEAM_STATE.WAIT_SET;
        }

        /**
         * 这里面会根据传入的角色id改变_currTeamArr
         * @param idArr 
         */
        private showTeamSk(idArr: number[]) {
            for (let i = 0; i < 3; i++) {
                if (!idArr[i]) {
                    idArr[i] = 0;
                }
            }
            let teamInfo = this.listTeam.selectedItem as TeamInfo;
            let mapInfo = this.listMap.selectedItem as xls.exploreBase;
            //特殊处理：如果当前队伍没有探索 且选中的地图有队伍正在进行 隐藏角色
            if (AdventureMissonManager.instance.getTeamInfoByExploreId(mapInfo.id) && teamInfo.state == TEAM_STATE.WAIT_SET) {
                this._preparePanel.visible = false;
                for (let i = 0; i < 3; i++) {
                    this['role_' + i].visible = false;
                }
                return;
            }
            this.teamPos.gotoAndStop(teamInfo.state);
            for (let i = 0; i < 3; i++) {
                let id = idArr[i];
                let roleUI = this['role_' + i] as ui.adventureMission.panel.RoleInfoPanelUI;
                roleUI.visible = true;
                //初始化UI(只有待配置情况下 才显示其他UI， 探索和探索中都只显示sk) 
                roleUI.txtFight.visible = roleUI.imgBottom.visible = roleUI.imgArrow.visible = roleUI.imgTxBg.visible = teamInfo.state == TEAM_STATE.WAIT_SET;
                if (teamInfo.state == TEAM_STATE.WAIT_SET) {
                    roleUI.txtFight.visible = roleUI.imgAttr.visible = roleUI.imgTxBg.visible = id != 0 || mapInfo.classRequire[i] != 0;
                }
                roleUI.txtFight.text = id == 0 ? '所需属性:' : '战斗力' + clientCore.RoleManager.instance.getRoleById(id).fight;
                roleUI.imgArrow.visible = id == 0; //选好了人影藏箭头
                roleUI.imgAttr.visible = id == 0;
                if (id == 0)
                    roleUI.imgAttr.skin = pathConfig.getRoleAttrIco(mapInfo.classRequire[i]);
                if (teamInfo.state == TEAM_STATE.COMPLETE) {
                    roleUI.txtFight.visible = roleUI.imgAttr.visible = roleUI.imgTxBg.visible = false;
                }
                //只替换修改的
                if (id != this._currTeamArr[i]) {
                    this.unLoadSk(roleUI.boxRole);
                    if (id > 0)
                        this.loadSk(id, roleUI.boxRole, teamInfo.state == TEAM_STATE.WORKING ? 'move' : 'idle');
                }
                this._currTeamArr[i] = id;//替换id
                if (roleUI.boxRole.numChildren > 0) {
                    (roleUI.boxRole.getChildAt(0) as Laya.Skeleton).play(teamInfo.state == TEAM_STATE.WORKING ? 'move' : 'idle', true);
                }
            }
            //如果队伍有了更改且在准备模式下 更换准备面板数据
            if (teamInfo.state == TEAM_STATE.WAIT_SET) {
                this._preparePanel.visible = true;
                this._preparePanel.show(this.listTeam.selectedIndex, this._currTeamArr, mapInfo);
            }
            if (teamInfo.state != TEAM_STATE.WAIT_SET) {
                this._searchPanel.show(this.listTeam.selectedIndex);
            }

            //地图处理
            this.imgBg.pos(0, 0);
            this.imgBg.skin = pathConfig.getMissonBigMap(mapInfo.id);
            this.pallingMap(false);
            teamInfo.state == TEAM_STATE.WORKING && this.pallingMap(true, this.imgBg);
        }

        private loadSk(id: number, parent: any, ani: string) {
            let sk = new Laya.Skeleton();
            sk.load(pathConfig.getRoleBattleSk(id), new Laya.Handler(this, () => {
                parent.removeChildren();
                sk.scaleX = -1;
                sk.play(ani, true);
                parent.addChild(sk);
            }));
        }

        private unLoadSk(node: any) {
            if (node.numChildren == 1)
                node.getChildAt(0).destroy();
            node.removeChildren();
        }

        private async onChangeRole(idx: number) {
            let nowTeamArr = this._currTeamArr.slice();
            if (this.listTeam.selectedItem.state == TEAM_STATE.WAIT_SET) {
                let attr = this.listMap.selectedItem.classRequire[idx];
                let data = {
                    list: [],
                    initSelectId: nowTeamArr[idx],//已选则的可以更改
                    mustSelect: true,
                    filterIds: _.without(nowTeamArr, nowTeamArr[idx])//另外两个槽上的角色互斥过滤
                };
                //需求属性为0代表任意属性均可
                data.list = attr == 0 ? clientCore.RoleManager.instance.getAllRoles() : clientCore.RoleManager.instance.getRolesByIdentity(attr);
                //其他队伍的角色也需要排除
                let allWorkingId = _.uniq(_.compact(_.flatten(_.map(AdventureMissonManager.instance.teamsInfo, (team) => {
                    return team.srvData.roleId;
                }))));
                let selfId = clientCore.RoleManager.instance.getSelfInfo().id;
                data.list = _.map(data.list, (role) => {
                    return role.id;
                }).filter((id) => {
                    //主角不能参与
                    return id != selfId && allWorkingId.indexOf(id) == -1;
                }).filter((id) => {
                    //另外两个槽选过的不能参与(本身可以放进列表)
                    let idx1 = nowTeamArr.indexOf(id);
                    return idx1 == -1 || idx1 == idx;
                });
                if (data.list.length > 0) {
                    nowTeamArr[idx] = await clientCore.RoleManager.instance.openRoleSelect(data);
                    this.showTeamSk(nowTeamArr);
                }
                else {
                    alert.showFWords('没有对应属性可用的角色!');
                }
            }
        }

        private autoMission() {
            let nowTeamArr = this._currTeamArr.slice();
            //其他队伍的角色也需要排除
            let allWorkingId = _.uniq(_.compact(_.flatten(_.map(AdventureMissonManager.instance.teamsInfo, (team) => {
                return team.srvData.roleId;
            }))));
            //主角
            let selfId = clientCore.RoleManager.instance.getSelfInfo().id;
            for (let idx = 0; idx < 3; idx++) {
                let attr = this.listMap.selectedItem.classRequire[idx];
                //根据属性过滤备选角色
                let arr = attr == 0 ? clientCore.RoleManager.instance.getAllRoles() : clientCore.RoleManager.instance.getRolesByIdentity(attr);
                //另外两个槽对应的基础角色
                let copy = nowTeamArr.slice();
                copy.splice(idx, 1);
                let mutexIdArr = _.compact(copy).map((id) => {
                    let info = clientCore.RoleManager.instance.getRoleById(id);
                    return info ? info.xlsId.mutexId : 0;
                })
                //根据条件过滤备选角色
                arr = _.filter(arr, (role) => {
                    //主角不能参与
                    return role.id != selfId && allWorkingId.indexOf(role.id) == -1;
                }).filter((role) => {
                    //另外两个槽选过的不能参与(本身可以放进列表)
                    let idx1 = nowTeamArr.indexOf(role.id);
                    return idx1 == -1 || idx1 == idx;
                }).filter((role) => {
                    //另外两个槽所选的基础角色相同的不能选
                    return mutexIdArr.indexOf(role.xlsId.mutexId) == -1;
                })
                //如果有备选角色 选择战斗力最高的
                if (arr.length > 0) {
                    arr = _.sortBy(arr, o => o.fight);
                    nowTeamArr[idx] = _.last(arr).id;
                }
            }
            this.showTeamSk(nowTeamArr);
            if (_.compact(nowTeamArr).length < 3) {
                alert.showFWords('没有合适的角色能派遣了');
            }
        }

        private onTeamInfoUpdate() {
            this.listTeam.refresh();
            this.listMap.refresh();
            this.onTeamSelect(this.listTeam.selectedIndex);
        }

        addEventListeners() {
            super.addEventListeners();
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            EventManager.on(globalEvent.ADVMISSION_TEAM_UPDATE, this, this.onTeamInfoUpdate);
            EventManager.on('AUTO_SELECT_MISSION_ROLE', this, this.autoMission);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['role_' + i], Laya.Event.CLICK, this, this.onChangeRole, [i]);
            }
        }

        removeEventListeners() {
            super.removeEventListeners();
            Laya.timer.clear(this, this.onTimer);
            EventManager.off(globalEvent.ADVMISSION_TEAM_UPDATE, this, this.onTeamInfoUpdate);
            EventManager.off('AUTO_SELECT_MISSION_ROLE', this, this.autoMission);
            BC.removeEvent(this);
        }

        destroy() {
            AdventureMissonManager.instance.cancleTimer();
            this.cleanPalling();
            super.destroy();
        }

        private _copyMap: Laya.Image;
        private _startX: number;
        /**
         * 循环地图
         * @param map 地图对象 
         * @param isExecute 是否执行
         */
        async pallingMap(isExecute: boolean, map?: Laya.Image) {
            Laya.timer.clear(this, this.onFrame);
            if (isExecute && map) {
                this._copyMap = this._copyMap || new Laya.Image();
                await res.load(map.skin);
                this._copyMap.skin = map.skin;
                this._copyMap.pos(map.width + map.x, map.y);
                map.parent.addChildAt(this._copyMap, 0);
                this._startX = map.x;
                Laya.timer.frameLoop(1, this, this.onFrame, [map]);
            }
        }
        private onFrame(map: Laya.Image): void {
            let _minx: number = this._startX - map.width;
            map.x = map.x <= _minx ? map.width + this._startX - 1 : map.x - 1;
            this._copyMap.x = this._copyMap.x <= _minx ? map.width + this._startX - 1 : this._copyMap.x - 1;
        }
        /** 清理轮询*/
        cleanPalling(): void {
            if (this._copyMap) {
                Laya.timer.clear(this, this.onFrame);
                this._copyMap.destroy();
                this._copyMap = null;
            }
        }
    }
}