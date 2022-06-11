namespace buySevenGift {
    /**
     * 烛影摇华
     * 2021.7.9
     * buySevenGift.BuySevenGiftModule
     */
    export class BuySevenGiftModule extends ui.buySevenGift.BuySevenGiftModuleUI {
        public readonly activityId: number = 166;        //活动id
        public readonly redPointId: number = 20101;     //红点id
        public readonly ruleById: number = 1200;        //规则id
        public readonly buyGiftId: number = 22;         //活动礼包id
        public readonly buyEndTime: string = '2021/7/23 00:00:00';//礼包购买截止时间
        public readonly suitId: number = 2100293;       //套装id
        /**已登录天数 */
        private loginDay: number = 0;
        /**奖励状态 */
        private rewardStatus: number = 0;
        init(data?: any) {
            super.init(data);
            this.addPreLoad(xls.load(xls.dayAward));
            this.addPreLoad(net.sendAndWait(new pb.cs_buy_for_six_yuan_on_the_seventh_night_get_info({ flag: 1 })).then((msg: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_info) => {
                this.loginDay = msg.days;
                this.rewardStatus = msg.rewardStatus;
            }));
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.awardRender);
            this.imgGod1.visible = clientCore.LocalInfo.sex == 1;
            this.imgGod2.visible = clientCore.LocalInfo.sex == 2;
        }

        onPreloadOver() {
            clientCore.MedalManager.setMedal([{ id: MedalConst.BUY_SEVEN_GIFT_OPEN, value: 1 }]);
            let arr = _.filter(xls.get(xls.dayAward).getValues(), (o) => { return o.type == this.activityId });
            this.list.array = arr;
            this.updateView();
            clientCore.Logger.sendLog('2021年7月9日活动', '【付费】烛影摇华', '打开活动面板');
        }

        private awardRender(item: ui.buySevenGift.render.DayRewardItemUI) {
            let data: xls.dayAward = item.dataSource;
            let index: number = _.indexOf(this.list.array, data);
            item.imgDay.skin = `buySevenGift/day_${index + 1}.png`;
            item.imgGot.visible = util.getBit(this.rewardStatus, index + 1) == 1;
            item.btnGet.visible = !item.imgGot.visible && index < this.loginDay;
            let reward = clientCore.LocalInfo.sex == 1 ? data.femaleAward : data.maleAward;
            item.list.repeatX = reward.length;
            item.list.renderHandler = new Laya.Handler(this, this.rewardRender);
            item.list.selectHandler = new Laya.Handler(this, this.rewardClick, [index]);
            item.list.array = reward;
            item.imgName.visible = reward[0].v1 == 2300069;
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [index + 1]);
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.dayAward = this.list.array[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.femaleAward : config.maleAward)[index];
                if (reward) {
                    let item = _.find(this.list.cells, (o) => { return o.dataSource == config });
                    clientCore.ToolTip.showTips((item as any).list.cells[index], { id: reward.v1 });
                    return;
                };
            }
        }

        private rewardRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        /** 是否可以购买**/
        private get canBuy(): boolean {
            let tokenId = clientCore.RechargeManager.getShopInfo(this.buyGiftId).rewardFamale[0].v1;
            return !clientCore.ItemsInfo.checkHaveItem(tokenId) && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec(this.buyEndTime);
        }

        private updateView() {
            this.btnBuy.visible = this.canBuy;
            this.list.refresh();
        }

        private showReward(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleById);
        }

        /**领取奖励 */
        private getReward(day: number) {
            net.sendAndWait(new pb.cs_buy_for_six_yuan_on_the_seventh_night_get_reward({ flag: 1, day: day })).then((msg: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_reward) => {
                util.RedPoint.reqRedPointRefresh(this.redPointId);
                this.rewardStatus = util.setBit(this.rewardStatus, day, 1);
                this.updateView();
                alert.showReward(msg.item);
            });
        }

        /**购买6元购 */
        private buyGift() {
            clientCore.RechargeManager.pay(this.buyGiftId).then(() => {
                util.RedPoint.reqRedPointRefresh(this.redPointId);
                alert.showReward([{ v1: this.suitId, v2: 1 }]);
                this.loginDay = 1;
                this.updateView();
            });
        }

        /**预览神祈 */
        private showGod() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2300069);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.showGod);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyGift);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            super.destroy();
        }
    }
}