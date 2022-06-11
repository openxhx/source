namespace dungeonsSearch {
    export class DungeonsSearchRewardPanel extends ui.dungeonsSearch.panel.DungeonsRewardPanelUI {
        private _rewardInfoArr: xls.pair[];
        constructor() {
            super();
            this.sideClose = true;
            this.listReward.selectEnable = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listReward.selectHandler = new Laya.Handler(this, this.listSelect);
        }
        showInfo(d: xls.pair[]) {
            this._rewardInfoArr = d;
            this.listReward.array = this._rewardInfoArr;
            this.listReward.repeatX = this._rewardInfoArr.length;
            if (d.length <= 3) {
                this.imgBg.width = 480;
            } else {
                this.imgBg.width = 480 + (d.length - 3) * 110;
            }
        }

        private listSelect(index: number) {
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