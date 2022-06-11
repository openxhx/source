namespace formation.dialog {
    /**
     * 神祈选择
     */
    export class PrayDialog extends ui.formation.panel.PrayUI {
        private _tmpSkill: number;
        private _tmpIdx: number;
        public addEventListeners(): void {
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.listPage.renderHandler = new Laya.Handler(this, this.onPageRender);
            this.listPage.selectHandler = new Laya.Handler(this, this.onPageSelect);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "praySkillPanel") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "listCell_0") {
                    var obj: any;
                    obj = this.list.getCell(0);
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

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onPageRender(cell: Laya.Clip, idx: number) {
            cell.index = idx == this.listPage.selectedIndex ? 0 : 1;
        }

        private onPageSelect(idx: number) {
            this.list.tweenTo(idx * 9, 200);
        }

        private onSure() {
            if (this.list.selectedItem != this._tmpSkill) {
                let data = clientCore.FormationControl.instance.praySkillArr.slice();
                data[this._tmpIdx] = this.list.selectedItem ? this.list.selectedItem : 0;
                clientCore.FormationControl.instance.setSkillArray(data);
            }
            this.hide();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSkillPanelSureIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private onListRender(cell: ui.formation.render.PraySkillRenderUI, idx: number) {
            let skillId = cell.dataSource;
            let skillInfo = xls.get(xls.SkillBase).get(skillId);
            cell.imgIcon.skin = pathConfig.getPraySkillIcon(skillId);
            cell.txtName.text = skillInfo.skillName;
            cell.txtDes.text = skillInfo.skillDesc;
            cell.txtCost.text = skillInfo.skillCost.v2.toString();
            cell.imgSelect.visible = this.list.selectedIndex == idx;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (this.list.selectedIndex == idx) {
                    this.list.selectedIndex = -1;
                }
                else {
                    this.list.selectedIndex = idx;
                }
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelectSkill") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }

        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitSkillPanelOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        public show(nowSkill: number, idx: number): void {
            clientCore.DialogMgr.ins.open(this);
            this._tmpSkill = nowSkill;
            this._tmpIdx = idx;
            this.list.dataSource = clientCore.FormationControl.instance.getPraySkillArrBySelectId(nowSkill);
            this.list.selectedIndex = this.list.dataSource.indexOf(nowSkill);
            this.listPage.dataSource = new Array(this.list.totalPage);
            this.listPage.selectedIndex = this.list.selectedIndex == -1 ? 0 : Math.floor(this.list.selectedIndex / 9);
            this.listPage.visible = this.listPage.totalPage > 1;
        }
        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}