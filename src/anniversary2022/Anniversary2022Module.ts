namespace anniversary2022 {
    /**
     * 二周年 主活动
     * anniversary2022.Anniversary2022Module
     */
    export class Anniversary2022Module extends ui.anniversary2022.Anniversary2022ModuleUI {
        private weekFlag: number;//本周获得引导奖励标记
        private showTimes: number;//今日评分游戏次数
        private point: number;//当前积分
        private badge: number;//徽章情况
        private rewardId = 2500070;//头像框

        private rewardPanel: RewardPanel;
        private techoPanel: TechoPanel;
        init() {
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(xls.load(xls.collocationActivity));
        }

        private getEventInfo() {
            return net.sendAndWait(new pb.cs_second_anniversary_celebration_info()).then((msg: pb.sc_second_anniversary_celebration_info) => {
                this.weekFlag = msg.weekFlag;
                this.showTimes = msg.showTime;
                this.point = msg.integral;
                this.badge = msg.badge;
            })
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开周年庆活动面板');
            this.labPoint.text = " " + this.point + " ";
            this.imgOtherGet.visible = clientCore.UserHeadManager.instance.getOneInfoById(this.rewardId).have;
            this.checkRedPoint();
        }

        popupOver() {
            if (this.weekFlag == 0) {//还未获得引导奖励
                clientCore.DialogMgr.ins.open(new GuidePanel());
            }
        }

        private checkRedPoint() {
            this.aniReward.visible = util.RedPoint.checkShow([29327]);
            this.aniTecho.visible = util.RedPoint.checkShow([29328]);
            this.checkCanGet();
        }

        /**找回庆典装饰 */
        private findDecorate() {
            clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开寻回庆典装饰的面板');
            this.destroy();
            clientCore.ModuleManager.open("runningTurkey.RunningTurkeyModule", this.point);
        }

        /**吃蛋糕游戏 */
        private eatCake() {
            let time = new Date(clientCore.ServerManager.curServerTime * 1000);
            let hour = time.getHours();
            let min = time.getMinutes();
            if (hour == 20 && min >= 15 && min < 45) {
                clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开蛋糕PVP开始面板');
                this.destroy();
                clientCore.ModuleManager.open("catchBattle.CatchBattleModule");
            } else {
                alert.showFWords("不在时间内");
            }

        }

        /**打扮拍照 */
        private dressUp() {
            if (this.showTimes >= 10) {
                alert.showFWords("今日次数已完成~");
                return;
            }
            clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开立牌拍照面板');
            this.destroy();
            clientCore.ModuleManager.open("anniversaryShow.AnniversaryShowModule", { type: "level", data: this.showTimes });
        }

        /**雪露餐车 */
        private goPark() {
            // clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开立牌拍照面板');
            this.destroy();
            clientCore.ToolTip.gotoMod(298);
        }

        /**前往订单 */
        private goOrder() {
            // clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开立牌拍照面板');
            this.destroy();
            clientCore.ToolTip.gotoMod(13);
        }

        /**兑换奖励 */
        private getReward() {
            if (!this.rewardPanel) this.rewardPanel = new RewardPanel();
            this.rewardPanel.scoreNum = this.point;
            if (!this.imgOtherGet.visible && !this.imgCanGet.visible) this.rewardPanel.once(Laya.Event.CLOSE, this, this.checkCanGet);
            clientCore.DialogMgr.ins.open(this.rewardPanel);
        }

        /**查看手账 */
        private checkTecho() {
            if (!this.techoPanel) this.techoPanel = new TechoPanel();
            this.techoPanel.badge = this.badge;
            clientCore.DialogMgr.ins.open(this.techoPanel);
        }

        private showRule() {
            alert.showRuleByID(1238);
        }

        private showTip() {
            clientCore.ToolTip.showTips(this.otherReward, { id: this.rewardId });
        }

        private onRewardClick() {
            if (this.imgCanGet.visible) {
                net.sendAndWait(new pb.cs_second_anniversary_celebration_head()).then((msg: pb.sc_second_anniversary_celebration_head) => {
                    alert.showReward(msg.item);
                    this.imgOtherGet.visible = true;
                    clientCore.UserHeadManager.instance.refreshAllHeadInfo();
                })
            } else {
                this.showTip();
            }
        }

        private checkCanGet() {
            // if (this.imgCanGet.visible || this.imgOtherGet.visible) return;
            this.imgCanGet.visible = !this.imgOtherGet.visible && clientCore.ItemsInfo.checkHaveItem(2110645) || clientCore.ItemsInfo.checkHaveItem(2110646) || clientCore.ItemsInfo.checkHaveItem(2110634) || clientCore.ItemsInfo.checkHaveItem(2110621) || clientCore.ItemsInfo.checkHaveItem(2110635) || clientCore.ItemsInfo.checkHaveItem(2110641);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnFind, Laya.Event.CLICK, this, this.goOrder);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.eatCake);
            BC.addEvent(this, this.btnDressUp, Laya.Event.CLICK, this, this.goPark);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnTecho, Laya.Event.CLICK, this, this.checkTecho);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.otherReward, Laya.Event.CLICK, this, this.onRewardClick);
            EventManager.on("OPEN_TECHO_PANEL", this, this.checkTecho);
            EventManager.on("CHECK_REWARD_TECHO_RED", this, this.checkRedPoint);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("OPEN_TECHO_PANEL", this, this.checkTecho);
            EventManager.off("CHECK_REWARD_TECHO_RED", this, this.checkRedPoint);
        }

        destroy() {
            super.destroy();

        }
    }
}