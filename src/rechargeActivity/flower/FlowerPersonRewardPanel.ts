namespace rechargeActivity {
    const BUY_MEDAL_ARR: number[] = [MedalDailyConst.GIVE_FLOWER_BUY_1, MedalDailyConst.GIVE_FLOWER_BUY_2];
    const RECHARGE_ID_ARR = [21, 22];

    export class FlowerPersonRewardPanel extends ui.rechargeActivity.flowerPanel.PersonalRewardPanelUI {
        private _buyMedalInfo: pb.ICommonData[];
        private _panel: FlowerCheapBuyPanel;
        private _petRwdGetted: boolean;
        constructor() {
            super();
            this.addEventListeners();
            this.imgSuit.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/rechargeActivity/giveFlower/female.png' : 'unpack/rechargeActivity/giveFlower/male.png';
            this.ani1.gotoAndStop(clientCore.LocalInfo.sex - 1);
        }

        async init() {
            this._buyMedalInfo = await clientCore.MedalManager.getMedal(BUY_MEDAL_ARR);
            await net.sendAndWait(new pb.cs_get_flower_baby_reward_status()).then((data: pb.sc_get_flower_baby_reward_status) => {
                this._petRwdGetted = data.flag == 1;
            })
            this.updateBtnState();
        }

        private updateBtnState() {
            this.btn_0.skin = `rechargeActivity/giveFlower/鲜花礼包${this._buyMedalInfo[0].value == 0 ? '' : 1}.png`;
            if (this._buyMedalInfo[0].value == 1 && this._buyMedalInfo[1].value == 1) {
                this.btn_0.disabled = true;
            }
            if (this._petRwdGetted) {
                this.clipPet.index = 0;
            }
            else {
                this.clipPet.index = clientCore.FlowerPetInfo.petType == 0 ? 2 : 1;
            }
            if (!clientCore.GiveFlowerManager.instance.isInActTime()) {
                for (let i = 0; i < 4; i++) {
                    this['btn_' + i].visible = false;
                }
                this.clipPet.visible = false;
            }
        }

        private onBtnClick(idx: number) {
            switch (idx) {
                case 0:
                    this.openCheapBuy();
                    break;
                case 1:
                    clientCore.ModuleManager.open('giveFlower.GiveFlowerExchangeModule');
                    break;
                case 2:
                    if (clientCore.FlowerPetInfo.petType == 0) {
                        clientCore.ModuleManager.closeAllOpenModule();
                        clientCore.ModuleManager.open('flowerPet.FlowerPetModule', null, { openWhenClose: 'rechargeActivity.RechargeActivityModule', openData: 6 })
                    }
                    else {
                        if (!this._petRwdGetted)
                            net.sendAndWait(new pb.cs_get_flower_baby_reward()).then((msg: pb.sc_get_flower_baby_reward) => {
                                msg.rewardInfo.length > 0 && alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), "");
                                this._petRwdGetted = true;
                                this.updateBtnState();
                                util.RedPoint.reqRedPointRefresh(5201);
                            });
                    }
                    break;
                case 3:
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('friends.FriendMainModule', null, { openWhenClose: 'rechargeActivity.RechargeActivityModule', openData: 6 })
                    break;
                default:
                    break;
            }
        }

        private openCheapBuy() {
            if (!this._buyMedalInfo)
                return;
            this._panel = this._panel || new FlowerCheapBuyPanel();
            let idx = 0;
            if (this._buyMedalInfo[0].value == 1)
                idx = 1;
            this._panel.showInfo(RECHARGE_ID_ARR[idx]);
            this._panel.on(Laya.Event.CHANGED, this, this.onBuyOver);
        }

        private onBuyOver(id: number) {
            let idx = RECHARGE_ID_ARR.indexOf(id);
            this._buyMedalInfo[idx].value = 1;
            clientCore.MedalManager.setMedal([{ id: BUY_MEDAL_ARR[idx], value: 1 }]);
            this.updateBtnState();
        }

        private onTry(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', idx == 0 ? 2100192 : 2100153);
        }

        addEventListeners() {
            for (let i = 0; i < 4; i++) {
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.onBtnClick, [i]);
            }
            for (let i = 0; i < 2; i++) {
                BC.addEvent(this, this['btnTry_' + i], Laya.Event.CLICK, this, this.onTry, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}