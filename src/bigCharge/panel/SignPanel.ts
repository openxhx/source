namespace bigCharge {
    export class SignPanel extends ui.bigCharge.panel.SignPanelUI {
        constructor() {
            super();
            this.setUI();
        }

        private setUI() {
            let cur = BigChargeModel.instance.signDay + 1;
            if (cur > 7) cur = 7;
            this.imgSelect.x = this["point" + cur].x - 8;
            this.imgSelect.y = this["point" + cur].y - 7;
            for (let i: number = 1; i <= 7; i++) {
                this["imgGot" + i].visible = i <= BigChargeModel.instance.signDay;
                if (i <= 4) {
                    this["imgCnt" + i].skin = clientCore.FlowerPetInfo.petType == 3 ? 'bigCharge/SignPanel/x2.png' : 'bigCharge/SignPanel/x1.png';
                } else {
                    this["imgCnt" + i].skin = clientCore.FlowerPetInfo.petType == 3 ? 'bigCharge/SignPanel/x4.png' : 'bigCharge/SignPanel/x2.png';
                }
            }
            this.btnGetReward.visible = BigChargeModel.instance.signDay == 7 && BigChargeModel.instance.isSignReward == 0;
        }

        popupOver() {
            clientCore.Logger.sendLog('2021年8月27日活动', '【付费】夏日终曲第九期', '打开签到面板');
            this.signUp();
        }

        /**签到 */
        private signUp() {
            if (BigChargeModel.instance.isSign) {
                alert.showFWords('今日已签到');
                return;
            }
            net.sendAndWait(new pb.cs_summer_recharge_auto_sign({ stage: 1 })).then((msg: pb.sc_summer_recharge_auto_sign) => {
                alert.showReward(msg.items);
                BigChargeModel.instance.signDay++;
                BigChargeModel.instance.isSign = 1;
                this["imgGot" + BigChargeModel.instance.signDay].visible = true;
                this.btnGetReward.visible = BigChargeModel.instance.signDay == 7;
            })
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_recharge_get_extra_reward({ type: 1 })).then((msg: pb.sc_summer_recharge_get_extra_reward) => {
                alert.showReward(msg.items);
                this.btnGetReward.visible = false;
                BigChargeModel.instance.isSignReward = 1;
            })
        }

        private onCloseClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnGetReward, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.goHuabaoHouse);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}