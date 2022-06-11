namespace foster {
    export const EV_REFRESH_VIEW: string = 'EV_REFRESH_VIEW';
    export enum ViewType {
        BASE = 1, //基础属性
        STAR, //升星
        BLESSING //祝福
    }

    import ExtArrName = clientCore.role.ExtArrName;
    /**
     * 培养
     */
    export class FosterModule extends ui.foster.FosterModuleUI {

        private _arcIdx: number;
        private _arc2: component.HuaArc2;
        /** 当前页面类型*/
        private _viewType: number;
        /** 当前选择的角色信息*/
        private _currentInfo: clientCore.role.RoleInfo;

        private _levelPanel: LevelPanel;
        private _starPanel: StarPanel;
        private _blessPanel: BlessPanel;

        /** 人物动画*/
        private _bone: clientCore.Bone;

        /// 升星界面 787 135

        public init(data: any): void {
            super.init(data);
            // 初始化圆弧工具
            this._levelPanel = new LevelPanel(this.level);
            this._starPanel = new StarPanel(this.star);
            this._blessPanel = new BlessPanel(this.bless);
            this.handleSystemOpen();
            this.initArc2();
            // 初始化属性
            this.initAttr();
            this.addPreLoad(clientCore.FormationControl.instance.initXml());

            Laya.MouseManager.multiTouchEnabled = false;
        }

        public async seqPreLoad() {
            await clientCore.RoleManager.instance.initXml();
        }
        onPreloadOver() {
            //分组顺序 1主角,2出战
            let groups = _.groupBy(clientCore.RoleManager.instance.getAllRoles(), (o) => {
                if (o.isLead)
                    return 1;
                if (clientCore.FormationControl.instance.seatArr.indexOf(o.id) > -1)
                    return 2;
            })
            //每组内再按战斗力排序
            this._arc2.array = _.flatten(_.concat(_.map(groups, (arr) => {
                return _.sortBy(arr, (o) => {
                    return -o.fight;
                })
            })))
            if (clientCore.GuideMainManager.instance.curGuideInfo.mainID == 20) {
                this._arc2.showIndex = 1;
                return;
            }
            if (this._data)
                this._arc2.showIndex = _.findIndex(this._arc2.array, { 'id': this._data });
            else
                this._arc2.showIndex = 0;
        }
        public popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "fosterModuleOpen") {
                // Laya.timer.once(1000,this,()=>{
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                // })
            }
        }

        private handleSystemOpen() {
            let starOpen = clientCore.SystemOpenManager.ins.getIsOpen(23);
            this.lockStar.visible = !starOpen;
            this.tab_2.mouseEnabled = starOpen;

            let blessOpen = clientCore.SystemOpenManager.ins.getIsOpen(18);
            this.lockBless.visible = !blessOpen;
            this.tab_3.mouseEnabled = blessOpen;
        }

        public addEventListeners(): void {
            // tab
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["tab_" + i], Laya.Event.CLICK, this, this.onTab, [i]);
            }
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.onChangePray);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onChangRole, [1]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onChangRole, [-1]);
            EventManager.on(EV_REFRESH_VIEW, this, this.refreshView);
            EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.handleSystemOpen);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "fosterModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "firstExpPotion") {
                    var obj: any;
                    obj = this._levelPanel.getExpPotion();
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

        private onChangRole(diff: number) {
            this._arc2.showIndex = _.clamp(this._arcIdx + diff, 0, this._arc2.array.length);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
            EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.handleSystemOpen);
            EventManager.off(EV_REFRESH_VIEW, this, this.refreshView);
        }

        public initOver(): void {

        }

        public destroy(): void {
            Laya.MouseManager.multiTouchEnabled = true;
            super.destroy();
            this._arc2?.dispose();
            this._levelPanel && this._levelPanel.destory();
            this._arc2 = this._currentInfo = null;
            this._bone?.dispose();
            this._bone = null;
            // if (this.sk.templet) {
            //     this.sk.destroy();
            // }
        }

        private initArc2(): void {
            this._arc2 = new component.HuaArc2(300, 575, 1, 0.6, 100);
            this.addChildAt(this._arc2.list, 4);
            this._arc2.list.pos(-40, 130);
            this._arc2.vScrollBarSkin = "";
            this._arc2.itemRender = ui.foster.render.PartnerItemUI;
            this._arc2.renderHandler = Laya.Handler.create(this, this.partnerRender, null, false);
            this._arc2.showHandler = Laya.Handler.create(this, this.showPartner, null, false);
        }

        private initAttr(): void {
        }

        /** 更换神祈*/
        private onChangePray(): void {
            this.needOpenMod = "";
            this.destroy();
            clientCore.ModuleManager.open("pray.PrayModule");
        }

        private onTab(type: number): void {
            if (this._viewType == type) return;
            for (let i: number = 1; i <= 3; i++) {
                this["tab_" + i].skin = type == i ? 'foster/btn_on.png' : 'foster/btn_off.png';
            }
            this._viewType = type;
            this.showView();
        }

        private showView(): void {
            this.level.visible = this._viewType == ViewType.BASE;
            this.star.visible = this._viewType == ViewType.STAR;
            this.bless.visible = this._viewType == ViewType.BLESSING;
            switch (this._viewType) {
                case ViewType.BASE:
                    this._levelPanel.show(this._currentInfo.id);
                    break;
                case ViewType.STAR:
                    this._starPanel.show(this._currentInfo.id);
                    break;
                case ViewType.BLESSING:
                    this._blessPanel.show(this._currentInfo.id);
                    break;
                default:
                    break;
            }
        }

        private partnerRender(item: ui.foster.render.PartnerItemUI, index: number): void {
            let info: clientCore.role.RoleInfo = this._arc2.array[index];
            item.ico.skin = info.srvData.isLead ? clientCore.LocalInfo.headImgUrl : clientCore.ItemsInfo.getItemIconUrl(info.id);
            item.imgAttr.skin = pathConfig.getRoleAttrIco(info.Identity);
            item.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(info.xlsId.battleType);
            item.imgFight.visible = clientCore.FormationControl.instance.seatArr.indexOf(info.id) > -1;
            item.imgFrame.skin = `foster/frame_${info.quality}.png`
        }

        private _lastItem: ui.foster.render.PartnerItemUI;
        private showPartner(index: number): void {
            if (this._lastItem) {
                this._lastItem.bg.centerX = 0;
                this._lastItem.bg.centerY = 0;
                this._lastItem.bg.skin = "foster/zdi.png";
                this._lastItem.bg.width = this._lastItem.bg.height = 122;
            }
            let item: any = this._arc2.list.getCell(index);
            if (item) {
                item.bg.centerX = 2.7;
                item.bg.centerY = 1;
                item.bg.skin = "foster/zdi2.png";
                item.bg.width = item.bg.height = 160;
                this._lastItem = item;
            }
            this._arcIdx = index;
            this.refreshView();
        }

        private refreshView() {
            this._currentInfo = clientCore.RoleManager.instance.getRoleById(this._arc2.array[this._arcIdx].id);
            let skinId = this._currentInfo.skinId;
            let isAni = xls.get(xls.characterId).get(skinId).isAni == 1;
            // this.sk.visible = isAni;
            this._bone?.dispose();
            this.imgRole.visible = !isAni;
            if (isAni) {
                // this.sk.load(pathConfig.getRoleAniUI(skinId));
                this._bone = clientCore.BoneMgr.ins.play(pathConfig.getRoleAniUI(skinId), 0, true, this.boxAni);
                this._bone.pos(190, 338);
            }
            else {
                this.imgRole.skin = clientCore.ItemsInfo.getItemUIUrl(skinId);
            }
            this.txName.text = this._currentInfo.name;
            this.btnChange.visible = this._currentInfo.isLead;
            this.imgAttrIcon.skin = pathConfig.getRoleAttrIco(this._currentInfo.Identity);
            this.imgCareer.skin = pathConfig.getRoleBattleTypeIcon(this._currentInfo.xlsId.battleType);
            this._viewType ? this.showView() : this.onTab(ViewType.BASE);
            this.listStar.dataSource = _.map(new Array(5), (v, idx) => {
                let a = (idx + 1) * 2;
                let b = a - 1;
                if (a <= this._currentInfo.star) {
                    return { 'index': 2 };
                }
                else if (b <= this._currentInfo.star) {
                    return { 'index': 1 };
                }
                else {
                    return { 'index': 0 };
                }
            });
            this.listStar1.dataSource = _.map(new Array(3), (v, idx) => {
                return { 'index': this._currentInfo.star < idx + 1 ? 0 : 2 };
            })
            this.listStar.visible = this._currentInfo.maxStar > 3;
            this.listStar1.visible = this._currentInfo.maxStar == 3;
            this.clipRank.index = this._currentInfo.xlsId.quality - 1;
            this.clipRank.visible = this._currentInfo.id != clientCore.RoleManager.instance.getSelfInfo().id
            this.drawTriangle();
            // console.table(clientCore.RoleManager.instance.showAttr(this._currentInfo.id));
        }

        private drawTriangle() {
            this.spTri.graphics.clear();
            let attrNames = [ExtArrName.血量, ExtArrName.防御, ExtArrName.攻击];
            let globalXls = xls.get(xls.globaltest).get(1);
            let stardAttrs = [globalXls.standardHealth, globalXls.standardDefense, globalXls.standardAttack];
            let attrs = attrNames.map((s) => {
                return this._currentInfo.getAttrInfo(s).base;
            })
            let points = [];
            for (let i = 0; i < 3; i++) {
                let len = _.clamp(40 * attrs[i] / stardAttrs[i], 0, 30);
                let angle = Math.PI * (2 / 3 * i - 1 / 2);
                points.push(Math.cos(angle) * len)
                points.push(Math.sin(angle) * len)
            }
            this.spTri.graphics.drawPoly(0, 0, points, '0xff0000')
        }
    }
}
