namespace anniversary2022 {
    export class TechoPanel extends ui.anniversary2022.panel.TechoPanelUI {
        private rewardId: number = 300128;
        public badge: number;
        constructor() {
            super();
            this.sideClose = false;
        }

        initOver() {
            clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开手账面板');
            this.btnGet.visible = this.checkBadge() && !clientCore.ItemsInfo.checkHaveItem(this.rewardId);
            this.reward.skin = clientCore.ItemsInfo.getItemIconUrl(this.rewardId);
        }

        private checkBadge(): boolean {
            let curCount = 0;
            this.badge1.gray = !(util.getBit(this.badge, 1) > 0 && (++curCount));
            this.badge2.gray = !(util.getBit(this.badge, 2) > 0 && (++curCount));
            this.badge3.gray = !(util.getBit(this.badge, 3) > 0 && (++curCount));
            this.curGot.skin = `anniversary2022/got${curCount}.png`;
            return curCount == 3;
        }

        private getReward() {
            this.btnGet.visible = false;
            net.sendAndWait(new pb.cs_second_anniversary_celebration_badge()).then(async (msg: pb.sc_second_anniversary_celebration_badge) => {
                alert.showReward(msg.item);
                await util.RedPoint.reqRedPointRefresh(29328);
                EventManager.event("CHECK_REWARD_TECHO_RED");
            })
        }

        private showTip() {
            clientCore.ToolTip.showTips(this.reward, { id: this.rewardId });
        }

        private backEvent() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.backEvent);
            BC.addEvent(this, this.reward, Laya.Event.CLICK, this, this.showTip);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}