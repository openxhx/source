namespace saveFaeryInteract {
    /**
     * 大成功
     * saveFaeryInteract.SpecialSuccessPanel
     */
    export class SpecialSuccessPanel extends ui.saveFaeryInteract.SpecialWinPanelUI {
        // private person: clientCore.Person;
        private npc: clientCore.Bone;
        private reward: pb.IItem[];
        init(info: { point: number, item: pb.IItem[] }) {
            this.sideClose = true;
            this.labPoint.text = "+" + info.point;
            this.reward = info.item;
            this.npc = clientCore.BoneMgr.ins.play(pathConfig.getRoleAniUI(1410006), 0, true, this.imgRole);
            this.npc.scaleX = this.npc.scaleY = 0.6;
            this.npc.pos(200,250);
            this.labItem.text = "+"+info.item[0].cnt;
        }

        popupOver() {
            if (this.reward && this.reward.length > 0) {
                alert.showReward(this.reward);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.npc?.dispose();
            this.npc = null;
        }
    }
}