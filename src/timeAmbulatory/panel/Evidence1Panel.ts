namespace timeAmbulatory {
    export class Evidence1Panel extends ui.timeAmbulatory.panel.Evidence1PanelUI {
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            let oriConfig = xls.get(xls.eventExchange).get(2428);
            this.labOriginal.text = "" + oriConfig.cost[0].v2;
            let qimiaoConfig = xls.get(xls.eventExchange).get(2429);
            this.labQimiao.text = "" + qimiaoConfig.cost[0].v2;
            let shanyaoConfig = xls.get(xls.eventExchange).get(2430);
            this.labShanyao.text = "" + shanyaoConfig.cost[0].v2;
            this.imgGou.y = 30;
            if (clientCore.FlowerPetInfo.petType == 3) this.imgGou.y = 90;
            else if (clientCore.FlowerPetInfo.petType > 0) this.imgGou.y = 60;
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开凋零回廊页签');
            this.setUI();
        }

        private setUI() {
            let isGot = clientCore.SuitsInfo.getSuitInfo(2100273).allGet;
            this.boxBuy.visible = !isGot;
            this.imgBuy.visible = isGot;
        }

        public hide() {
            this.visible = false;
        }

        /**购买套装 */
        private async buySuit() {
            let targetId = 2428;
            if (clientCore.FlowerPetInfo.petType == 3) targetId = 2430;
            else if (clientCore.FlowerPetInfo.petType > 0) targetId = 2429;
            let config = xls.get(xls.eventExchange).get(targetId);
            let cost = config.cost[0].v2;
            if (!this.checkMoney(config.cost[0].v1, cost)) return;
            let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            let suitName = clientCore.ItemsInfo.getItemName(target);
            alert.showSmall(`确定花费${cost}${clientCore.ItemsInfo.getItemName(config.cost[0].v1)}购买${suitName}吗？`, {
                callBack: {
                    caller: this, funArr: [this.buy]
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
        private buy() {
            net.sendAndWait(new pb.cs_time_cloister_buy_suit_1st()).then(async (data: pb.sc_time_cloister_buy_suit_1st) => {
                let arr: pb.IItem[] = [];
                for (let j: number = 0; j < data.itms.length; j++) {
                    if (xls.get(xls.suits).has(data.itms[j].id)) {
                        let clothes = clientCore.SuitsInfo.getSuitInfo(data.itms[j].id).clothes;
                        for (let i: number = 0; i < clothes.length; i++) {
                            let item = new pb.Item();
                            item.id = clothes[i];
                            item.cnt = 1;
                            arr.push(item);
                        }
                    } else {
                        arr.push(data.itms[j]);
                    }
                }
                this.setUI();
                alert.showReward(arr);
            }).catch(() => {
                this.setUI();
            })
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2100273);
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.Logger.sendLog('2020年1月15日活动', '【付费】光阴的回廊', '点击升级闪耀花宝按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
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