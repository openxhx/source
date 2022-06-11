
namespace roleChain2 {
    import RoleManager = clientCore.RoleManager;
    import RoleInfo = clientCore.role.RoleInfo;

    export class RoleChainModule extends ui.roleChain2.RoleChain2ModuleUI {
        private _arc2: component.HuaArc2;
        /**当前选择的基础角色id（左边list选中的） */
        private _currRoleId: number;
        /**当前展示的角色id（可能是右边卡片点击后换上的） */
        private _currShowImgId: number;
        private _isChildSHow: boolean = true;
        private _panelHash: util.HashMap<IBaseRolePanel & core.BaseModule>;
        private _curTab: TAB;
        private _giftPanel: RoleGiftPanel;
        private _bone: clientCore.Bone;
        private _heartBone: clientCore.Bone;

        private _curTab2: number;
        private _curPanelType: string;
        private _tabDataList: { type: string, isLock?: boolean, isDisabled?: boolean }[][];

        init(d: any) {
            super.init(d);

            this._tabDataList = [
                /**事件标签页列表**/
                [{ type: Event_Tab.Appointment }, { type: Event_Tab.Review }],
                /**羁绊标签页列表**/
                [{ type: Chain_Tab.Chain }],
                /**绽放标签页列表**/
                [{ type: Awake_Tab.Awake }],
                /**情报列表**/
                [{ type: InteliJ_Tab.Hobby }, { type: InteliJ_Tab.Awake, isLock: true, isDisabled: true }, { type: InteliJ_Tab.CG, isLock: true, isDisabled: true }]
            ]

            this._panelHash = new util.HashMap();

            this.tabList.renderHandler = new Laya.Handler(this, this.onTabRender);
            this.tabList.mouseHandler = new Laya.Handler(this, this.onTabMouse);

            this.addPreLoad(res.load('atlas/roleChain2/card.atlas'));
            this.addPreLoad(res.load('atlas/affair.atlas'));
            this.addPreLoad(clientCore.AffairMgr.ins.setup());
            this.addPreLoad(xls.load(xls.characterVoice));
        }

        public async seqPreLoad() {
            await RoleManager.instance.initXml();
        }

        initOver() {
            this.initArc2();//左边圆弧列表
            let tab: number = this._data == void 0 ? TAB.Awake : this._data;
            this.setRoleList(tab == TAB.Event ? clientCore.AffairMgr.ins.currentSel >> 0 : 0);//
            this.showChildTab(tab);//初始选择
            this.boxTalk.visible = false;
        }

        public popupOver(): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "roleChainModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private onTabRender(cell: ui.roleChain2.render.TabRenderUI, idx: number) {
            let data: any = cell.dataSource;
            cell.bg.gray = idx == this._curTab2 ? false : true;
            cell.img.skin = "roleChain2/tab_" + data.type + ".png";
            cell.lock.visible = data.isLock;
            cell.mouseEnabled = !data.isDisabled;
        }

        private onTabMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let cell = e.currentTarget as ui.roleChain2.render.TabRenderUI;
                if (cell.dataSource.type != this._curPanelType) {
                    this._curTab2 = idx;
                    this.onShowPanel(cell.dataSource.type);
                    this.tabList.refresh();
                }
            }
        }

        private setRoleList(index: number) {
            let lockedRoles = RoleManager.instance.getLockedRoles();
            this._arc2.array = _.filter(xls.get(xls.characterId).getValues(), (role) => {
                return role.characterId > 1410000 && role.characterId < 1420000 && lockedRoles.indexOf(role.characterId) == -1;
            }).map((role) => {
                return role.characterId;
            });
            this._arc2.showIndex = index;
        }

        private initArc2(): void {
            this._arc2 = new component.HuaArc2(300, 575, 1, 0.6, 100);
            this.addChildAt(this._arc2.list, 4);
            this._arc2.list.pos(-40, 120);
            this._arc2.vScrollBarSkin = '';
            this._arc2.itemRender = ui.roleChain2.render.RoleHeadUI;
            this._arc2.renderHandler = Laya.Handler.create(this, this.onRoleRender, null, false);
            this._arc2.showHandler = Laya.Handler.create(this, this.onRoleSelect, null, false);
        }

        private onRoleRender(item: ui.roleChain2.render.RoleHeadUI): void {
            let id = item.dataSource;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.imgRed.visible = RoleManager.instance.checkRoleCanAwake(id);
        }

        private _lastItem: ui.roleChain2.render.RoleHeadUI;
        private onRoleSelect(idx: number) {
            if (this._lastItem) {
                this._lastItem.bg.visible = false;
            }
            let item: any = this._arc2.list.getCell(idx);
            if (item) {
                item.bg.visible = true;
                this._lastItem = item;
            }
            let roleId = this._arc2.array[this._arc2.showIndex];
            if (this._currRoleId != roleId) {
                this._currRoleId = roleId;
                this.showRoleImg(roleId);
                RoleChainVoice.instance.playSound(this._currShowImgId, 'changeRole');
                this._panelHash.get(this._curPanelType) && this._panelHash.get(this._curPanelType).show(this._currRoleId);
                this.setGiftCompInfo();
                this.updateGiftStatus();
                this.setGiftPanelState(false);
            }
        }

        /**展示角色立绘 
         * 如果传的是基础角色id 则自动替换成对应的主打觉醒
        */
        private showRoleImg(id: number) {
            let role = RoleManager.instance.getRoleById(id);
            this._currShowImgId = id;
            // 清理骨骼动画
            this._bone && this._bone.dispose();
            this._bone = null;
            if (xls.get(xls.characterId).get(this._currShowImgId).isAni) {
                this._bone = clientCore.BoneMgr.ins.play(pathConfig.getRoleAniUI(this._currShowImgId), 0, true, this.spBone);
                this.imgRole.visible = false;
            }
            else {
                this.imgRole.skin = pathConfig.getRoleUI(this._currShowImgId);
                this.imgRole.visible = true;
            }
            this.imgName.skin = pathConfig.getRoleName(clientCore.role.RoleInfo.xlsIdData.get(id).mutexId);
            this.imgRole.filters = role ? [] : util.DisplayUtil.darkFilter;
            this.imgName.filters = role ? [] : util.DisplayUtil.darkFilter;
            this.giftComp.visible = role != null;
            this.setGiftPanelState(false)
        }

        private onTabClick(tab: TAB) {
            if (this._curTab != tab) {
                this.showChildTab(tab);
            }
            this._curTab = tab;
        }

        private showChildTab(tab: TAB): void {
            this._curTab2 = 0;
            this.imgCurrTab.x = this['imgTab_' + tab].x;
            this.setGiftPanelState(false);
            this.onShowPanel(this._tabDataList[tab][this._curTab2].type);
            if (tab == TAB.Event || tab == TAB.Intelli) {
                this.tabList.dataSource = this._tabDataList[tab];
                this.tabList.visible = true;
            } else {
                this.tabList.visible = false;
            }
        }

        private onShowPanel(type: string): void {
            //移除老的
            this._panelHash.get(this._curPanelType) && this._panelHash.get(this._curPanelType).removeSelf();
            //展示新的
            let newPanel = this.getTabPanel(type);
            if (newPanel) {
                this.boxChildCon.addChild(newPanel);
                newPanel.show(this._currRoleId);
                type == Event_Tab.Appointment && (clientCore.AffairMgr.ins.currentSel = this._arc2.showIndex);
            }
            this._curPanelType = type;
        }

        private getTabPanel(type: string): IBaseRolePanel & core.BaseModule {
            if (this._panelHash.has(type)) {
                return this._panelHash.get(type);
            }
            let panel;
            switch (type) {
                case Event_Tab.Appointment://约会
                    panel = new AffairPanel();
                    break;
                case Event_Tab.Review://好感回顾
                    panel = new ReviewPanel();
                    break;
                case Awake_Tab.Awake://绽放
                    panel = new RoleAwakePanel();
                    break;
                case InteliJ_Tab.Hobby://偏好
                    panel = new RoleInteliPanel();
                    break;
                default:
                    break;
            }
            this._panelHash.add(type, panel);
            return panel;
        }

        private onChangeChildPanel() {
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
            this.showChildPanel.wrapMode = this._isChildSHow ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            this.showChildPanel.play(0, false);
            this._isChildSHow = !this._isChildSHow;
            this.setGiftPanelState(false);
            if (this._isChildSHow) {
                this.showChildPanel.once(Laya.Event.COMPLETE, this, this.setExtraBoxVisible, [true]);
            }
            else {
                this.setExtraBoxVisible(false);
            }
        }

        /**设置赠礼按钮， 右边面板的额外小面板显示状态 */
        private setExtraBoxVisible(b: boolean) {
            if (this._panelHash.get(this._curPanelType) && this._panelHash.get(this._curPanelType).extraBox) {
                this._panelHash.get(this._curPanelType).extraBox.visible = b;
            }
        }

        private setGiftPanelState(show: boolean) {
            if (!this._giftPanel) {
                this._giftPanel = new RoleGiftPanel();
                BC.addEvent(this, this._giftPanel.btnClose, Laya.Event.CLICK, this, this.setGiftPanelState, [false]);
                BC.addEvent(this, this._giftPanel, Laya.Event.CHANGED, this, this.onFavorChanged);
            }
            if (show) {
                this.addChild(this._giftPanel);
                this._giftPanel.pos(this._isChildSHow ? 160 : 350, 750, true);
                this._giftPanel.show(this._currRoleId);
                Laya.Tween.to(this._giftPanel, { y: 507 }, 200, Laya.Ease.quadOut, Laya.Handler.create(this, () => {
                    // if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "giftPanelTweenComplete") {
                    //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                    // }
                }));
                this.setExtraBoxVisible(false);
            }
            else {
                Laya.Tween.to(this._giftPanel, { y: 750 }, 200, Laya.Ease.quadOut, new Laya.Handler(this, () => {
                    this._giftPanel.removeSelf();
                    if (this._isChildSHow)
                        this.setExtraBoxVisible(true);
                }))
            }
            this.imgName.visible = !show;//送礼面板显示时， 隐藏名字图片
        }

        /**设置主面板上的好感度信息 */
        private setGiftCompInfo() {
            let roleInfo = RoleManager.instance.getRoleById(this._currRoleId);

            this.giftComp.txtLv.value = roleInfo ? util.StringUtils.fillZero(roleInfo.faverLv, 2) : '00';
            // this.giftComp.imgMask.y = (1 - roleInfo.faverPercent) * 84;
            if (!this._heartBone) {
                this._heartBone = clientCore.BoneMgr.ins.play("res/animate/favor/xin.sk", 0, true, this.giftComp.box);
                let sp: Laya.Sprite = new Laya.Sprite();
                sp.loadImage("roleChain2/heart3.png");
                this._heartBone.mask = sp;
            }
            let y: number = (1 - roleInfo.faverPercent) * 84
            this._heartBone.mask.y = -y;
            this._heartBone.pos(72, 72 + y);
        }

        private updateGiftStatus(): void {
            let isShow: boolean = clientCore.FavorTaskMgr.ins.checkHaveTask(this._currRoleId) || clientCore.FavorTaskMgr.ins.checkTaskOver(this._currRoleId);
            // this.giftComp.btn.label = isShow ? "好感度任务" : "赠礼";
            this.giftComp.btn.fontSkin = isShow ? "commonBtn/l_p_favorTask.png" : "commonBtn/l_p_gift.png";
            this.giftComp.btn.visible = !isShow && this._currRoleId != 1410018;
            this.giftComp.btn1.visible = isShow;
            // this.giftComp.btn.labelSize = isShow ? 16 : 22;
            isShow && this.setGiftPanelState(false);
        }

        /**好感度变动通知 */
        private onFavorChanged() {
            this.setGiftCompInfo();
            //刷新下右边面板
            this._panelHash.get(this._curPanelType).show(this._currRoleId);
            //检查是否还有任务
            this.updateGiftStatus();
        }

        private showTalk(txt: string) {
            if (this.boxTalk.visible) {
                Laya.timer.clear(this, this.hideTalk);
            }
            if (txt) {
                this.boxTalk.visible = true;
                this.txtTalk.text = txt;
                this.boxTalk.height = 40 + this.txtTalk.height;
                Laya.timer.once(2000, this, this.hideTalk);
            }
        }

        private hideTalk() {
            this.boxTalk.visible = false;
        }

        private onChangeRole(diff: number) {
            this._arc2.showIndex = _.clamp(this._arc2.showIndex + diff, 0, this._arc2.array.length);
        }

        private onRoleClickVoice() {
            RoleChainVoice.instance.playSound(this._currShowImgId, 'clickRole');
        }

        private refreshHeadList() {
            for (const cell of this._arc2.list.cells) {
                this.onRoleRender(cell as any);
            }
        }

        addEventListeners() {
            BC.addEvent(this, EventManager, EV_SHOW_ROLE_BIG_IMAGE, this, this.showRoleImg);
            BC.addEvent(this, EventManager, EV_REFRESH_LEFT_HEAD, this, this.refreshHeadList);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnChild, Laya.Event.CLICK, this, this.onChangeChildPanel);
            BC.addEvent(this, this.giftComp.btn, Laya.Event.CLICK, this, this.onGiftClick);
            BC.addEvent(this, this.giftComp.btn1, Laya.Event.CLICK, this, this.onGiftClick);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onChangeRole, [-1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onChangeRole, [1]);
            BC.addEvent(this, this.imgRoleVoice, Laya.Event.CLICK, this, this.onRoleClickVoice);
            for (let i = 0; i < 4; i++) {
                BC.addEvent(this, this['imgTab_' + i], Laya.Event.CLICK, this, this.onTabClick, [i]);
            }

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            BC.addEvent(this, EventManager, globalEvent.UPDATE_FAVORTASK, this, this.updateGiftStatus);
            BC.addEvent(this, EventManager, 'VOICE_SHOW_TALK', this, this.showTalk);
        }
        private onGiftClick(): void {
            let isHave: boolean = clientCore.FavorTaskMgr.ins.checkHaveTask(this._currRoleId);
            if (isHave) {
                clientCore.FavorTaskMgr.ins.handlerTask(this._currRoleId)
            } else {
                if (clientCore.FavorTaskMgr.ins.checkTaskOver(this._currRoleId)) {
                    alert.showFWords("与该角色的好感度已达最大上限 敬请期待更多互动故事~");
                    return;
                }
                this.setGiftPanelState(true);
            }
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "roleChainModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "roleCell1") {
                    var obj: any;
                    obj = this._arc2.list.getCell(1);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnAwake") {
                    var obj: any;
                    obj = (this._panelHash.get(this._curPanelType) as RoleAwakePanel).btnAwake;
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "giftPanelCloseBtn") {
                    var obj: any;
                    obj = this._giftPanel.btnClose;
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

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickRoleChainCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this._arc2?.dispose();
            this._arc2 = null;
            if (this._panelHash) {
                let _array: IBaseRolePanel[] = this._panelHash.getValues();
                _.forEach(_array, (element: IBaseRolePanel) => {
                    element && element.dispose();
                    element = null;
                });
                this._panelHash.clear();
                this._panelHash = null;
            }

            this._bone && this._bone.dispose();
            this._bone = null;
            this._heartBone && this._heartBone.dispose();
            this._heartBone = null;

            Laya.timer.clear(this, this.hideTalk);
            super.destroy();
            if (this._giftPanel) {
                Laya.Tween.clearAll(this._giftPanel)
                this._giftPanel.destroy();
                this._giftPanel = null;
            }
            RoleChainVoice.instance.destory();
        }
    }
}