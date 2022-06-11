namespace springOverture {
    /**
     * 限时礼包
     */
    export class FlashSalePanel extends ui.springOverture.panel.FlashSalePanelUI {
        /**展示倒计时 */
        private showTime: number;

        private onBuyFlag: boolean;
        constructor() {
            super();
            this.addEventListeners();
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listClick);
            let reward = clientCore.RechargeManager.getShopInfo(53).rewardFamale;
            this.list.repeatX = reward.length;
            this.list.array = reward;
        }

        async show(box: any) {
            clientCore.Logger.sendLog('2022年2月28日活动', '【付费】春日序曲', '打开限时礼包面板');
            EventManager.event(CHANGE_TIME, "time_1_6");
            this.showTime = 0;
            let msg = await clientCore.MedalManager.getMedal([MedalDailyConst.SPRING_OVERTURE_DAILY_BUY]);
            if (msg[0].value == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalDailyConst.SPRING_OVERTURE_DAILY_BUY, value: 1 }]);
                this.showTime = 3600;
            } else {
                this.showTime = msg[0].changeTime + 3600 - clientCore.ServerManager.curServerTime;
            }
            let isBuy = clientCore.RechargeManager.checkBuyLimitInfo(53).lastTime > util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (this.showTime > 0 && !isBuy) {
                this.boxGift.visible = true;
                this.imgWait.visible = false;
                Laya.timer.loop(1000, this, this.onTime);
            }else{
                this.boxGift.visible = false;
                this.imgWait.visible = true;
            }
            this.visible = true;
            box.addChild(this);
        }

        hide() {
            if (this.showTime > 0) Laya.timer.clear(this, this.onTime);
            this.removeSelf();
        }

        onBuy() {
            alert.showSmall("确定购买该礼包吗?", {
                callBack: {
                    caller: this, funArr: [() => {
                        if (this.onBuyFlag) return;
                        this.onBuyFlag = true;
                        clientCore.RechargeManager.pay(53).then((data) => {
                            alert.showReward(data.items);
                            this.boxGift.visible = false;
                            this.imgWait.visible = true;
                            this.onBuyFlag = false;
                        }).catch(() => {
                            this.onBuyFlag = false;
                        });
                    }]
                }
            })
        }

        listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
            item.txtName.color = "#892822";
        }

        listClick(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let reward: xls.pair = this.list.array[index];
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
            }
        }

        onTime() {
            this.showTime--;
            this.labTime.text = util.TimeUtil.formatSecToStr(this.showTime) + "后过期";
            if (this.showTime <= 0) {
                Laya.timer.clear(this, this.onTime);
                this.boxGift.visible = false;
                this.imgWait.visible = true;
            }
        }

        onOverDay() {
            this.boxGift.visible = true;
            this.imgWait.visible = false;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}