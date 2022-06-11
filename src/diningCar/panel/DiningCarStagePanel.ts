namespace diningCar {
    export class DiningCarStagePanel extends ui.diningCar.panel.DiningCarStagesUI {
        private curStage: number;
        constructor(all: xls.commonAward[]) {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.array = all;
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
        }

        public show(cur: number) {
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开经营目标总览弹窗');
            this.curStage = cur;
            this.list.refresh();
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.diningCar.render.DiningCarStageItemUI) {
            let config: xls.commonAward = item.dataSource;
            item.imgGou.visible = config.id <= this.curStage;
            item.imgCur.visible = config.id == this.curStage + 1;
            item.labCondition.text = "总营业额达到：" + config.num.v2;
            item.list.renderHandler?.recover();
            item.list.renderHandler = new Laya.Handler(this, (rewarditem: ui.commonUI.item.RewardItemUI) => {
                let reward: xls.pair = rewarditem.dataSource;
                clientCore.GlobalConfig.setRewardUI(rewarditem, { id: reward.v1, cnt: reward.v2, showName: false });
            });
            item.list.selectEnable = true;
            item.list.selectHandler?.recover();
            item.list.selectHandler = new Laya.Handler(this, (index: number) => {
                if (index == -1) return;
                let reward: xls.pair = item.list.array[index];
                if (reward) {
                    clientCore.ToolTip.showTips(item.list.cells[index], { id: reward.v1 });
                };
                item.list.selectedIndex = -1;
            })
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleAward : config.maleAward;
            item.list.array = reward;
            item.list.repeatX = reward.length;
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110266);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}