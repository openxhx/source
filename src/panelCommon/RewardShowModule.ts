namespace panelCommon {
    /**
     * panelCommon.RewardShowModule
     * 奖励包包含东西
     * 
     */
    export class RewardShowModule extends ui.panelCommon.RewardShowModuleUI {
        private _rewardInfoArr: clientCore.GoodsInfo[];
        constructor() {
            super();
            this.sideClose = true;
            this.listReward.selectEnable = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listReward.selectHandler = new Laya.Handler(this, this.listSelect);
        }
        init(d: any) {
            this._rewardInfoArr = d.reward;
            this.txtWord.text = d.info ? d.info : "";
            this.listReward.array = this._rewardInfoArr;
            this.listReward.repeatX = this._rewardInfoArr.length;
            if (this._rewardInfoArr.length > 3) {
                this.width = 480 + (this._rewardInfoArr.length - 3) * 135;
            }
        }

        private listSelect(index: number) {
            let reward: clientCore.GoodsInfo = this.listReward.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.listReward.cells[index], { id: reward.itemID });
                return;
            };
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: clientCore.GoodsInfo = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.itemID, cnt: reward.itemNum, showName: true });
        }

        destroy() {
            super.destroy();
        }
    }
}