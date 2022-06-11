namespace moonCake {
    export class GlobalRewardPanel extends ui.moonCake.panel.GlobalRewardPanelUI {
        constructor(flag: number) {
            super();
            this.btnGet.disabled = flag != 1;
            this.sideClose = true;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
            this.setUI();
        }

        public show() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '打开全服奖励面板');
            clientCore.DialogMgr.ins.open(this);
        }

        private setUI() {
            let reward = clientCore.GlobalConfig.config.mooncakeAward;
            this.list.repeatX = reward.length;
            this.list.array = reward;
        }

        private listSelect(index: number) {
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
                return;
            };
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
        }

        private waitng: boolean = false;
        private getReward() {
            if (this.waitng) return;
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '点击领取全服奖励');
            this.waitng = true;
            net.sendAndWait(new pb.cs_get_moon_cake_reward()).then((msg: pb.sc_get_moon_cake_reward) => {
                alert.showReward(msg.items);
                this.btnGet.disabled = true;
                this.waitng = false;
            }).catch(() => {
                this.waitng = false;
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
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