namespace flowerPet {
    /**
     * 形象展示
     */
    export class ImagePanel extends ui.flowerPet.panel.ImagePanelUI {

        private _arc: component.HuaArc2;
        private _waiting: boolean;
        private _big: number;

        constructor() {
            super();
            this.list.hScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.itemRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse, null, false);
        }

        show(): void {
            this.initArc();
            this.list.array = new Array(4);
            this.vStack.selectedIndex = 0;
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            this._arc?.dispose();
            this._arc = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onCancel);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private itemRender(item: ui.flowerPet.item.ImageTypeItemUI, index: number): void {
            item.labType.text = ['幼年花宝', '少年花宝', '成年花宝', '通用形象'][index];
            item['bone']?.dispose();
            item['bone'] = null;
            item['bone'] = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(index + 1, 1), 'idle', true, item);
            item['bone'].pos(item.width / 2, 500);
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK && e.target instanceof component.HuaButton) {
                this.vStack.selectedIndex = 1;
                this._big = index + 1;
                this._arc.array = new Array(xls.get(xls.babyFree).get(index + 1).imageNum);
                this._arc.showIndex = 0;
            }
        }

        private initArc(): void {
            this._arc = new component.HuaArc2(1100, 550, 1, 0.6);
            this._arc.hScrollBarSkin = "";
            this._arc.itemRender = ui.flowerPet.item.ImageItemUI;
            this._arc.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this._arc.showHandler = new Laya.Handler(this, this.listShow, null, false);
            this._arc.list.y = 57;
            this._arc.setRollRation(0.91);
            this.boxShow.addChild(this._arc.list);
        }

        private listRender(item: ui.flowerPet.item.ImageItemUI, index: number): void {
            let select: clientCore.ShowType = clientCore.FlowerPetInfo.select;
            item.imgYes.visible = select.big == this._big && select.little == index + 1;
            item.detailBtn.visible = this._big == 4;
            BC.addEvent(this, item.detailBtn, Laya.Event.CLICK, this, this.onTips, [item, (4500000+index+1)]);
            item['bone']?.dispose();
            item['bone'] = null;
            item['bone'] = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(this._big, index + 1), 'idle', true, item.spBone);
        }

        private listShow(index: number): void {
            let select: clientCore.ShowType = clientCore.FlowerPetInfo.select;
            this.btnSure.disabled = !clientCore.FlowerPetInfo.checkIsHave(this._big, index + 1) || (select.big == this._big && select.little == index + 1);
        }

        private onTips(cell: any, itemId: number): void {
            clientCore.ToolTip.showTips(cell, { id: itemId });
        }

        private onCancel(): void {
            this.vStack.selectedIndex = 0;
        }

        private onSure(): void {
            if (this._waiting) return;
            this._waiting = true;
            let select: clientCore.ShowType = clientCore.FlowerPetInfo.select;
            let little: number = this._arc.showIndex + 1;
            if (select.big == this._big && select.little == little) return;
            FlowerPetSCommand.ins.selectImg(parseInt(`${this._big}${little}`), new Laya.Handler(this, (status: number) => {
                this._waiting = false;
                if (status == 1) {
                    select.big = this._big;
                    select.little = little;
                    clientCore.PeopleManager.getInstance().player.changeFlowerPet(this._big, little);
                    this._arc.refresh();
                    alert.showFWords('切换成功');
                } else {
                    alert.showFWords('切换失败，请重新尝试~');
                }
            }))
        }
    }
}