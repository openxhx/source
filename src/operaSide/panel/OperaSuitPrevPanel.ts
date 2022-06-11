namespace operaSide {
    export class OperaSuitPrevPanel extends ui.operaSide.panel.OperaSuitPrevPanelUI {
        private _person: clientCore.Person;
        constructor() {
            super();
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
            this._person.x = this.width / 2;
            this._person.y = Laya.stage.height / 2;
            this._person.scale(0.8, 0.8)
            this.addChildAt(this._person, 0);
            this._person.upByIdArr(clientCore.SuitsInfo.getSuitInfo(2110159).clothes);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}