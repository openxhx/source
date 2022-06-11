namespace loginBuy {
    export class LoginBuyModule extends ui.loginBuy.LoginBuyModuleUI {
        private loginDay: number;
        private rewardStatus: number;
        private canBuy: boolean;
        constructor() {
            super();
            this.sideClose = true;
        }

        init(data: any) {
            this.addPreLoad(xls.load(xls.dayAward));
            this.addPreLoad(this.getEventInfo());
            this.panel.hScrollBarSkin = "";
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            clientCore.Logger.sendLog('2020年11月20日活动', '【付费】感恩6元购', '打开活动面板');
        }

        async getEventInfo() {
            let itemId = clientCore.RechargeManager.getShopInfo(45)
            this.canBuy = !clientCore.ItemsInfo.checkHaveItem(itemId.rewardFamale[0].v1) && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2020/11/27 00:00:00");
            await net.sendAndWait(new pb.cs_buy_for_six_yuan_on_the_seventh_night_get_info({})).then((data: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_info) => {
                this.loginDay = data.days;
                this.rewardStatus = data.rewardStatus;
            })
        }

        async onPreloadOver() {
            this.setUI();
        }

        private setUI() {
            this.btnBuy.visible = this.canBuy;
            let xlsArr = _.filter(xls.get(xls.dayAward).getValues(), o => o.type == 62);
            for (let i: number = 1; i <= 7; i++) {
                this["imgGot" + i].visible = util.getBit(this.rewardStatus, i) == 1;
                this["btnGet" + i].visible = !this["imgGot" + i].visible && i <= this.loginDay;
                this["day" + i].imgSuo.visible = i > this.loginDay;
                this["day" + i].imgDay.skin = "loginBuy/" + i + ".png";
                let xlsData = xlsArr[i - 1];
                let reward = clientCore.LocalInfo.sex == 1 ? xlsData.femaleAward : xlsData.maleAward;
                for (let j: number = 0; j < reward.length; j++) {
                    this["day" + i]["reward" + (j + 1)].skin = clientCore.ItemsInfo.getItemIconUrl(reward[j].v1);
                    this["day" + i]["lab" + (j + 1)].text = "x" + reward[j].v2;
                    BC.addEvent(this, this["day" + i]["reward" + (j + 1)], Laya.Event.CLICK, this, this.showReward, [this["day" + i]["reward" + (j + 1)], reward[j].v1])
                }
            }
        }

        private showReward(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        private updataUI() {
            this.btnBuy.visible = this.canBuy;
            for (let i: number = 1; i <= 7; i++) {
                this["imgGot" + i].visible = util.getBit(this.rewardStatus, i) == 1;
                this["btnGet" + i].visible = !this["imgGot" + i].visible && i <= this.loginDay;
                this["day" + i].imgSuo.visible = i > this.loginDay;
            }
        }

        /**领取奖励 */
        private getReward(day: number) {
            net.sendAndWait(new pb.cs_buy_for_six_yuan_on_the_seventh_night_get_reward({ day: day })).then((data: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_reward) => {
                alert.showReward(data.item);
                this.rewardStatus = util.setBit(this.rewardStatus, day, 1);
                this.updataUI();
                util.RedPoint.reqRedPointRefresh(20101);
            })
        }

        /**购买6元购 */
        private buyGift() {
            clientCore.RechargeManager.pay(45).then(() => {
                this.loginDay = 1;
                this.canBuy = false;
                this.updataUI();
            });
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1107);
        }

        private onTry() {
            alert.showPreviewModule(2110194)
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyGift);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            for (let i: number = 1; i <= 7; i++) {
                BC.addEvent(this, this["btnGet" + i], Laya.Event.CLICK, this, this.getReward, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}