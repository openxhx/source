namespace timeAmbulatory {
    export class TimeExchangePanel extends ui.timeAmbulatory.panel.TimeSecretPanelUI {
        private readonly suitId: number = 2110249;
        private reward: xls.commonCompose[];

        constructor() {
            super();
            this.suit1.visible = clientCore.LocalInfo.sex == 1;
            this.suit2.visible = clientCore.LocalInfo.sex == 2;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.addEventListeners();
        }
        onShow() {
            this.reward = _.filter(xls.get(xls.commonCompose).getValues());
            // this.reward.push(null);
            this.list.array = this.reward;
            this.visible = true;
        }

        hide() {
            this.visible = false;
        }

        private listRender(item: ui.timeAmbulatory.render.ExchangeItemUI) {
            let data: xls.commonCompose = item.dataSource;
            if (!data) {
                item.boxMain.visible = false;
                return;
            }
            item.boxMain.visible = true;
            let _index = this.reward.indexOf(data);
            let require = clientCore.LocalInfo.sex == 1 ? data.femaleRequire : data.maleRequire;
            let target = clientCore.LocalInfo.sex == 1 ? data.femaleReward[0] : data.maleReward[0];
            item.item.dataSource = target;
            this.setReward(item.item);
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [_index]);
            item.list.repeatX = require.length;
            item.list.array = require;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(target.v1);
            item.btnGet.visible = !item.imgGot.visible;
            let canget = true;
            for (let i: number = 0; i < require.length; i++) {
                if (clientCore.ItemsInfo.getItemNum(require[i].v1) < require[i].v2) {
                    canget = false;
                    break;
                }
            }
            item.btnGet.disabled = !canget;
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [_index]);
            BC.addEvent(this, item.item, Laya.Event.CLICK, this, this.showTip, [item.item]);
        }

        private setReward(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
            item.num.value = this.getNumToAbc(clientCore.ItemsInfo.getItemNum(reward.v1), reward.v2) + "/" + reward.v2;
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.commonCompose = this.reward[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.femaleRequire : config.maleRequire)[index];
                if (reward) {
                    let item = _.find(this.list.cells, (o) => { return o.dataSource == config });
                    clientCore.ToolTip.showTips((item as any).list.cells[index], { id: reward.v1 });
                    return;
                };
            }
        }

        /**领奖 */
        private async getReward(idx: number) {
            net.sendAndWait(new pb.cs_time_cloister_suit_merge({ mergeId: this.reward[idx].id })).then(async (msg: pb.sc_time_cloister_suit_merge) => {
                alert.showReward(msg.itms);
                this.list.refresh();
                await util.RedPoint.reqRedPointRefresh(22402);
                EventManager.event("TIME_REFRESH_TAB");
            })
        }

        private showTip(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            if (reward)
                clientCore.ToolTip.showTips(item, { id: reward.v1 });
        }

        private getNumToAbc(has: number, need: number) {
            let arr: string[];
            if (has >= need) {
                arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
            } else {
                arr = ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
            }
            let str = has.toString();
            let res = "";
            for (let i: number = 0; i < str.length; i++) {
                res += arr[Number(str[i])];
            }
            return res;
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        /**关闭 */
        private onClose() {
            this.visible = false;
            EventManager.event("TIME_GIFT_CLOSE_CHILD");
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            let per = (522 - 28);
            this.imgProgress.y = per * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            BC.removeEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this.removeEventListeners();
            // this.reward = this._model = this._control = null;
        }
    }
}