namespace offPrintComeback {
    export class VoteRewardPanel extends ui.offPrintComeback.panel.VoteRewardPanelUI {
        private rended: boolean;
        public constructor() {
            super();
            this.sideClose = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse);
        }

        public showInfo(reward: xls.pair[], des: string) {
            if (this.rended) return;
            this.list.repeatX = reward.length;
            this.list.array = reward;
            this.labDes.text = des;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let data: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: data.v1, cnt: data.v2, showName: false });
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let reward: xls.pair = this.list.array[idx];
                clientCore.ToolTip.showTips(this.list.getCell(idx), { id: reward.v1 });
            }
        }

        destroy() {
            super.destroy();
            this.list.array = null;
        }
    }
}