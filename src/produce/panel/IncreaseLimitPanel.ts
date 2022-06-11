namespace produce.panel {
    /**
     * 补充材料
     */
    export class IncreaseLimitPanel extends ui.produce.panel.IncreaseLimitPanelUI {

        show() {
            clientCore.DialogMgr.ins.open(this);
        }
        initOver() {
            this.box_3.visible = clientCore.LocalInfo.userLv >= 20;
        }
        addEventListeners() {
            BC.addEvent(this, this.btnGo_1, Laya.Event.CLICK, this, this.onGoClick, [1]);
            BC.addEvent(this, this.btnGo_2, Laya.Event.CLICK, this, this.onGoClick, [2]);
            BC.addEvent(this, this.btnGo_3, Laya.Event.CLICK, this, this.onGoClick, [3]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);

        }
        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
        onGoClick(index: number) {
            if (index == 1) {
                this.onClose();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open("spirittree.SpirittreeModule");
            }
            else if(index == 2){
                this.onClose();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
            }
            else if(index == 3){
                if(!clientCore.ScienceTreeManager.ins.isOpen){
                    alert.showSmall("绿萝藤暂未开启！");
                    return;
                }
                this.onClose();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open("scienceTree.ScienceTreeModule");
            }
        }
        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}