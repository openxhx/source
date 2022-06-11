namespace newYearGift {
    /**
     * 春节七日礼
     * newYearGift.NewYearGiftModule
     * 2021.2.8
     */
    export class NewYearGiftModule extends ui.newYearGift.NewYearGiftModuleUI {
        private _realDay: number;
        private _showDay: number;
        private onWait: boolean;
        private _timeInfo: pb.sc_get_new_year_seven_days_gifts_info;
        init(d: any) {
            super.init(d);
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.addPreLoad(xls.load(xls.taskData));
            this.addPreLoad(xls.load(xls.newYearSevenDays));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_new_year_seven_days_gifts_info()).then((data: pb.sc_get_new_year_seven_days_gifts_info) => {
                this._timeInfo = data;
            }))
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            // let taskInfo = clientCore.TaskManager.getTaskById(id);
            //     if (!taskInfo)
            //         return 1;
            //     else
            //         return taskInfo.state == TASK_STATE.COMPLETE ? -2 : 0;
        }

        onPreloadOver() {
            if (util.RedPoint.checkShow([23201])) {
                util.RedPoint.reqRedPointRefresh(23201);
            }
            if (clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-2-11 00:00:00")) {
                this._realDay = -1;
                this._showDay = 0;
            } else if (clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec("2021-2-18 00:00:00")) {
                this._realDay = 10;
                this._showDay = 0;
            } else {
                this._realDay = Math.floor((clientCore.ServerManager.curServerTime - util.TimeUtil.formatTimeStrToSec("2021-2-11 00:00:00")) / 86400);
                this._showDay = this._realDay;
            }
            this.setDayInfo();
            clientCore.Logger.sendLog('2021年2月8日活动', '【活跃活动】佳节有礼', '打开活动面板');
        }

        private setDayInfo() {
            let config = xls.get(xls.newYearSevenDays).get(this._showDay + 1);
            this.labCost.text = "消耗:" + config.cost.v2 + "灵豆";
            let task1Cfg = xls.get(xls.taskData).get(config.taskId[0]);
            let task1Info = clientCore.TaskManager.getTaskById(task1Cfg.task_id);
            this.labTask1.text = task1Cfg.task_content;
            let task2Cfg = xls.get(xls.taskData).get(config.taskId[1]);
            let task2Info = clientCore.TaskManager.getTaskById(task2Cfg.task_id);
            this.labTask2.text = task2Cfg.task_content;
            let reward = clientCore.LocalInfo.sex == 1 ? config.awardsFemale : config.awardsMale;
            this.list.array = reward;
            this.list.repeatX = reward.length;
            this.imgDay.skin = `newYearGift/day_${this._showDay}.png`;
            this.imgTalk.skin = `newYearGift/talk_${this._showDay}.png`;
            if (this._realDay < 0 || this._showDay > this._realDay) {
                this.labCost.visible = this.btnGet.visible = this.btnBuy.visible = false;
                this.btnGo1.visible = this.btnGo2.visible = false;
                this.imgOver1.visible = this.imgOver2.visible = true;
                this.imgFinish1.visible = this.imgFinish2.visible = false;
                this.labGot.visible = false;
            } else if (this._showDay < this._realDay) {
                this.btnGo1.visible = this.btnGo2.visible = false;
                this.imgFinish1.visible = task1Info.state == clientCore.TASK_STATE.COMPLETE;
                this.imgOver1.visible = !this.imgFinish1.visible;
                this.imgFinish2.visible = task2Info.state == clientCore.TASK_STATE.COMPLETE;
                this.imgOver2.visible = !this.imgFinish2.visible;
                this.btnGet.disabled = false;
                this.btnGet.visible = this.imgFinish1.visible && this.imgFinish2.visible && util.getBit(this._timeInfo.rewardFlag, this._showDay + 1) == 0;
                this.labCost.visible = this.btnBuy.visible = util.getBit(this._timeInfo.rewardFlag, this._showDay + 1) == 0 && !this.btnGet.visible;
                this.labGot.visible = util.getBit(this._timeInfo.rewardFlag, this._showDay + 1) == 1;
            } else {
                this.labCost.visible = this.btnBuy.visible = false;
                this.imgOver1.visible = this.imgOver2.visible = false;
                this.imgFinish1.visible = !task1Info || task1Info.state == clientCore.TASK_STATE.COMPLETE;
                this.btnGo1.visible = !this.imgFinish1.visible && task1Cfg.system_interface > 0;
                this.imgFinish2.visible = !task2Info || task2Info.state == clientCore.TASK_STATE.COMPLETE;
                this.btnGo2.visible = !this.imgFinish2.visible && task2Cfg.system_interface > 0;
                this.btnGet.disabled = !(this.imgFinish1.visible && this.imgFinish2.visible);
                this.btnGet.visible = util.getBit(this._timeInfo.rewardFlag, this._showDay + 1) == 0;
                this.labGot.visible = !this.btnGet.visible;
            }
            this.btnGet.onRedChange(!this.btnGet.disabled && this.btnGet.visible);
        }

        private listSelect(index: number) {
            if (index < 0) return;
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
            };
            this.list.selectedIndex = -1;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        private changeDay(flag: number) {
            this._showDay += flag;
            if (this._showDay >= 7) this._showDay = 0;
            if (this._showDay < 0) this._showDay = 6;
            this.setDayInfo();
        }

        private onTry() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110282);
        }

        private onDetail() {
            clientCore.Logger.sendLog('2021年2月8日活动', '【活跃活动】佳节有礼', '打开规则面板');
            alert.showRuleByID(1129);
        }

        private goTask(idx: number) {
            if (this._showDay != this._realDay) {
                this.setDayInfo();
                return;
            }
            let config = xls.get(xls.newYearSevenDays).get(this._realDay + 1);
            let taskCfg = xls.get(xls.taskData).get(config.taskId[idx]);
            if (taskCfg.system_interface)
                clientCore.ToolTip.gotoMod(taskCfg.system_interface);
        }

        private getReward() {
            if (this.onWait) return;
            this.onWait = true;
            net.sendAndWait(new pb.cs_get_new_year_seven_days_reward({ id: this._showDay + 1 })).then((msg: pb.sc_get_new_year_seven_days_reward) => {
                alert.showReward(msg.items);
                this.btnGet.visible = false;
                this.labGot.visible = true;
                this.onWait = false;
                this._timeInfo.rewardFlag = util.setBit(this._timeInfo.rewardFlag, this._showDay + 1, 1);
                util.RedPoint.reqRedPointRefresh(23202);
            }).catch(() => {
                this.onWait = false;
            })
        }

        private buyReward() {
            let config = xls.get(xls.newYearSevenDays).get(this._showDay + 1);
            let cost = config.cost.v2;
            if (cost > clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID)) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
            } else {
                alert.showSmall(`确定花费${cost}灵豆购买该奖励?`, {
                    callBack: {
                        funArr: [() => {
                            if (this.onWait) return;
                            this.onWait = true;
                            net.sendAndWait(new pb.cs_buy_new_year_seven_days_reward({ id: this._showDay + 1 })).then((msg: pb.sc_buy_new_year_seven_days_reward) => {
                                alert.showReward(msg.items);
                                this.labCost.visible = this.btnBuy.visible = false;
                                this.labGot.visible = true;
                                this._timeInfo.rewardFlag = util.setBit(this._timeInfo.rewardFlag, this._showDay + 1, 1);
                                this.onWait = false;
                            }).catch(() => {
                                this.onWait = false;
                            })
                        }], caller: this
                    }
                });
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnGo1, Laya.Event.CLICK, this, this.goTask, [0]);
            BC.addEvent(this, this.btnGo2, Laya.Event.CLICK, this, this.goTask, [1]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyReward);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.changeDay, [1]);
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.changeDay, [-1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}