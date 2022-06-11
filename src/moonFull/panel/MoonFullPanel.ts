namespace moonFull {
    /**
     * 月满西楼
     * 2021/9/14
     */

    /**套装ID */
    const CLOTHS: number[] = [
        2110487,
        2110488,
        1000145,
        1100103
    ]
    /**购买ID */
    const BUYID: number[] = [
        2886,
        2887,
        2888,
        2889,
        2890,
        2891,
        2892,
        2893,
        2894
    ]
    export class MoonFullPanel extends ui.moonFull.panel.MoonFullPanelUI {
        /**代币ID */
        private coinId: number = 9900003;
        private ruleId: number = 1145;

        init() {
            this.updataUI();
        }
        onPreloadOver() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            clientCore.Logger.sendLog('2021年9月17日活动', '【付费】月满西楼', '打开月满西楼面板');
        }
        addEventListeners() {
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTry, [3]);
            BC.addEvent(this, this.btn_tag, Laya.Event.CLICK, this, this.onTag);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btn_Buy1, Laya.Event.CLICK, this, this.onBuy1);
            BC.addEvent(this, this.btn_Buy2, Laya.Event.CLICK, this, this.onBuy2);
            BC.addEvent(this, this.btn_receive, Laya.Event.CLICK, this, this.onAllBuy);

        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
        /**试装 */
        private onTry(idx: number): void {
            switch (idx) {
                case 0:
                case 1:
                    alert.showCloth(CLOTHS[idx]);
                    break;
                case 2:
                case 3:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: CLOTHS[idx] });
                    break;
            }

        }
        /**标签切换 */
        private onTag(): void {
            clientCore.ModuleManager.open("moonFull.DyeingPanel");
            this.destroy();

        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**状态更新 */
        private updataUI(): void {
            if (clientCore.ItemsInfo.checkHaveItem(CLOTHS[0]) && clientCore.ItemsInfo.checkHaveItem(CLOTHS[1])) {
                if (clientCore.ItemsInfo.checkHaveItem(CLOTHS[2])) {
                    this.btn_Buy1.disabled = true;
                    this.btn_Buy2.disabled = true;
                    this.btn_receive.skin = 'moonFull/btn_receive0.png';
                    this.btn_receive.disabled = true
                    this.imgGot1.visible = true;
                    this.imgGot2.visible = true;
                    this.imgGot3.visible = true;
                }
                else {
                    this.btn_receive.disabled = false;
                    this.btn_Buy1.disabled = true;
                    this.btn_Buy2.disabled = true;
                    this.btn_receive.skin = 'moonFull/btn_receive0.png';
                    this.imgGot1.visible = true;
                    this.imgGot2.visible = true;
                }
            }
            else if (clientCore.ItemsInfo.checkHaveItem(CLOTHS[0]) && !clientCore.ItemsInfo.checkHaveItem(CLOTHS[1])) {
                this.btn_Buy1.disabled = true;
                this.btn_receive.disabled = true;
                this.imgGot1.visible = true;

            }
            else if (!clientCore.ItemsInfo.checkHaveItem(CLOTHS[0]) && clientCore.ItemsInfo.checkHaveItem(CLOTHS[1])) {
                this.btn_Buy2.disabled = true;
                this.btn_receive.disabled = true;
                this.imgGot2.visible = true;
            }



        }

        /**购买1 */
        private onBuy1(): void {
            let coin = this.coinId;
            let price: number;
            let num: number;
            if (clientCore.FlowerPetInfo.petType == 3) {
                price = parseInt(this.labPrice2.text);
                num = 2;
            } else if (clientCore.FlowerPetInfo.petType >= 1) {
                price = parseInt(this.labPrice1.text);
                num = 1;
            } else {
                price = parseInt(this.labPrice0.text);
                num = 0;
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
                            net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 3, activityId: 185, idxs: [BUYID[num]] })).then((msg: pb.sc_common_recharge_buy) => {
                                alert.showReward(msg.items);
                                this.updataUI();
                            });
                        }]
                    }
                })
            }
        }
        /**购买2 */
        private onBuy2(): void {
            let coin = this.coinId;
            let price: number;
            let num: number;
            if (clientCore.FlowerPetInfo.petType == 3) {
                price = parseInt(this.labPrice5.text);
                num = 5;
            } else if (clientCore.FlowerPetInfo.petType >= 1) {
                price = parseInt(this.labPrice4.text);
                num = 4;
            } else {
                price = parseInt(this.labPrice3.text);
                num = 3;
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
                            net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 3, activityId: 185, idxs: [BUYID[num]] })).then((msg: pb.sc_common_recharge_buy) => {
                                alert.showReward(msg.items);
                                this.updataUI();
                            });
                        }]
                    }
                })
            }
        }
        /**购买3 */
        private onAllBuy(): void {
            if (this.btn_receive.skin == 'moonFull/btn_allbuy.png') {
                let coin = this.coinId;
                let price: number;
                let num: number;
                if (clientCore.FlowerPetInfo.petType == 3) {
                    price = parseInt(this.labPrice8.text);
                    num = 8;
                } else if (clientCore.FlowerPetInfo.petType >= 1) {
                    price = parseInt(this.labPrice7.text);
                    num = 7;
                } else {
                    price = parseInt(this.labPrice6.text);
                    num = 6;
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
                                net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 3, activityId: 185, idxs: [BUYID[num]] })).then((msg: pb.sc_common_recharge_buy) => {
                                    alert.showReward(msg.items);
                                    this.updataUI();
                                });
                            }]
                        }
                    })
                }
            }
            else {
                net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 3, activityId: 185  , index:1})).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                    alert.showReward(msg.items);
                    this.updataUI();
                })
            }

        }




    }
}