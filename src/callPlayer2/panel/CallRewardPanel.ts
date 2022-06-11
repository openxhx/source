namespace callPlayer2 {
    export class CallRewardPanel extends ui.callPlayer2.panel.CallRewardPanelUI {
        private _rewardInfoArr: xls.pair[] = [{ v1: 3500024, v2: 1 }, { v1: 2500031, v2: 1 }];
        constructor() {
            super();
            this.sideClose = true;
            this.listReward.selectEnable = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listReward.selectHandler = new Laya.Handler(this, this.listSelect);
        }
        showInfo() {
            this.listReward.array = this._rewardInfoArr;
            this.listReward.repeatX = this._rewardInfoArr.length;
            this.imgBg.width = 480;
        }

        private listSelect(index: number) {
            if (index == -1) return;
            this.listReward.selectedIndex = -1;
            let reward: xls.pair = this.listReward.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.listReward.cells[index], { id: reward.v1 });
                return;
            };
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
        }

        destroy() {
            super.destroy();
        }
    }
}