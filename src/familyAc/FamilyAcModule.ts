namespace familyAc {

    enum ListType {
        SEARCH,
        RECOMMAND,
        ALL,
        INVITE
    }

    /**
     * 家族申请和创建模块
     */
    export class FamilyAcModule extends ui.familyAc.FamilyAcModuleUI {

        /** 创建协议面板*/
        private _protoPanel: panel.ProtocolPanel;
        /** 创建面板*/
        private _createPanel: panel.CreateFamilyPanel;
        /** 消息处理器*/
        private _sCommand: FamilyAcSCommand;
        /** 当前TAB*/
        private _tabIndex: number = -1;
        /** 族长形象*/
        private _person: clientCore.Person;
        /** 当前页数*/
        private _currentPage: number = 1;
        /** 家族升级配置*/
        // private _xlsUpgrade: xls.familyUpgrade;
        /** 家族列表*/
        private _familys: pb.familyInfo[];

        private _curShowInfo: pb.familyInfo;

        constructor() {
            super();
            this._sCommand = FamilyAcSCommand.ins;
            this.list.vScrollBarSkin = "";
            this.list.scrollBar.elasticDistance = 200;
            this.list.scrollBar.elasticBackTime = 200;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
            this.sp.scrollRect = new Laya.Rectangle(0, 0, 329, 303);
        }

        init(): void {
            this.addPreLoad(xls.load(xls.family));
            this.addPreLoad(xls.load(xls.familyLimit));
            this.addPreLoad(this.initView());
        }

        private onInfo() {
            clientCore.UserInfoTip.showTips(this.btnInfo, this._curShowInfo.chiefId);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnCreate, Laya.Event.CLICK, this, this.openProtoPanel);
            BC.addEvent(this, this.btnJoin, Laya.Event.CLICK, this, this.onJoin);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.onTab, [ListType.RECOMMAND]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.onTab, [ListType.ALL]);
            BC.addEvent(this, this.tab3, Laya.Event.CLICK, this, this.onTab, [ListType.INVITE]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnSearch, Laya.Event.CLICK, this, this.onSearch);
            BC.addEvent(this, this.btnInfo, Laya.Event.CLICK, this, this.onInfo);

            BC.addEvent(this, this.list.scrollBar, Laya.Event.START, this, this.onScrollBarStart);

            Laya.timer.loop(1000, this, this.showRestTime);
        }
        removeEventListeners(): void {
            Laya.timer.clear(this, this.showRestTime);
            BC.removeEvent(this);
        }

        initOver(): void {
            this.updateArr(this._familys);
        }

        destroy(): void {
            this.clearPerson();
            this._sCommand = this._protoPanel = this._createPanel = null;
            super.destroy();
        }

        /** 打开创建协议书*/
        private openProtoPanel(): void {
            if (this._tabIndex == ListType.INVITE) {
                let index: number = this.list.selectedIndex;
                let info: pb.familyInfo = this.list.array[index];
                info && this._sCommand.handleInvite(2, info.fmlId, Laya.Handler.create(this, () => { this.list.deleteItem(index); }));
                return;
            }
            this._protoPanel = this._protoPanel || new panel.ProtocolPanel();
            this._protoPanel.show(Laya.Handler.create(this, this.openCreatePanel, null, false));
        }

        /** 打开创建面板*/
        private openCreatePanel(): void {
            this._createPanel = this._createPanel || new panel.CreateFamilyPanel();
            this._createPanel.show();
        }

        private initView(): Promise<void> {
            return new Promise((suc) => {
                this._sCommand.getFamilyList(0, 1, Laya.Handler.create(this, (arr: pb.familyInfo[]) => {
                    this._familys = arr;
                    suc();
                }))
            })
        }

        private onTab(type: number): void {
            if (this._tabIndex == type) return;
            //更新tab组件
            this.updateTab(type);
            //渲染列表
            this._sCommand.getFamilyList(type - 1, 1, Laya.Handler.create(this, this.updateArr));
        }

        private updateTab(type: number): void {
            this._tabIndex = type;
            for (let i: number = 1; i <= 3; i++) {
                this["tab" + i].skin = type == i ? "familyAc/c_2.png" : "familyAc/c_1.png";
                this["tx" + i].color = type == i ? "#ffffff" : "#805329";
            }
            this.btnJoin.fontSkin = type != ListType.INVITE ? "commonBtn/l_y_jionfamily.png" : "commonBtn/l_y_agree_invite.png";
            this.btnCreate.fontSkin = type != ListType.INVITE ? "commonBtn/l_y_establishfamily.png" : "commonBtn/l_y_delete_invite.png";

            type == ListType.INVITE && (this.boxRestTime.visible = false);
        }

        private listRender(item: ui.familyAc.item.FamilyItemUI, index: number): void {
            let info: pb.familyInfo = this.list.array[index];
            let lv: number = this.getFamilyLv(info.donate);
            let xlsLv: xls.familyLimit = xls.get(xls.familyLimit).get(lv);
            item.txName.changeText(info.fmlName);
            item.txLv.changeText("" + lv);
            item.txLiveness.changeText("" + info.liveness);
            item.txLvLimit.changeText("" + info.lvlLimit);
            item.txLvLimit.color = clientCore.LocalInfo.userLv >= info.lvlLimit ? "#4d3118" : "#fd3540";
            item.txCount.changeText(info.member + "/" + xlsLv.totalLimit);
            item.txCount.color = info.member < xlsLv.totalLimit ? "#4d3118" : "#fd3540";
            item.imgSel.visible = index == this.list.selectedIndex;
        }

        private listSelect(index: number): void {
            if (index == -1) return;
            this.updateView(this.list.array[index]);
        }

        private onSearch(): void {
            let name: string = this.inputName.text;
            if (name == "") {
                alert.showFWords("请输入家族名称^_^");
                return;
            }
            this._sCommand.searchFamily(name, Laya.Handler.create(this, (arr: pb.familyInfo[]) => {
                this.updateTab(ListType.SEARCH);
                this.updateArr(arr);
            }));
        }

        private onJoin(): void {
            let info: pb.familyInfo = this.list.array[this.list.selectedIndex];
            if (!info) return;
            this._tabIndex == ListType.INVITE ?
                this._sCommand.handleInvite(1, info.fmlId)
                :
                this._sCommand.applyOperation(0, info.fmlId, Laya.Handler.create(this, () => {
                    info.hasReq = 1; //状态改成已申请
                    info.reqTime = clientCore.ServerManager.curServerTime - 1;
                    // info.reqTime = clientCore.ServerManager.curServerTime-3590;
                    this.list.changeItem(this.list.selectedIndex, info);
                    this.updateJoin(info);
                }));
        }

        private updateArr(arr: pb.familyInfo[]): void {
            let hasF: boolean = arr.length > 0;
            this.btnCreate.visible = this.btnJoin.visible = this._tabIndex != ListType.INVITE || hasF;
            this.list.array = arr;
            this.list.selectedIndex = -1;
            hasF && (this.list.selectedIndex = 0);
            this._currentPage = 2;
            this.sp.visible = this.boxInfo.visible = hasF;
            this.txNone.visible = !hasF;
        }

        private updateView(info: pb.familyInfo): void {
            this.updateJoin(info);
            this.txFamilyName.changeText(info.fmlName);
            this.txLeaderName.changeText(info.chiefNick);
            this.txManifesto.text = info.declaration;
            this.imgBoard.skin = pathConfig.getFamilyBadgeUrl(info.badgeBase);
            this.imgBadge.skin = pathConfig.getFamilyBadgeUrl(info.badgeType);
            this._sCommand.getCloths(info.chiefId, Laya.Handler.create(this, this.updatePerson));
        }

        /** 更新加入按钮*/
        private updateJoin(info: pb.familyInfo): void {
            this._curShowInfo = info;
            let lv: number = this.getFamilyLv(info.donate);
            let xlsLv: xls.familyLimit = xls.get(xls.familyLimit).get(lv);
            let isApply: boolean = info.hasReq == 1;
            this.boxRestTime.visible = false;
            if (this._tabIndex != ListType.INVITE) {
                this.btnJoin.disabled = isApply || info.member >= xlsLv.totalLimit || clientCore.LocalInfo.userLv < info.lvlLimit;
                this.btnJoin.fontSkin = isApply ? "commonBtn/l_y_applying.png" : "commonBtn/l_y_jionfamily.png";
                this.btnJoin.fontX = isApply ? 58 : 48;
                let restTime = info.reqTime + 3600 - clientCore.ServerManager.curServerTime;
                if (isApply && restTime > 0) {
                    this.boxRestTime.visible = true;
                    this.txtRestTime.text = "" + util.StringUtils.getDateStr2(restTime, "{min}:{sec}") + "后可重新申请";
                }

            } else {
                this.btnJoin.disabled = false;
                this.btnJoin.fontX = 48;
            }
        }

        private showRestTime() {
            if (this._curShowInfo && this.boxRestTime.visible == true) {
                let restTime = this._curShowInfo.reqTime + 3600 - clientCore.ServerManager.curServerTime;
                this.txtRestTime.text = "" + util.StringUtils.getDateStr2(restTime, "{min}:{sec}") + "后可重新申请";
                if (restTime <= 0) {
                    this.boxRestTime.visible = false;
                    this.btnJoin.disabled = false;
                    this.btnJoin.fontSkin = "commonBtn/l_y_jionfamily.png";
                    this.btnJoin.fontX = 48;
                }
            }

        }

        private updatePerson(sex: number, cloths: number[]): void {
            if (!this._person || this._person.sex != sex) {
                this.clearPerson();
                this._person = new clientCore.Person(sex);
                this._person.scale(0.4, 0.4);
                this._person.pos(147, 160);
                this.sp.addChild(this._person);
            }
            this._person.replaceByIdArr(cloths);
        }

        /** 清理人模*/
        private clearPerson(): void {
            this._person && this._person.destroy();
            this._person = null;
        }

        /**
         * 计算家族等级
         * @param donate 
         */
        private getFamilyLv(donate: number): number {
            let xlsBuild: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(499995);
            let array: xls.manageBuildingUpdate[] = clientCore.BuildingUpgradeConf.getUpgradeInfos(xlsBuild.buildingType);
            let len: number = array.length;
            let element: xls.manageBuildingUpdate;
            for (let i: number = 0; i < len; i++) {
                element = array[i];
                if (donate < element.item[0].v2) { //经验小于当前等级升级所需经验
                    return element.level;
                }
            }
            return element.level;
        }

        private _wait: boolean = false;
        private onScrollBarStart(): void {
            if (this._tabIndex != 2 || this.list.length % 10 != 0 || this._wait || this.list.scrollBar.value < this.list.scrollBar.max) return;
            this._wait = true;
            this._sCommand.getFamilyList(1, this._currentPage, Laya.Handler.create(this, (familys: pb.IfamilyInfo[]) => {
                familys.length > 0 && (this.list.array = this.list.array.concat(familys));
                this._wait = false;
                this._currentPage++;
            }))
        }
    }
}