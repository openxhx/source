namespace luckyBamboo {
    export class LuckyBambooRewardPanel extends ui.luckyBamboo.panel.LuckyBambooRewardPanelUI {
        constructor() {
            super();
            this.init();
        }

        init() {
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.sideClose = true;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
            this.list.repeatX = 3;
            let reward = [{ id: 1550001, cnt: 30 }, { id: 9900006, cnt: 15 }, { id: 1900005, cnt: 1 }];
            this.list.array = reward;
        }

        private listSelect(index: number) {
            if (index == -1) return;
            let reward: { id: number, cnt: number } = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.id });
                return;
            };
            this.list.selectedIndex = -1;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: { id: number, cnt: number } = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.id, cnt: reward.cnt, showName: false });
        }

        private openRule() {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event("LUCKYBAMBOO_RULE_OPEN");
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110200);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.openRule);
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