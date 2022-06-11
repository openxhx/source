namespace actingTrainee {
    export class ScriptPanel extends ui.actingTrainee.panel.ScriptPanelUI {
        private _sign: number;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(d: any) {
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;

            this.txtTime.text = model.answerTimes + '/' + model.answerNumMax;
        }

        private onDetail() {
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;
            alert.showRuleByID(model.ruleById3);
        }

        private onStart() {
            this.close();
            this.event("ON_OPEN_ANSWERMODULE");
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onStart);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}