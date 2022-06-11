namespace moonFull {
    /**
     * 月满西楼模板
     * 2021/9/10
     */

    /**套装散件ID */
    const CLOTHS: number[] = [
        2110481,
        2110482,
        143028,
        143251,
        143252
    ]

    /**购买ID */
    const BUYID: number[] = [
        2882,
        2883,
        2884,
        2885
    ]


    export class MoonFullModule extends ui.moonFull.MoonFullModuleUI {
        /**代币ID */
        private coinId: number = 9900003;
        private ruleId: number = 1137;

        init() {
            this.updataUI();
        }
        onPreloadOver() {
            this.imgSuit1.visible = this.imgGift1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = this.imgGift2.visible = clientCore.LocalInfo.sex == 2;
            clientCore.Logger.sendLog('2021年9月10日活动', '【付费】月满西楼', '打开月满西楼面板');
        }

        /**UI状态刷新 */
        private updataUI() {
            for (let i: number = 1; i <= 5; i++) {
                this['imgGot' + i].visible = clientCore.ItemsInfo.checkHaveItem(CLOTHS[i - 1]);
            }
            for (let i: number = 1; i <= 2; i++) {
                this['btn_Buy' + i].disabled = clientCore.ItemsInfo.checkHaveItem(CLOTHS[i - 1]);
            }

            if (this.btn_Buy1.disabled == true && this.btn_Buy2.disabled == true && !clientCore.ItemsInfo.checkHaveItem(CLOTHS[2])) {
                this.btn_receive.disabled = false;
            } else if (clientCore.ItemsInfo.checkHaveItem(CLOTHS[2])) {
                this.btn_receive.disabled = true;
            }
            else {
                this.btn_receive.disabled = true;
            }
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }
        /**退出 */
        destroy() {
            super.destroy();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btn_Buy1, Laya.Event.CLICK, this, this.onBuy1);
            BC.addEvent(this, this.btn_Buy2, Laya.Event.CLICK, this, this.onBuy2);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btn_receive, Laya.Event.CLICK, this, this.onReceive);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btn_tag, Laya.Event.CLICK, this, this.onTag);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onTag(): void {
            clientCore.ModuleManager.open("moonFull.MoonFullPanel");
            this.destroy();
        }
        private onBuy1(): void {
            let coin = this.coinId;
            let price = parseInt(this.labPrice1.text);
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 2, activityId: 185, idxs: [BUYID[0]] })).then((msg: pb.sc_common_recharge_buy) => {
                                alert.showReward(msg.items);
                                this.updataUI();
                            });
                        }]
                    }
                })
            }
        }
        private onBuy2(): void {
            let coin = this.coinId;
            let price: number;
            let num: number;
            if (clientCore.FlowerPetInfo.petType == 3) {
                price = parseInt(this.labPrice4.text);
                num = 3;
            } else if (clientCore.FlowerPetInfo.petType >= 1) {
                price = parseInt(this.labPrice3.text);
                num = 2;
            } else {
                price = parseInt(this.labPrice2.text);
                num = 1;
            }
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 2, activityId: 185, idxs: [BUYID[num]] })).then((msg: pb.sc_common_recharge_buy) => {
                                alert.showReward(msg.items);
                                this.updataUI();
                            });
                        }]
                    }
                })
            }
        }
        private onReceive(): void {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 2, activityId: 185 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.updataUI();
            });
        }

        private onTry(idx: number): void {
            switch (idx) {
                case 0:
                case 1:
                    alert.showCloth(CLOTHS[idx]);
                    break;
            }
        }


    }



}
