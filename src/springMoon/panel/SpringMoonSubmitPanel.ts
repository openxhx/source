namespace springMoon {
    export class SubmitPanel extends ui.springMoon.panel.SubmitPanelUI {
        public submitCnt: number;
        public isReward: boolean;
        constructor() {
            super();
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
        }
        show(): void {
            this.initView();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(): void {
            super.destroy();
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private initView(): void {
            this.list.array = clientCore.GlobalConfig.config.materialsRange2;
            this.list.selectedIndex = 0;
            clientCore.GlobalConfig.setRewardUI(this.mcReward, { id: 9900138, cnt: 30, showName: false });
            this.updateView();
        }
        private listRender(item: ui.hiddenElf.item.MaterialItemUI, index: number): void {
            let itemId: number = item.dataSource;
            let cnt = clientCore.ItemsInfo.getItemNum(itemId);
            item.imgSel.visible = index == this.list.selectedIndex;
            clientCore.GlobalConfig.setRewardUI(item.mcReward, { id: itemId, cnt: cnt, showName: false });
        }
        private updateView(): void {
            let max: number = clientCore.GlobalConfig.config.materialsNum2;
            this.todayTxt.changeText(`今日已提交:${this.submitCnt + "/" + max}`);
            this.btnSubmit.disabled = this.submitCnt == max;
            this.btnReward.disabled = this.submitCnt < max || this.isReward;
            this.imgGot.visible = this.isReward;
        }
        private onSubmit(): void {
            let itemId: number = this.list.selectedItem;
            let itemCnt: number = Math.min(Math.min(clientCore.ItemsInfo.getItemNum(itemId), 20), clientCore.GlobalConfig.config.materialsNum2 - this.submitCnt);
            if (itemCnt <= 0) {
                alert.showFWords('所需道具数量不足，无法提交~');
                return;
            }
            this.submitMaterial(itemId, itemCnt);
        }
        /** 领取提交材料奖励*/
        private onReward(): void {
            net.sendAndWait(new pb.cs_mid_feastial_sumbit_item_get_reward()).then((msg: pb.sc_mid_feastial_sumbit_item_get_reward) => {
                alert.showReward(msg.itms);
                this.isReward = true;
                this.updateView();
                this.hide();
            });
        }
        /**
         * 提交材料
         * @param handler 
         */
        private submitMaterial(id: number, cnt: number): void {
            net.sendAndWait(new pb.cs_mid_feastial_sumbit_item({ itemId: id, itemCnt: cnt })).then(() => {
                this.submitCnt += cnt;
                this.updateView();
                this.list.refresh();
            });
        }
    }
}