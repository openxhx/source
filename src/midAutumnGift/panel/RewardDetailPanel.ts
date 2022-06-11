namespace midAutumnGift {
    export class RewardDetailPanel extends ui.midAutumnGift.panel.RewardDetailPanelUI {

        initOver() {
            this.imgCloth1.visible = this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgCloth2.visible = this.imgMale.visible = clientCore.LocalInfo.sex == 2;
        }

        private closeSelf() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addOnceEvent(this, this, Laya.Event.CLICK, this, this.closeSelf);
        }
    }
}