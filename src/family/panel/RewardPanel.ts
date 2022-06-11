

namespace family.panel {
    /**
     * 神树升级奖励面板
     */
    export class RewardPanel extends ui.family.panel.RewardPanelUI {
        constructor() {
            super();

            this.list.hScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onChange);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
            let array: xls.familyLimit[] = xls.get(xls.familyLimit).getValues();
            this.list.array = _.pullAllBy(array, [{ "building": 0 }], "building");
            this.list.scrollBar.value = 0;
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private onChange(): void {
            this.imgBar.x = 12 + 737 * this.list.scrollBar.value / this.list.scrollBar.max;
        }

        private listRender(item: ui.family.item.RewardItemUI, index: number): void {
            let info: xls.familyLimit = this.list.array[index];
            let isHave: boolean = info.level <= FamilyModel.ins.treeLv;
            item.boxLock.visible = !isHave;
            item.imgHas.visible = isHave;

            let build: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(info.building);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(build.buildingId);
            item.txName.changeText(build.name);
            item.imgType.skin = pathConfig.getBuildType(build.mapArea);
            !isHave && item.txLock.changeText(`生命之树${info.level}级可解锁`);
        }
    }
}