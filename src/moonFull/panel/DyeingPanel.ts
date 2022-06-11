namespace moonFull {
    /**
     * 月满西楼
     * 2021/9/24
     */

    /**套装ID */
    const CLOTHS: number[] = [
        2110500,
        3800060,
        1100104
    ]
    /**购买ID */
    const BUYID: number[] = [
        2895,
        2896,
        2897
    ]
    export class DyeingPanel extends ui.moonFull.panel.DyeingPanelUI {
        /**代币ID */
        private coinId: number = 9900003;
        private ruleId: number = 1149;

        init() {
            this.upDataUI();
        }
        onPreloadOver() {
            clientCore.Logger.sendLog('2021年9月24日活动', '【付费】月满西楼', '打开月满西楼-素染韶华面板');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btn_tag, Laya.Event.CLICK, this, this.onTag);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btn_Buy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnReceive, Laya.Event.CLICK, this, this.onReceive);
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
                    alert.showCloth(CLOTHS[idx]);
                    break;
                case 1:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: CLOTHS[2] });
                    break;
            }

        }
        /**标签切换 */
        private onTag(): void {
            clientCore.ModuleManager.open("moonFull.MoonFullPanel");
            this.destroy();

        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        private upDataUI(): void {
            if (clientCore.ItemsInfo.checkHaveItem(CLOTHS[0])) {
                this.btn_Buy.visible = false;
                this.imgGot1.visible = true;
                this.imgGot2.visible = true;
                this.btnReceive.visible = true;
                this.breathing.play(0, true);
                if (clientCore.ItemsInfo.checkHaveItem(CLOTHS[1])) {
                    this.imgGot3.visible = true;
                    this.btnReceive.disabled = true;
                    this.breathing.gotoAndStop(0);
                }
            }
        }

        private onBuy(): void {
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
                            net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 4, activityId: 185, idxs: [BUYID[num]] })).then((msg: pb.sc_common_recharge_buy) => {
                                alert.showReward(msg.items);
                                this.upDataUI();
                            });
                        }]
                    }
                })
            }
        }

        private onReceive(): void {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 4, activityId: 185 , index:1})).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.upDataUI();
            })

        }

    }
}