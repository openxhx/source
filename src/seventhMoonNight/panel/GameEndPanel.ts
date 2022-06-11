namespace seventhMoonNight {
    /**
     * 游戏结算面板
     */
    export class GameEndPanel extends ui.seventhMoonNight.panel.GameEndPanelUI {
        private rewardId1: number;
        private rewardId2: number;
        constructor() {
            super();
            this.sideClose = false;
        }
        
        initUI(msg: pb.sc_qixi_lover_night_hua_reward) {
            this.boxReward.visible = false;
            this.boxEnd.visible = true;
            this.rewardId1 = msg.fItem[0].id;
            this.reward1.skin = clientCore.ItemsInfo.getItemIconUrl(msg.fItem[0].id);
            this.cnt1.value = "" + msg.fItem[0].cnt;
            this.rewardId2 = msg.item[0].id;
            this.reward2.skin = clientCore.ItemsInfo.getItemIconUrl(msg.item[0].id);
            this.cnt2.value = "" + msg.item[0].cnt;
            if (msg.poems > 0) {
                this.imgPoem.skin = `seventhMoonNight/s_${msg.poems}.png`;
            } else {
                this.imgPoem.skin = '';
            }
        }

        private openReward() {
            this.boxReward.visible = true;
            this.sideClose = true;
        }

        private closeSelf() {
            clientCore.DialogMgr.ins.close(this);
        }

        private showRewardTip(idx: number) {
            let id = idx == 1 ? this.rewardId1 : this.rewardId2;
            clientCore.ToolTip.showTips(this['reward' + idx], { id: id });
        }

        addEventListeners() {
            BC.addEvent(this, this.imgHua1, Laya.Event.CLICK, this, this.openReward);
            BC.addEvent(this, this.imgHua2, Laya.Event.CLICK, this, this.openReward);
            BC.addEvent(this, this.imgHua3, Laya.Event.CLICK, this, this.openReward);
            BC.addEvent(this, this.imgClose, Laya.Event.CLICK, this, this.closeSelf);
            BC.addEvent(this, this.reward1, Laya.Event.CLICK, this, this.showRewardTip, [1]);
            BC.addEvent(this, this.reward2, Laya.Event.CLICK, this, this.showRewardTip, [2]);
        }

        destroy(){
            BC.removeEvent(this);
            super.destroy();
        }
    }

}