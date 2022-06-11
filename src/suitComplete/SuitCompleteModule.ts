namespace suitComplete {
    export class SuitCompleteModule extends ui.suitComplete.SuitCompletePanelUI {

        init(d: number) {
            this.imgSuit.skin = pathConfig.getSuitImg(d, clientCore.LocalInfo.sex);
            this.labName.text = clientCore.SuitsInfo.getSuitInfo(d).suitInfo.name;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.go);
            BC.addEvent(this, this.imgClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private go() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('clothChange.ClothChangeModule');
        }
    }
}