namespace fairyClothShow {
    /**
     * fairyClothShow.FairyClothShowModule
     * 2020.12.11
     * 花仙橱窗秀
     */
    export class FairyClothShowModule extends ui.fairyClothShow.FairyClothShowModuleUI {
        /**当前售卖服装 */
        private curGoodsId: number;
        /**今日购买状态 */
        private isBuy: boolean;
        /**跨天倒计时 */
        private leftTime: number;
        /**打折 */
        private offVip: number;
        /**珠帘动画 */
        private ani1: clientCore.Bone;
        /**花宝动画 */
        private ani2: clientCore.Bone;
        /**套装模特 */
        private _person: clientCore.Person;
        /**弹窗子面板 */
        private smallPanel: ui.alert.SmallAlertUI;
        constructor() {
            super();
        }

        init(data: any) {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.eventExchangeVip));
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
            this._person.x = 293;
            this._person.y = clientCore.LocalInfo.sex == 1 ? 300 : 290;
            this._person.scale(0.6, 0.6);
            this.boxSuit.addChild(this._person);
        }

        async getEventInfo() {
            return net.sendAndWait(new pb.cs_flower_fairy_window_show_get_info()).then((msg: pb.sc_flower_fairy_window_show_get_info) => {
                this.curGoodsId = msg.exchangeId;
                this.isBuy = msg.isBuy == 1;
            });
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年12月11日活动', '【付费】花仙橱窗秀', '打开活动面板');
            this.offVip = _.find(xls.get(xls.eventExchangeVip).getValues(), (o) => { return o.vipLevel == clientCore.LocalInfo.vipLv && o.activityId == 103 }).price;
            this.showCurGoods();
            if (clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021/1/7 00:00:00")) {
                this.leftTime = 86400 - ((clientCore.ServerManager.curServerTime + 28800) % 86400);
                this.labTime.value = util.TimeUtil.formatSecToStr(this.leftTime, true);
                Laya.timer.loop(1000, this, this.onTime);
                this.boxTime.visible = true;
            } else {
                this.boxTime.visible = false;
            }
            this.ani1 = clientCore.BoneMgr.ins.play("res/animate/fairyClothShow/zhulian.sk", "animation5", true, this.imgBg);
            this.ani1.pos(616, 2);
        }

        /**展示商品 */
        private showCurGoods() {
            this.imgGot.visible = false;
            this.imgDone.visible = this.isBuy;
            this.lab_goodsname.visible = this.boxSell.visible = !this.isBuy;
            this.ani2?.dispose();
            if (this.isBuy) {
                this.ani2 = clientCore.BoneMgr.ins.play("res/animate/fairyClothShow/huabao.sk", "animation", true, this.imgDone);
                this.ani2.pos(470, 304);
                return;
            } else {
                this.ani2 = clientCore.BoneMgr.ins.play("res/animate/fairyClothShow/huabao.sk", "animation", true, this.boxSell);
                this.ani2.pos(70, 340);
            }
            this.imgGou.visible = this.labVipPrice.visible = this.imgOff.visible = clientCore.LocalInfo.vipLv > 0;
            let config = xls.get(xls.eventExchange).get(this.curGoodsId);
            let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            this.lab_goodsname.text = clientCore.ItemsInfo.getItemName(target);
            this.labVip.value = "" + clientCore.LocalInfo.vipLv;
            this.labPrice.text = "" + config.cost[0].v2;
            let price = config.cost[0].v2 - this.offVip;
            if (price < 0) price = 0;
            this.labVipPrice.text = "" + price;
            if (xls.get(xls.suits).has(target)) {
                this.boxItem.visible = false;
                this.boxSuit.visible = true;
                this.btnTry.disabled = false;
                let clothData = clientCore.SuitsInfo.getSuitInfo(target);
                this._person.replaceByIdArr(clothData.clothes);
                this.imgGot.visible = clothData.allGet;
            } else {
                this.boxItem.visible = true;
                this.boxSuit.visible = false;
                this.btnTry.disabled = !xls.get(xls.itemCloth).has(target);
                this.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(target);
            }
        }

        /**刷新商品 */
        private flushGoods() {
            if (!this.checkMoney(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, 10)) return;
            this.smallPanel = alert.showSmall(`确定花费10灵豆刷新橱窗吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.smallPanel = null;
                        this.btnChange.disabled = true;
                        net.sendAndWait(new pb.cs_flower_fairy_window_show_refresh()).then((msg: pb.sc_flower_fairy_window_show_refresh) => {
                            this.btnChange.disabled = false;
                            this.curGoodsId = msg.exchangeId;
                            this.showCurGoods();
                        });
                    }]
                }
            })
        }

        /**每日零点刷新 */
        private onChange(data: pb.sc_flower_fairy_window_show_update_notify) {
            clientCore.DialogMgr.ins.closeAllDialog();
            if (this.smallPanel) alert.closeShowSmall(this.smallPanel);
            this.smallPanel = null;
            if (clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec("2021/1/7 00:00:00")) {
                this.boxTime.visible = false;
                Laya.timer.clear(this, this.onTime);
            } else {
                clientCore.ServerManager.curServerTime = data.serverTime;
                this.leftTime = 86400 - ((clientCore.ServerManager.curServerTime + 28800) % 86400);
                this.labTime.value = util.TimeUtil.analysicTime(this.leftTime);
            }
            this.isBuy = false;
            this.curGoodsId = data.exchangeId;
            this.showCurGoods();
        }

        /**购买服装 */
        private buyCloth() {
            if (this.isBuy) {
                this.showCurGoods();
                return;
            }
            if (this.imgGot.visible) return;
            let config = xls.get(xls.eventExchange).get(this.curGoodsId);
            let cost = config.cost[0].v2 - this.offVip;
            if (cost < 0) cost = 0;
            if (!this.checkMoney(config.cost[0].v1, cost)) return;
            let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            let suitName = clientCore.ItemsInfo.getItemName(target);
            this.smallPanel = alert.showSmall(`确定花费${cost}${clientCore.ItemsInfo.getItemName(config.cost[0].v1)}购买${suitName}吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.smallPanel = null;
                        this.buy();
                    }]
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
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: this.curGoodsId, activityId: 103 })).then(async (data: pb.sc_common_exchange) => {
                alert.showReward(data.item);
                this.isBuy = true;
                this.showCurGoods();
            });
        }

        /**帮助说明 */
        private showHelp() {
            clientCore.Logger.sendLog('2020年12月11日活动', '【付费】花仙橱窗秀', '打开规则面板');
            alert.showRuleByID(1115);
        }

        /**试穿 */
        private tryGoods() {
            let config = xls.get(xls.eventExchange).get(this.curGoodsId);
            let target = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', target);
        }

        /**奖励总览 */
        private async preReward() {
            let rewardInfo: clientCore.RewardDetailInfo = new clientCore.RewardDetailInfo();
            for (let i: number = 2378; i <= 2392; i++) {
                let config = xls.get(xls.eventExchange).get(i);
                let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
                rewardInfo.rewardArr[3].push(reward);
            }
            // clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '打开全部奖励一览面板');
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", rewardInfo);
        }

        /**刷新时间 */
        private onTime() {
            this.leftTime--;
            this.labTime.value = util.TimeUtil.formatSecToStr(this.leftTime, true);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.tryGoods);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyCloth);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.flushGoods);
            BC.addEvent(this, this.btnShowAll, Laya.Event.CLICK, this, this.preReward);
            net.listen(pb.sc_flower_fairy_window_show_update_notify, this, this.onChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            if (clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021/1/7 00:00:00")) {
                Laya.timer.clear(this, this.onTime);
            }
            net.unListen(pb.sc_flower_fairy_window_show_update_notify, this, this.onChange);
        }

        destroy() {
            super.destroy();
            this.ani1?.dispose();
            this.ani2?.dispose();
            this.ani2 = this.ani1 = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}