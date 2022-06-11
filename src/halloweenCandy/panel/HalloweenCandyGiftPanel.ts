namespace halloweenCandy {
    /**
    * 万圣节讨糖主活动
    * halloweenCandy.HalloweenCandyGiftPanel
    * 2021.10.29
    */
    export class HalloweenCandyGiftPanel extends ui.halloweenCandy.panel.HalloweenCandyGiftPanelUI {
        private selfCondition: number[];
        //当前任务类型，0个人1全服
        private curType: number;
        constructor() {
            super();
            this.initData();
        }

        private initData() {
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.taskRender);
            this.list.repeatY = 5;
            let flagTime: number = util.TimeUtil.formatTimeStrToSec("2021-11-4 23:59:59");
            if (clientCore.ServerManager.curServerTime > flagTime) {
                this.time.skin = 'halloweenCandy/time5-11.png';
            }
        }

        show() {
            this.selfCondition = [3, 6, 10, 15, 21];
            this.onSwitchPanel(0);
            clientCore.DialogMgr.ins.open(this);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnOne, Laya.Event.CLICK, this, this.onSwitchPanel, [0]);
            BC.addEvent(this, this.btnAll, Laya.Event.CLICK, this, this.onSwitchPanel, [1]);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            this.selfCondition = null;
            super.destroy();
        }
        private onClose(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private taskRender(item: ui.halloweenCandy.render.HalloweenTaskRenderUI) {
            let index = item.dataSource;
            let taskInfo = HalloweenCandyModel.instance.serverInfo;
            let cur = this.curType == 0 ? taskInfo.ownTime : taskInfo.allTime;
            let condition = this.curType == 0 ? this.selfCondition[index] : (index + 1) * 1000;
            let flag = this.curType == 0 ? taskInfo.ownFlag : taskInfo.allFlag;
            item.taskInfo.text = `${this.curType == 0 ? "个人" : "全服"}讨糖次数：${cur}/${condition}`;
            item.labReward.text = "" + (index + 1);
            item.imgLight.visible = cur >= condition && util.getBit(flag, index + 1) == 0;
            item.imgGot.visible = util.getBit(flag, index + 1) == 1;
            BC.removeEvent(this, item, Laya.Event.CLICK, this, this.onReceive);
            BC.removeEvent(this, item.rewardPos, Laya.Event.CLICK, this, this.showTips);
            if (item.imgLight.visible) BC.addEvent(this, item, Laya.Event.CLICK, this, this.onReceive, [index + 1]);
            else BC.addEvent(this, item.rewardPos, Laya.Event.CLICK, this, this.showTips, [item.rewardPos]);
        }

        private showTips(item: any) {
            clientCore.ToolTip.showTips(item, { id: 9900260 });
        }

        /**判断个人还是全服面板 */
        private onSwitchPanel(flag: number) {
            if (this.curType == flag) {
                this.list.refresh();
                return;
            }
            this.curType = flag;
            this.upDataUI();
        }
        /**领取奖励 */
        private onReceive(index: number): void {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_halloween_candy_megagame_reward({ flag: this.curType + 1, index: index })).then(async (data: pb.sc_halloween_candy_megagame_reward) => {
                alert.showReward(data.item);
                util.RedPoint.reqRedPointRefresh(29307);
                if (this.curType == 0) {
                    HalloweenCandyModel.instance.serverInfo.ownFlag = util.setBit(HalloweenCandyModel.instance.serverInfo.ownFlag, index, 1);
                } else {
                    HalloweenCandyModel.instance.serverInfo.allFlag = util.setBit(HalloweenCandyModel.instance.serverInfo.allFlag, index, 1);
                }
                this.upDataUI();
                this.mouseEnabled = true;
            })
        }
        /**更新UI */
        private async upDataUI() {
            let arr = [];
            let taskInfo = HalloweenCandyModel.instance.serverInfo;
            let flag = this.curType == 0 ? taskInfo.ownFlag : taskInfo.allFlag;
            for (let i = 4; i >= 0; i--) {
                if (util.getBit(flag, i + 1) == 0) arr.unshift(i);
                else arr.push(i);
            }
            this.list.scrollTo(0);
            this.list.array = arr;
        }
    }
}