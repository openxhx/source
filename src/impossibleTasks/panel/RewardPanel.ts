namespace impossibleTasks {
    export class RewardPanel extends ui.impossibleTasks.panel.RewardPanelUI {
        constructor() {
            super();
            this.sideClose = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listReward.mouseHandler = new Laya.Handler(this, this.listSelect)
        }
        /**
         * @param id 奖励的唯一id
         */
        public setInfo(arr: any[]) {
            this.listReward.array = arr;
            this.listReward.repeatX = arr.length;
        }

        private listSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let reward: xls.pair = this.listReward.array[index];
                if (reward) {
                    clientCore.ToolTip.showTips(this.listReward.cells[index], { id: reward.v1 });
                };
            }
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