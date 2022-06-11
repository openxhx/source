namespace roleChain2 {

    enum PanelType {
        LIST,
        LOCK,
        CHAPTER
    }

    /**
     * 事件面板
     */
    export class AffairPanel extends ui.roleChain2.panel.AffairPanelUI implements IBaseRolePanel {
        /** 当前选择章节*/
        private _currentInx: number;
        /** 地图对象*/
        private _stageMap: AffairMap;

        private _roleId: number;

        constructor() { super(); }

        onAwake(): void {
            //关卡路线地图初始化
            this._stageMap = new AffairMap(this);
            this._stageMap.pos(33, 110);
            this._stageMap.vScrollBarSkin = "";
            this.boxCe.addChild(this._stageMap);
            //章节列表初始化
            this.chapterList.vScrollBarSkin = "";
            this.chapterList.renderHandler = Laya.Handler.create(this, this.chapterRender, null, false);
            this.chapterList.selectHandler = Laya.Handler.create(this, this.chapterSelect, null, false);
            //解锁条件列表初始化
            this.conList.vScrollBarSkin = "";
            this.conList.itemRender = CondRender;
            this.conList.renderHandler = Laya.Handler.create(this, this.conRender, null, false);
        }

        onEnable(): void {
            BC.addEvent(this, this.view_1, Laya.Event.CLICK, this, this.showCopyList);
            BC.addEvent(this, this.view_2, Laya.Event.CLICK, this, this.showCopyList);
            BC.addEvent(this, this.btnUnLock, Laya.Event.CLICK, this, this.unLockChapter);
            BC.addEvent(this, this.btnRefresh, Laya.Event.CLICK, this, this.refreshCopy);
            BC.addEvent(this, this.btnChallenge, Laya.Event.CLICK, this, this.onFight);
            BC.addEvent(this, this.chapterList.scrollBar, Laya.Event.CHANGE, this, this.changeBar, [this.chapterList.scrollBar]);
            BC.addEvent(this, this.conList.scrollBar, Laya.Event.CHANGE, this, this.changeBar, [this.conList.scrollBar]);
            BC.addEvent(this, this._stageMap.vScrollBar, Laya.Event.CHANGE, this, this.changeBar, [this._stageMap.vScrollBar]);
            BC.addEvent(this, EventManager, globalEvent.AFFAIR_UPDATE, this, this.updateCopy);
        }

        onDisable(): void {
            BC.removeEvent(this);
        }

        async show(roleId: number) {
            this._roleId = roleId;
            let _ins: clientCore.AffairMgr = clientCore.AffairMgr.ins;
            await _ins.reqDateInfo(roleId);
            this.chapterList.array = _ins.getDateInfo(roleId);
            this.showCopyList();
        }

        public showPanel(type: PanelType): void {
            this.chapterList.visible = type == PanelType.LIST;
            this.boxCe.visible = type == PanelType.CHAPTER;
            this.boxLock.visible = type == PanelType.LOCK;
        }

        private chapterRender(item: ui.roleChain2.render.AffairRenderUI, index: number): void {
            let info: xls.date = item.dataSource;
            let isLock: boolean = !clientCore.AffairMgr.ins.checkChaperUnlock(this._roleId, info.dateId);
            this.affairRender(item, info, isLock, true);
        }

        private affairRender(item: ui.roleChain2.render.AffairRenderUI, data: xls.date, isLock: boolean, isList: boolean): void {
            item.box.gray = item.imgLock.visible = isLock;
            item.imgBG.skin = pathConfig.getAffairBG(data.dateId);
            item.imgDir.scaleY = isList ? -1 : 1;
        }

        private chapterSelect(index: number): void {
            if (index == -1) return;
            this._currentInx = index;
            this.chapterList.selectedIndex = -1;
            let item: any = this.chapterList.getCell(index);
            let isLock: boolean = item.box.gray;
            isLock ? this.showCondition(this.chapterList.array[index]) : this.showStage(this.chapterList.array[index]);
        }

        /** 检查章节是否可以解锁*/
        private checkChapter(data: xls.date): boolean {
            let _array: xls.triple[] = data.unlockTarget;
            let _len: number = _array.length;
            for (let i: number = 0; i < _len; i++) {
                let _triple: xls.triple = _array[i];
                let _role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(this._roleId);
                if ((_triple.v1 == 1 && _role.faverLv < _triple.v3) || //好感度不足
                    (_triple.v1 == 2 && clientCore.ItemsInfo.getItemNum(_triple.v2) < _triple.v3) || //物品不足
                    (_triple.v1 == 3 && !clientCore.RoleManager.instance.getRoleById(_triple.v2)) || //不存在绽放角色
                    (_triple.v1 == 4 && !clientCore.AffairMgr.ins.checkStageComplete(this._roleId, _triple.v2, _triple.v3))) {//未通过某个副本的某个步骤
                    return false;
                }
            }
            return true;
        }

        /** 显示副本列表部分*/
        private showCopyList(): void {
            this.showPanel(PanelType.LIST);
            this.updateBar(this.chapterList.scrollBar);
        }

        /** 显示关卡部分*/
        private showStage(data: xls.date): void {
            this.showPanel(PanelType.CHAPTER);
            this.affairRender(this.view_2, data, false, false);
            this._stageMap.setData(this._roleId, data);
            this.updateBar(this._stageMap.vScrollBar);
            this.updateSel(0, 0);
        }

        /** 重置副本*/
        private refreshCopy(): void {
            let xlsData: xls.dateStage = xls.get(xls.dateStage).get(this._selStageID);
            if (!xlsData) return;
            net.send(new pb.cs_reset_engagement_stage({ engageId: xlsData.dateId, stageId: xlsData.stageId }));
        }

        private _selStageID: number;
        private onFight(): void {
            this._stageMap.goBattle(this._selStageID);
        }

        /**
         * 更新关卡选择
         * @param stageId 
         * @param status 0-都不显示 1-显示挑战 2-显示重置
         */
        public updateSel(stageId: number, status?: number): void {
            status == status == void 0 ? 0 : status;
            this.btnChallenge.visible = status == 1;
            this.boxReset.visible = status == 2;
            this._selStageID = stageId;
            if (this.boxReset.visible) {
                let xlsData: xls.dateStage = xls.get(xls.dateStage).get(stageId);
                let str: string = "重置需消耗";
                _.forEach(xlsData.resetRequire, (element: xls.pair) => {
                    str += " " + element.v2 + clientCore.ItemsInfo.getItemName(element.v1);
                })
                this.txCost.text = str;
            }
        }

        /** 显示解锁条件界面*/
        private showCondition(data: xls.date): void {
            this.showPanel(PanelType.LOCK);
            this.affairRender(this.view_1, data, true, false);
            this.conList.array = [].concat(data.unlockTarget, [clientCore.LocalInfo.sex == 1 ? data.femaleAward : data.maleAward]);
            this.btnUnLock.disabled = !this.checkChapter(data);
            this.updateBar(this.conList.scrollBar);
        }

        private conRender(item: CondRender, index: number): void {
            item.setData(this._roleId, this.conList.array[index]);
        }

        private unLockChapter(): void {
            let data: xls.date = this.chapterList.array[this._currentInx];
            if (!data) return;
            net.send(new pb.cs_unlock_engagement_info({ engageId: data.dateId }));
        }

        /** 更新副本*/
        private updateCopy(): void {
            this.chapterList.refresh();
            !this.chapterList.visible && this.showStage(this.chapterList.array[this._currentInx]);
        }

        /**
         * 更新滑条
         * @param scr 
         */
        private changeBar(scr: Laya.ScrollBar): void {
            if (scr.max == 0) return;
            this.imgBar.y = -4 + 461 * (scr.value / scr.max);
        }

        private updateBar(scr: Laya.ScrollBar): void {
            this.boxBar.visible = scr.max != 0;
            this.changeBar(scr);
        }

        dispose(): void {
            this._stageMap && this._stageMap.dispose();
            this._stageMap = null;
        }
    }
}