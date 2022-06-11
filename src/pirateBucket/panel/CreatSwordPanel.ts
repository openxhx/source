namespace pirateBucket {
    export class CreatSwordPanel extends ui.pirateBucket.panel.CreatPanelUI {
        private missionStatus: number[] = [1, 5, 1];
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public showMission() {
            let model = clientCore.CManager.getModel(this._sign) as PirateBucketModel;
            this.task1.text = clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec("2021-5-7 00:00:00") ? "完成一次莱妮丝的挑战" : "完成一次劳动节大扫除";
            for (let i: number = 1; i <= 3; i++) {
                this["lab" + i].text = util.getBit(model.isGetReward, i) == 1 ? "" : model.getMissionInfo(i) + "/" + this.missionStatus[i - 1];
                this["finish" + i].visible = util.getBit(model.isGetReward, i) == 1;
                this["btn" + i].fontSkin = model.getMissionInfo(i) >= this.missionStatus[i - 1] ? "commonBtn/l_p_complete.png" : "commonBtn/T_p_go.png";
                this["btn" + i].disabled = util.getBit(model.isGetReward, i) == 1;
                if (i == 3 && this.btn3.disabled == false) {
                    this.btn3.disabled = clientCore.FlowerPetInfo.petType < 1;
                }
            }
        }

        private getReward(id: number) {
            let control = clientCore.CManager.getControl(this._sign) as PirateBucketControl;
            control.getMissionReward(id, new Laya.Handler(this, () => {
                let model = clientCore.CManager.getModel(this._sign) as PirateBucketModel;
                model.isGetReward = util.setBit(model.isGetReward, id, 1);
                this.showMission();
                EventManager.event("UPDATE_SWORD_ITEM");
                util.RedPoint.reqRedPointRefresh(10301);
            }))
        }

        private goMission(id: number) {
            this.onClose();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            let param = clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec("2021-5-7 00:00:00") ? 3 : 1;
            if (id == 1) clientCore.ModuleManager.open("odeToJay.OdeToJayModule", param, { openWhenClose: "pirateBucket.PirateBucketModule" });
            else clientCore.ModuleManager.open("playground.PlaygroundModule", null, { openWhenClose: "pirateBucket.PirateBucketModule" });
        }

        private onBtnClick(id: number) {
            let model = clientCore.CManager.getModel(this._sign) as PirateBucketModel;
            if (model.getMissionInfo(id) >= this.missionStatus[id - 1]) this.getReward(id);
            else this.goMission(id);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["btn" + i], Laya.Event.CLICK, this, this.onBtnClick, [i]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}