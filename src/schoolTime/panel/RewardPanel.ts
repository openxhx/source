namespace schoolTime {
    export class RewardPanel extends ui.schoolTime.panel.RewardPanelUI {
        private reward: number[];
        constructor() {
            super();
            this.sideClose = true;
            this.initView();
        }

        private initView() {
            this.reward = clientCore.LocalInfo.sex == 1 ? [133829, 133830, 133833, 133834, 133832, 133831] : [133837, 133838, 133841, 133842, 133840, 133839];
            for (let i: number = 1; i <= 6; i++) {
                if (i < 6) this["icon" + i].skin = clientCore.ItemsInfo.getItemIconUrl(this.reward[i - 1]);
                else {
                    this.icon6_1.skin = clientCore.ItemsInfo.getItemIconUrl(this.reward[5]);
                    this.icon6_2.skin = clientCore.ItemsInfo.getItemIconUrl(1000122);
                }
            }
        }

        popupOver() {
            if (!this.reward) this.reward = clientCore.LocalInfo.sex == 1 ? [133829, 133830, 133833, 133834, 133832, 133831] : [133837, 133838, 133841, 133842, 133840, 133839];
            for (let i: number = 1; i <= 6; i++) {
                this["imgGot" + i].visible = clientCore.ItemsInfo.checkHaveItem(this.reward[i - 1]);
            }
        }

        private showTip(idx: number) {
            if (idx == 6) {
                clientCore.ToolTip.showContentTips(this["icon" + idx], 0, [{ v1: this.reward[5], v2: 1 }, { v1: 1000122, v2: 1 }]);
            } else {
                clientCore.ToolTip.showTips(this["icon" + idx], { id: this.reward[idx - 1] });
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            for (let i: number = 1; i <= 6; i++) {
                BC.addEvent(this, this["icon" + i], Laya.Event.CLICK, this, this.showTip, [i]);
            }
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.reward = null;
            super.destroy();
        }
    }
}