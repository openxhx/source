namespace ranch {
    /**
     * 牧场体验营
     * 2021.5.14
     * ranch.RanchModule
     */
    export class RanchModule extends ui.ranch.RanchModuleUI {
        /**每日免费领取 */
        private free_reward_flag: number;
        /**任务详情面板 */
        private taskPanel: RanchTaskPanel;
        /**游戏面板 */
        private gamePanel: RanchGamePanel;
        /**游戏次数 */
        private gameTimes: number;
        init() {
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.boxTime.visible = false;
            this.taskPanel = new RanchTaskPanel();
            this.gamePanel = new RanchGamePanel();
            clientCore.UIManager.setMoneyIds([9900160, clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(net.sendAndWait(new pb.cs_pasture_experience_panel()).then((msg: pb.sc_pasture_experience_panel) => {
                this.free_reward_flag = msg.flag;
                this.gameTimes = msg.gameTimes;
            }))
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年5月14日活动', '【主活动】牧场体验营', '打开主活动面板');
            this.gamePanel.setGameTimes(this.gameTimes);
            this.boxTime.visible = this.free_reward_flag == 1 && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-5-27 00:00:00");
            this.imgGot.visible = this.free_reward_flag == 1;
            this.imgReward.visible = this.free_reward_flag == 0;
            this.setOrderInfo();
            Laya.timer.loop(1000, this, this.onTime);
        }

        private setOrderInfo() {
            for (let i: number = 1; i <= 8; i++) {
                let cfg = xls.get(xls.taskData).get(16000 + i);
                this["order" + i].imgHead.skin = `ranch/${cfg.npc_icon}.png`;
                this.freshOrder(i + 16000);
            }
        }

        private onTime() {
            let nextGap = 86400 - ((clientCore.ServerManager.curServerTime + 28800) % 86400);
            this.labTime.text = util.TimeUtil.formatSecToStr(nextGap, true) + "后可领取";
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110369);
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1157);
        }

        /**领取每日奖励 */
        private getFreeReward() {
            if (this.free_reward_flag == 1) return;
            this.free_reward_flag = 1;
            clientCore.Logger.sendLog('2021年5月14日活动', '【主活动】牧场体验营', '点击牛奶棚按钮');
            net.sendAndWait(new pb.cs_pasture_experience_get_daily_mike()).then((msg: pb.sc_pasture_experience_get_daily_mike) => {
                alert.showReward(msg.items);
                this.boxTime.visible = clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-5-27 00:00:00");
                this.imgGot.visible = true;
                this.imgReward.visible = false;
                for (let i: number = 1; i <= 8; i++) {
                    this.freshOrder(i + 16000);
                }
            }).catch(() => {
                this.free_reward_flag = 0;
            })
        }

        /**打开游戏面板 */
        private openGamePanel() {
            clientCore.Logger.sendLog('2021年5月14日活动', '【主活动】牧场体验营', '点击奶牛工坊按钮');
            clientCore.Logger.sendLog('2021年5月14日活动', '【游戏】奶牛工坊', '打开游戏准备面板');
            clientCore.DialogMgr.ins.open(this.gamePanel);
        }

        /**打开订单详情 */
        private openOrderInfo(id: number, e: Laya.Event) {
            let serverInfo = clientCore.TaskManager.getTaskById(16000 + id);
            if (serverInfo.state == 3) return;
            if (e.type == Laya.Event.CLICK) {
                if (e.target.mouseY < 115) {
                    let cfg = xls.get(xls.taskData).get(16000 + id);
                    this.taskPanel.show(cfg);
                } else {
                    this.finishOrder(id);
                }
            }
        }
        private _waite: boolean;
        /**完成订单 */
        private finishOrder(id: number) {
            let cfg = xls.get(xls.taskData).get(16000 + id);
            let serverInfo = clientCore.TaskManager.getTaskById(cfg.task_id);
            let have = clientCore.ItemsInfo.getItemNum(cfg.coinCondition[0].v1);
            if (have < cfg.coinCondition[0].v2 || serverInfo.state != 2) {
                //打开任务详情
                this.taskPanel.show(cfg);
            } else {
                if (this._waite) return;
                this._waite = true;
                net.sendAndWait(new pb.cs_pasture_experience_submit_task({ id: cfg.task_id, type: 1 })).then((msg: pb.sc_pasture_experience_submit_task) => {
                    alert.showReward(msg.items);
                    this.freshOrder(id + 16000);
                    util.RedPoint.reqRedPointRefresh(26401);
                    this._waite = false;
                }).catch(() => {
                    this._waite = false;
                })
            }
        }

        /**刷新订单状态 */
        private freshOrder(id: number) {
            let cfg = xls.get(xls.taskData).get(id);
            let serverInfo = clientCore.TaskManager.getTaskById(cfg.task_id);
            let have = clientCore.ItemsInfo.getItemNum(cfg.coinCondition[0].v1);
            let idx = id - 16000;
            this["order" + idx].imgOrder.visible = serverInfo.state != 2;
            this["order" + idx].imgMilk.visible = serverInfo.state == 2;
            this["order" + idx].btnSubmit.visible = serverInfo.state == 2;
            this["order" + idx].btnSubmit.disabled = have < cfg.coinCondition[0].v2;
            this["order" + idx].imgGot.visible = serverInfo.state == 3;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getFreeReward);
            BC.addEvent(this, this.imgGet, Laya.Event.CLICK, this, this.getFreeReward);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.openGamePanel);
            BC.addEvent(this, this.imgGame, Laya.Event.CLICK, this, this.openGamePanel);
            for (let i: number = 1; i <= 8; i++) {
                BC.addEvent(this, this["order" + i], Laya.Event.CLICK, this, this.openOrderInfo, [i]);
            }
            EventManager.on("RANCH_ORDER_FRESH", this, this.freshOrder);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("RANCH_ORDER_FRESH", this, this.freshOrder);
        }

        destroy() {
            this.taskPanel.destroy();
            this.taskPanel = null;
            this.gamePanel.destroy();
            this.gamePanel = null;
            clientCore.UIManager.releaseCoinBox();
            Laya.timer.clear(this, this.onTime);
            super.destroy();
        }
    }
}