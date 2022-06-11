namespace schoolFlower {
    /**
     * 2021.7.23
     * 系列活动
     * 校园花语、夏日侦探社
     * schoolFlower.SchoolFlowerModule
     */
    export class SchoolFlowerModule extends ui.schoolFlower.SchoolFlowerModuleUI {
        /**奖励领取标志 */
        private rewardFlag: number;
        /**活动1进度 */
        private event1Cnt: number;
        /**当前任务 */
        private curEvent: number;
        /**当前侦探等级 */
        private curLevel: number;

        private levelStr: string[] = ['d', 'c', 'b', 'a'];
        /** */
        init() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.imgHead.dataSource = clientCore.LocalInfo.headImgUrl;
            this.labNick.text = clientCore.LocalInfo.userInfo.nick;
            this.addPreLoad(net.sendAndWait(new pb.cs_school_flower_panel()).then((msg: pb.sc_school_flower_panel) => {
                this.rewardFlag = msg.idx;
                this.event1Cnt = msg.menoryNum;
            }))
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年7月23日活动', '【系列活动】夏日侦探社', '打开活动面板');
            this.setProgress();
            this.setEventInfo(1);
        }

        private setProgress() {
            this.curLevel = 0;
            for (let i: number = 1; i <= 3; i++) {
                if (util.getBit(this.rewardFlag, i) == 1) {
                    this.curLevel++;
                    this['state' + i].skin = `schoolFlower/tong_guo.png`;
                } else {
                    this['state' + i].skin = `schoolFlower/dai_ping_jie.png`;
                }
            }
            this.imgLevel.skin = `schoolFlower/${this.levelStr[this.curLevel]}.png`;
            this.imgEventUnk.visible = this.curLevel == 0;
            this.imgEventInfo.visible = this.curLevel > 0;
            this.imgEventInfo.skin = this.curLevel == 3 ? 'schoolFlower/reward.png' : 'schoolFlower/pin_tu1.png';
        }

        private updataEventInfo() {
            let isGot: boolean = util.getBit(this.rewardFlag, this.curEvent) == 1;
            let isLimit = this.curLevel < this.curEvent;
            this.btnGet.visible = !isGot;
            let flag = (isGot && !isLimit) ? 1 : 0;
            this.imgTagInfo.skin = `schoolFlower/hua_${this.curEvent}_${flag}.png`;
            this.imgTagInfo.visible = true;
            this.imgDes.skin = `schoolFlower/tip_${(isLimit && isGot) ? 0 : this.curEvent}_${flag}.png`;
        }

        private setEventInfo(idx: number) {
            if (this.curEvent == idx) return;
            if (this.curEvent) (this['tag' + this.curEvent].getChildAt(0) as Laya.Image).visible = false;
            this.curEvent = idx;
            (this['tag' + idx].getChildAt(0) as Laya.Image).visible = true;
            let isFinish: boolean;
            this.limitLevel.skin = `schoolFlower/${this.levelStr[idx]}.png`;
            if (idx == 1) {
                isFinish = this.event1Cnt >= 6;
            } else if (idx == 2) {
                isFinish = clientCore.ItemsInfo.checkHaveItem(9900209);
            } else {
                isFinish = clientCore.SuitsInfo.checkHaveSuits(2110444);
            }
            // this.imgEventInfo.skin = `schoolFlower/pin_tu${1}.png`;
            this.btnGet.disabled = !isFinish;
            this.imgTagUnk.visible = !isFinish;
            this.updataEventInfo();
        }

        /**跳转活动 */
        private jumpToEvent(idx: number) {
            switch (idx) {
                case 1:
                    clientCore.Logger.sendLog('2021年7月23日活动', '【系列活动】夏日侦探社', '点击少女回忆书按钮');
                    clientCore.ToolTip.gotoMod(287);
                    break;
                case 2:
                    clientCore.Logger.sendLog('2021年7月30日活动', '【系列活动】夏日侦探社', '点击时空侦探按钮');
                    clientCore.ToolTip.gotoMod(289);
                    break;
                case 3:
                    clientCore.Logger.sendLog('2021年8月6日活动', '【系列活动】夏日侦探社', '点击白夜理论按钮');
                    clientCore.ToolTip.gotoMod(290);
                    break;
            }
        }

        /**领取花语石 */
        private getCoin() {
            let idx = this.curEvent;
            net.sendAndWait(new pb.cs_school_flower_get_activity_coin({ flag: 1, type: idx })).then((msg: pb.sc_school_flower_get_activity_coin) => {
                alert.showReward(msg.items);
                this.rewardFlag = util.setBit(this.rewardFlag, idx, 1);
                this.setProgress();
                this.updataEventInfo();
                util.RedPoint.reqRedPointRefresh(25001);
            })
        }

        /**领取套装 */
        private getSuit() {
            if (clientCore.ItemsInfo.checkHaveItem(3500063)) {
                alert.showFWords('已领取');
                return;
            }
            if (clientCore.ItemsInfo.getItemNum(9900204) < 3) {
                alert.showFWords('集齐3块真相碎片后才可领取');
                return;
            }
            net.sendAndWait(new pb.cs_school_flower_get_activity_coin({ flag: 2, type: 0 })).then((msg: pb.sc_school_flower_get_activity_coin) => {
                alert.showReward(msg.items);
                util.RedPoint.reqRedPointRefresh(25002);
            })
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2100282);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1136);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGetAll, Laya.Event.CLICK, this, this.getSuit);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this['tag' + i], Laya.Event.CLICK, this, this.setEventInfo, [i]);
                BC.addEvent(this, this['event' + i], Laya.Event.CLICK, this, this.jumpToEvent, [i]);
            }
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getCoin);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}