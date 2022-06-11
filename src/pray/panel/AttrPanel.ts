
namespace pray.panel {
    /**
     * 详细属性面板
     */
    export class AttrPanel extends ui.pray.panel.AttrUIUI {

        private _roleInfo: clientCore.role.RoleInfo;
        private _xlsPray: xls.godprayBase;

        constructor() {
            super();
            this.attrList.vScrollBarSkin = "";
            this.attrList.renderHandler = Laya.Handler.create(this, this.renderItem, null, false);
        }

        public show(prayId: number): void {
            this._xlsPray = xls.get(xls.godprayBase).get(prayId);
            this._roleInfo = clientCore.RoleManager.instance.getSelfInfo();
            this.attrList.array = clientCore.role.EXT_ARRAY;
            this.showSkill();
            this.addEventListeners();
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this._roleInfo = this._xlsPray = null;
        }

        private renderItem(item: ui.pray.item.AttrItemUI, index: number): void {
            let type: number = this.attrList.array[index];
            let obj: any = this._roleInfo.getAttrInfo(type);
            item.all.changeText(obj.total);
            item.starAdd.changeText(`+(${obj.starAdd})`);
            item.prayAdd.changeText(`+(${obj.pray})`);
            item.ico.skin = `commonRes/exAttr_${type}.png`;
        }

        private showSkill(): void {
            let h: number = 0;
            let skills: number[] = this._xlsPray.skillId.concat(this._xlsPray.blessSkillId);
            for (let i: number = 1; i <= 3; i++) {
                let skillId: number = skills[i - 1];
                let xlsData: xls.SkillBase = xls.get(xls.SkillBase).get(skillId);
                if (xlsData) {
                    let rowH: number = Math.ceil(xlsData.skillDesc.length / 7) * 20;
                    this["txDesc" + i].height = rowH;
                    this["txDesc" + i].text = xlsData.skillDesc;
                    this["skillIco" + i].skin = i == 3 ? pathConfig.getPraySkillIcon(skillId) : pathConfig.getSkillIcon(skillId);
                    h = rowH > h ? rowH : h;
                }
            }
            this.bg.height = 467 + h; //根据技能描述的多少扩大背景
        }
    }
}
