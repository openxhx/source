namespace family.panel {
    /**
     * 建筑面板
     */
    export class BuildPanel extends ui.family.panel.BuildPanelUI implements IPanel {

        /** 捐献面板*/
        private _donatePanel: DonatePanel;
        /** 奖励面板*/
        private _rewardPanel: RewardPanel;

        constructor() {
            super();
            this.list.hScrollBarSkin = "";
            this.list.itemRender = item.BuildItem;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
        }

        update(parent: Laya.Sprite): void {
            this.addEventListeners();
            parent.addChild(this);
            this.setBuilds();
        }
        dispose(): void {
            this.removeSelf();
            this.removeEventListeners();
        }
        destroy(): void {
            this._rewardPanel = this._donatePanel = null;
            super.destroy();
        }

        addEventListeners(): void {
            BC.addEvent(this, EventManager, FamilyConstant.DONATE_COMPLETE, this, this.donateComplete);
            BC.addEvent(this, EventManager, globalEvent.UPDATE_FAMILY_BUILD, this, this.refreshBuilds);
            BC.addEvent(this, this.btnDonate, Laya.Event.CLICK, this, this.openDonate);
            BC.addEvent(this, this.btnUnlock, Laya.Event.CLICK, this, this.unlockBuild);
            BC.addEvent(this, this.btnLook, Laya.Event.CLICK, this, this.openReward);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private listRender(item: item.BuildItem, index: number): void {
            item.imgSel.visible = this.list.selectedIndex == index;
            item.setInfo(this.list.array[index]);
        }

        private listSelect(index: number): void {
            let info: pb.Build = this.list.array[index];
            let lv: number = clientCore.FamilyMgr.ins.calculateBuildLv(info.buildId, info.attrs.fAttrs.donate);
            lv = info.buildId == FamilyConstant.TREE_ID ? lv - 1 : lv;
            let xlsId: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(info.buildId);
            let isMax: boolean = lv == clientCore.BuildingUpgradeConf.getMaxLevel(xlsId.buildingType);
            let desc: string = "当前等级已达上限";
            this.boxReward.visible = false;
            if (!isMax) { //等级未达上限
                let xlsUpgrade: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getNextUpgradeInfoByTypeAndLevel(xlsId.buildingType, lv);
                desc = xlsUpgrade.desc;
                if (this.checkLock(info)) {
                    this.btnUnlock.disabled = !clientCore.FamilyMgr.ins.checkLimit(clientCore.FamilyMgr.ins.svrMsg.post, FamilyAuthority.UNLOCK) //有解锁的权限
                        && FamilyModel.ins.treeLv >= lv; //不超过神树等级
                }
                //奖励
                this.boxReward.visible = info.buildId == BaseBuild.TREE && this.checkHaveReward();
                if (this.boxReward.visible) {
                    let xlsData: xls.familyLimit = xls.get(xls.familyLimit).get(FamilyModel.ins.treeLv + 1);
                    if (xlsData) {
                        this.txLimit.changeText(`${xlsData.level}级解锁`);
                        this.rewardIco.skin = clientCore.ItemsInfo.getItemIconUrl(xlsData.building);
                    }
                }
            }
            this.txDesc.changeText(desc);
            this.txDesc1.changeText(xlsId.captions);
        }

        /** 检查神树升级后 是否还有奖励*/
        private checkHaveReward(): boolean {
            let array: xls.familyLimit[] = xls.get(xls.familyLimit).getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.familyLimit = array[i];
                if (element.level > FamilyModel.ins.treeLv) return true; //还有奖励
            }
            return false;
        }

        private checkLock(info: pb.Build): boolean {
            let isLock: boolean = info.attrs.fAttrs.locked == 0;
            this.btnDonate.visible = !isLock;
            this.btnDonate.disabled = !clientCore.FamilyMgr.ins.checkDonate();
            this.btnUnlock.visible = isLock;
            return isLock;
        }

        private setBuilds(): void {
            let _array: pb.IBuild[] = clientCore.FamilyMgr.ins.baseBuilds;
            let len: number = _array.length;
            for (let i: number = 0; i < len; i++) {
                let element: pb.IBuild = _array[i];
                if (element.buildId == FamilyConstant.TREE_ID) {
                    FamilyModel.ins.treeLv = clientCore.FamilyMgr.ins.calculateBuildLv(element.buildId, element.attrs.fAttrs.donate);
                    break;
                }
            }
            this.list.array = _array;
            this.list.selectedIndex = 0;
        }

        /** 建筑更新*/
        private refreshBuilds(msg: pb.sc_notify_family_build_change): void {
            let _array: pb.IBuild[] = clientCore.FamilyMgr.ins.baseBuilds;
            let len: number = _array.length;
            for (let i: number = 0; i < len; i++) {
                let element: pb.IBuild = _array[i];
                let len1: number = msg.builds.length;
                for (let j: number = 0; j < len1; j++) {
                    let ele: pb.IBuild = msg.builds[j];
                    if (ele.buildId == element.buildId) {
                        this.list.changeItem(i, element);
                        break;
                    }
                }
            }
        }

        /** 打开捐献*/
        private openDonate(): void {
            let info: pb.Build = this.list.array[this.list.selectedIndex];
            if (!info) return;
            this._donatePanel = this._donatePanel || new DonatePanel();
            this._donatePanel.show(info.buildId);
        }

        /** 打开奖励*/
        private openReward(): void {
            this._rewardPanel = this._rewardPanel || new RewardPanel();
            this._rewardPanel.show();
        }

        /** 解锁建筑*/
        private unlockBuild(): void {
            let index: number = this.list.selectedIndex;
            let info: pb.Build = this.list.array[index];
            if (!info) return;
            FamilySCommand.ins.unlockBuild(info.buildId, Laya.Handler.create(this, () => {
                info.attrs.fAttrs.locked = 1;
                this.list.changeItem(index, info);
                index == this.list.selectedIndex && this.checkLock(info);
            }))
        }

        /** 捐献完成*/
        private donateComplete(msg: pb.sc_family_donate): void {
            let index: number = this.list.selectedIndex;
            let info: pb.Build = this.list.array[index];
            if (info) {
                info.attrs.fAttrs.donate = msg.donate;
                info.attrs.fAttrs.locked = msg.locked;
                if (msg.flag == 0) {
                    alert.showFWords("捐献无效~");
                }
                else if (msg.flag == 2) {
                    alert.showFWords("加入家族后的第二天才能捐献~");
                }
                else {
                    alert.showFWords("捐献成功！");
                    clientCore.FamilyMgr.ins.svrMsg.donatedCnt++;
                    info.buildId == FamilyConstant.TREE_ID && (FamilyModel.ins.treeLv = clientCore.FamilyMgr.ins.calculateBuildLv(info.buildId, info.attrs.fAttrs.donate));
                    this.btnDonate.disabled = !clientCore.FamilyMgr.ins.checkDonate();
                    // clientCore.DialogMgr.ins.close(this._donatePanel);
                    this._donatePanel.updateView();
                }
                this.list.changeItem(index, info);
            }
        }
    }
}