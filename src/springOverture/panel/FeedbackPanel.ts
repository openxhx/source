namespace springOverture {
    /**
     * 感恩回馈
     */
    export class FeedbackPanel extends ui.springOverture.panel.FeedbackPanelUI {
        private readonly suitId: number = 2110580;
        private reward: xls.rechargeActivity[];

        private _engryCnt: number;
        constructor() {
            super();
            this.imgSuit.skin = `unpack/springOverture/${this.suitId}_${clientCore.LocalInfo.sex}.png`;
            this.imgHand.skin = `springOverture/FeedbackPanel/${clientCore.LocalInfo.sex}.png`;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.addEventListeners();
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年2月25日活动', '【付费】春日序曲', '打开感恩回馈面板');
            EventManager.event(CHANGE_TIME, "");
            this.reward = _.filter(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 9 });
            this.setUI();
            this.visible = true;
            box.addChild(this);
        }

        hide() {
            this.removeSelf();
        }

        private setUI() {
            this._engryCnt = SpringOvertureModel.instance.costAllCnt;
            this.labCur.text = " 已消耗:" + this._engryCnt;
            this.reward = this.bubbleSort(this.reward);
            this.list.array = this.reward;
        }

        private bubbleSort(arr: Array<xls.rechargeActivity>) {
            let temp: xls.rechargeActivity;
            let tag = true
            for (let j = 0; tag === true; j++) {
                tag = false;
                for (let i = 0; i < arr.length - 1; i++) {
                    let reward = clientCore.LocalInfo.sex == 1 ? arr[i].rewardFamale[0].v1 : arr[i].rewardMale[0].v1;
                    let reward1 = clientCore.LocalInfo.sex == 1 ? arr[i + 1].rewardFamale[0].v1 : arr[i + 1].rewardMale[0].v1;
                    if (clientCore.ItemsInfo.getItemNum(reward) > clientCore.ItemsInfo.getItemNum(reward1)) {
                        temp = arr[i];
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            return arr;
        }
        private listRender(item: ui.springOverture.render.FeedbackItemUI) {
            let data: xls.rechargeActivity = item.dataSource;
            let _index = this.reward.indexOf(data);
            let reward = clientCore.LocalInfo.sex == 1 ? data.rewardFamale : data.rewardMale;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [_index]);
            item.list.repeatX = reward.length;
            item.list.array = reward;
            item.boxNeed.visible = data.cost > this._engryCnt;
            item.imgGot.visible = util.getBit(SpringOvertureModel.instance.feedbackRewardFlag, data.packageID) == 1;
            item.btnGet.visible = data.cost <= this._engryCnt && !item.imgGot.visible;
            if (item.boxNeed.visible) item.labNeed.text = "" + (data.cost - this._engryCnt);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [_index]);
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.rechargeActivity = this.reward[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale)[index];
                if (reward) {
                    let item = _.find(this.list.cells, (o) => { return o.dataSource == config });
                    clientCore.ToolTip.showTips((item as any).list.cells[index], { id: reward.v1 });
                    return;
                };
            }
        }

        private setReward(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        /**领取赠品 */
        private getReward(idx: number) {
            net.sendAndWait(new pb.cs_common_feedback_get_reward({ idx: this.reward[idx].packageID, activityId: SpringOvertureModel.instance.activityId })).then(async (msg: pb.sc_common_feedback_get_reward) => {
                alert.showReward(msg.items);
                SpringOvertureModel.instance.feedbackRewardFlag = util.setBit(SpringOvertureModel.instance.feedbackRewardFlag, this.reward[idx].packageID, 1);
                this.reward = this.bubbleSort(this.reward);
                this.list.refresh();
                this.list.selectedIndex = -1;
            })
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            let per = 500;
            this.itemScroll.y = per * scroll.value / scroll.max;
        }

        /**帮助说明 */
        private showRule() {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-2-4 00:00:00")) {
                alert.showRuleByID(1231);
            } else {
                alert.showRuleByID(1235);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            BC.removeEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this.removeEventListeners();
            this.reward = null;
        }
    }
}