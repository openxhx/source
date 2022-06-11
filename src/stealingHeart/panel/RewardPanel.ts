namespace stealingHeart {
    export class RewardPanel extends ui.stealingHeart.panel.RewardPanelUI {
        constructor() {
            super();
            this.sideClose = true;
            this.listReward.selectEnable = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listReward.selectHandler = new Laya.Handler(this, this.listSelect)
        }
        /**
         * @param id 奖励的唯一id
         */
        public setInfo(award: Array<any>) {
            this.listReward.array = award;
            this.listReward.repeatX = award.length;


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