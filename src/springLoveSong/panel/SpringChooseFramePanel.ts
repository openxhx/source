namespace springLoveSong {
    export class SpringChooseFramePanel extends ui.springLoveSong.panel.ChooseFrameUI {
        private _sign: number;
        public show(sign: number) {
            this._sign = sign;
            this.btnUse2.disabled = clientCore.FlowerPetInfo.petType == 0;
            clientCore.DialogMgr.ins.open(this);
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            // clientCore.Logger.sendLog('2021年2月26日活动', '【付费】光阴的回廊', '元夜灯宵点击升级闪耀花宝按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        private useBg(type: number) {
            let model = clientCore.CManager.getModel(this._sign) as SpringLoveSongModel;
            model.tempBg = type;
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.DialogMgr.ins.open(new SpringSubmitImagePanel(this._sign));
        }

        addEventListeners() {
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.goHuabaoHouse);
            BC.addEvent(this, this.btnUse1, Laya.Event.CLICK, this, this.useBg, [1]);
            BC.addEvent(this, this.btnUse2, Laya.Event.CLICK, this, this.useBg, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}