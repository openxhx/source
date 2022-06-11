namespace faeryBless {
    /**
     * 神祈之佑
     * faeryBless.FaeryBlessModule
     */
    export class FaeryBlessModule extends ui.faeryBless.FaeryBlessModuleUI {
        private flag: number;
        private myCode: string;
        private codePanel: FaeryCodePanel;
        init() {
            clientCore.UIManager.setMoneyIds([9900284])
            clientCore.UIManager.showCoinBox();
            if (clientCore.LocalInfo.sex == 2) {
                this.imgSuit.skin = "unpack/faeryBless/suit_2.png";
                this.imgFaery.skin = "unpack/faeryBless/faery_2.png";
                this.imgHand.skin = "faeryBless/150370.png";
            }
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_common_passwd({ activityId: 221 })).then((msg: pb.sc_get_common_passwd) => {
                this.myCode = msg.passwd;
                this.flag = msg.flag;
                this.btnExchange.visible = msg.flag == 0;
            }));
            this.btnBuy.visible = !clientCore.ItemsInfo.checkHaveItem(2110571);
        }

        /**展示礼包内容 */
        private showGiftContent() {
            let reward = clientCore.LocalInfo.sex == 1 ? xls.get(xls.eventExchange).get(3093).femaleProperty : xls.get(xls.eventExchange).get(3093).maleProperty;
            clientCore.ToolTip.showContentTips(this.imgGift, 0, reward);
        }

        /**预览套装、坐骑、 背景秀、舞台*/
        private previewReward() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [1000172, 1100118, 2110571, 1200028], condition: "购买海市蜃楼礼包" });
        }

        /**查看花精灵 */
        private previewFaery() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2300071);
        }

        /**打开兑换面板 */
        private openCodePanel() {
            if (this.flag == 1) {
                alert.showFWords("已经兑换过了~");
                this.btnExchange.visible = false;
                return;
            }
            if (!this.codePanel) this.codePanel = new FaeryCodePanel();
            clientCore.DialogMgr.ins.open(this.codePanel);
        }

        /**显示我的神奇密码 */
        private showMyCode() {
            if (this.myCode && this.myCode != "") {
                this.labCode.text = this.myCode;
                this.boxCode.visible = true;
            } else {
                alert.showFWords("还未解锁~");
            }
        }

        /**关闭我的神奇密码 */
        private hideMyCode() {
            this.boxCode.visible = false;
        }

        /**购买 */
        private buy() {
            let have = clientCore.ItemsInfo.getItemNum(9900284);
            let cost = 790;
            if (have < cost) {
                alert.showFWords("中国结不足~");
                clientCore.ModuleManager.open("rechargeCoin.RechargeCoinModule", [219, 1, 2, 3]);
                return;
            } else {
                this.btnBuy.visible = false;
                alert.showSmall("是否花费790中国结购买海市蜃楼礼包?", {
                    callBack: {
                        caller: this, funArr: [() => {
                            net.sendAndWait(new pb.cs_overture_of_spring_buy_cdk_gift({ exchangeId: 3093 })).then((msg: pb.sc_overture_of_spring_buy_cdk_gift) => {
                                alert.showReward(msg.items);
                                this.myCode = msg.passwd;
                                this.showMyCode();
                            })
                        }, () => {
                            this.btnBuy.visible = true;
                        }]
                    }
                })
            }
        }

        /**复制 */
        private copyCode() {
            clientCore.NativeMgr.instance.copyStr(this.labCode.text);
        }

        /**跳转花宝促销 */
        private goPetSell(){
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("rechargeActivity.RechargeActivityModule");
        }

        /**打开帮助说明 */
        private openHelp(){
            alert.showRuleByID(1229);
        }

        addEventListeners() {
            BC.addEvent(this, this.imgGift, Laya.Event.CLICK, this, this.showGiftContent);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewReward);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.previewFaery);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.openCodePanel);
            BC.addEvent(this, this.btnCode, Laya.Event.CLICK, this, this.showMyCode);
            BC.addEvent(this, this.btnFaery, Laya.Event.CLICK, this, this.hideMyCode);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnCopy, Laya.Event.CLICK, this, this.copyCode);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.openHelp);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goPetSell);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this.codePanel?.destroy();
            this.codePanel = null;
            super.destroy();
        }
    }
}