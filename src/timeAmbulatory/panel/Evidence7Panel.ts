namespace timeAmbulatory {
    export class Evidence7Panel extends ui.timeAmbulatory.panel.Evidence7PanelUI {
        //2474,2475,2476,2477
        private buyHbyxCost: number;
        private buyMtyyCost: number = 199;
        private limitNum: number = 0;
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.imgGou.y = 90;
                this.buyHbyxCost = 220;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.imgGou.y = 60;
                this.buyHbyxCost = 320;
            } else {
                this.imgGou.y = 30;
                this.buyHbyxCost = 420;
            }
            this.labOriginal.text = "420";
            this.labQimiao.text = "320";
            this.labShanyao.text = "220";
            this.setUI();
        }

        public async onShow() {
            clientCore.Logger.sendLog('2021年2月26日活动', '【付费】光阴的回廊', '打开元夜灯宵页签');
            this.boxBuyMtyy.disabled = false;
            let isGotMtyy = clientCore.SuitsInfo.getSuitInfo(2110300).allGet;
            this.boxBuyMtyy.visible = clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec('2021-2-26 08:00:00') && !isGotMtyy;
            net.sendAndWait(new pb.cs_time_cloister_get_limit_7st()).then((msg: pb.sc_time_cloister_get_limit_7st) => {
                this.limitNum = msg.remainNum;
                this.boxBuyMtyy.disabled = this.limitNum <= 0;
                if (this.limitNum <= 0) {
                    this.labLimit.text = "已售完";
                } else {
                    this.labLimit.text = "限量：" + this.limitNum;
                }
            });
            if (clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec('2021-2-26 08:00:00')) {
                Laya.timer.loop(1000, this, this.onTime);
                this.onTime();
                this.tipLimit.visible = true;
                this.boxTime.visible = true;
            } else {
                this.tipLimit.visible = false;
                this.boxTime.visible = false;
            }
        }

        private onTime() {
            if (clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec('2021-2-26 08:00:00')) {
                let dis = util.TimeUtil.formatTimeStrToSec('2021-2-26 08:00:00') - clientCore.ServerManager.curServerTime;
                this.labTime.text = util.TimeUtil.formatSecToStr(dis);
            } else {
                Laya.timer.clear(this, this.onTime);
                this.tipLimit.visible = false;
                this.boxTime.visible = false;
                this.boxBuyMtyy.disabled = this.limitNum <= 0;
                this.boxBuyMtyy.visible = true;
            }
        }

        private setUI() {
            //黑白元宵
            let isGotHbyx = clientCore.SuitsInfo.getSuitInfo(2110292).allGet;
            this.boxBuyHbyx.visible = !isGotHbyx;
            this.imgGotHbyx.visible = isGotHbyx;
            //蜜糖夜愿
            let isGotMtyy = clientCore.SuitsInfo.getSuitInfo(2110300).allGet;
            this.boxBuyMtyy.visible = !isGotMtyy;
            this.imgGotMtyy.visible = isGotMtyy;
            //背景和头发
            let isGotBg = clientCore.ItemsInfo.checkHaveItem(1000086);
            this.btnGet.visible = !isGotBg && isGotHbyx && isGotMtyy;
            this.imgGotBg.visible = isGotBg;
            //价格
            this.labCostMtyy.text = "199";
        }

        public hide() {
            Laya.timer.clear(this, this.onTime);
            this.visible = false;
        }

        /**购买套装 */
        private buySuit(type: number) {
            let cost = type == 1 ? this.buyMtyyCost : this.buyHbyxCost;
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
            net.sendAndWait(new pb.cs_time_cloister_buy_suit_7st({ idx: type })).then(async (data: pb.sc_time_cloister_buy_suit_7st) => {
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

        /**有人购买了限量套装 */
        private onLimitBuy() {
            if (!this.visible || this.limitNum <= 0) return;
            net.sendAndWait(new pb.cs_time_cloister_get_limit_7st()).then((msg: pb.sc_time_cloister_get_limit_7st) => {
                if (!this.visible) return;
                this.limitNum = msg.remainNum;
                this.boxBuyMtyy.disabled = this.limitNum <= 0;
                if (this.limitNum <= 0) {
                    this.labLimit.text = "已售完";
                } else {
                    this.labLimit.text = "限量：" + this.limitNum;
                }
                if (this.limitNum <= 0) {
                    clientCore.DialogMgr.ins.closeAllDialog();
                }
            });
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.Logger.sendLog('2021年2月26日活动', '【付费】光阴的回廊', '元夜灯宵点击升级闪耀花宝按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTryMtyy, Laya.Event.CLICK, this, this.trySuit, [2110300]);
            BC.addEvent(this, this.btnTryHbyx, Laya.Event.CLICK, this, this.trySuit, [2110292]);
            BC.addEvent(this, this.boxBuyMtyy, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.boxBuyHbyx, Laya.Event.CLICK, this, this.buySuit, [2]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.buy, [3]);
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.goHuabaoHouse);
            Laya.timer.loop(3000, this, this.onLimitBuy);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.onLimitBuy);
            BC.removeEvent(this);
        }

        public destroy() {
            this.hide();
            super.destroy();
            this.removeEventListeners();
        }
    }
}