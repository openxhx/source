namespace timeAmbulatory {
    export class Evidence4Panel extends ui.timeAmbulatory.panel.Evidence4PanelUI {
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.setUI();
            //价格
            this.labCost.text = "420";
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年2月5日活动', '【付费】光阴的回廊', '打开迎春之琴页签');
        }

        private setUI() {
            //幻蓝天琴
            let isGotHltq = clientCore.SuitsInfo.getSuitInfo(2110243).allGet;
            this.btnGetPet.visible = !isGotHltq;
            this.imgGot.visible = isGotHltq;
            //瑞雪迎春
            let isGotRxyc = clientCore.SuitsInfo.getSuitInfo(2100276).allGet;
            this.btnBuy.visible = !isGotRxyc;
            this.imgBuy.visible = isGotRxyc;
            //舞台
            let isGotStage = clientCore.ItemsInfo.checkHaveItem(1000068);
            this.btnGet.visible = !isGotStage && isGotHltq && isGotRxyc;
            this.imgGotStage.visible = isGotStage;
        }

        public hide() {
            this.visible = false;
        }

        /**购买套装 */
        private buySuit(type: number) {
            let cost = 420;
            if (!this.checkMoney(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, cost)) return;
            alert.showSmall(`确定花费${cost}灵豆购买所选商品吗？`, {
                callBack: {
                    caller: this, funArr: [() => { this.buy(type); }]
                }
            })
        }

        /**检查余额 */
        private checkMoney(costId: number, costValue: number) {
            let has = clientCore.ItemsInfo.getItemNum(costId);
            if (has < costValue) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return false;
            }
            return true;
        }

        /**实际购买 */
        private buy(type: number) {
            if (type == 2 && clientCore.FlowerPetInfo.petType < 3) {
                alert.showSmall("是否前往升级闪耀花宝?", {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.goHuabaoHouse();
                        }]
                    }
                })
                return;
            }
            net.sendAndWait(new pb.cs_time_cloister_buy_suit_4st({ idx: type })).then(async (data: pb.sc_time_cloister_buy_suit_4st) => {
                alert.showReward(data.itms);
                this.setUI();
            }).catch(() => {
                this.setUI();
            })
        }

        /**试穿套装 */
        private trySuit(id: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.Logger.sendLog('2021年2月5日活动', '【付费】光阴的回廊', '迎春之琴点击升级闪耀花宝按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTryHltq, Laya.Event.CLICK, this, this.trySuit, [2110243]);
            BC.addEvent(this, this.btnTryRxyc, Laya.Event.CLICK, this, this.trySuit, [2100276]);
            BC.addEvent(this, this.btnGetPet, Laya.Event.CLICK, this, this.buy, [2]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.buy, [3]);
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.goHuabaoHouse);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
        }
    }
}