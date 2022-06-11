namespace saveFaeryInteract {
    /**
     * 正常结局
     * saveFaeryInteract.CommonResultPanel
     */
    export class CommonResultPanel extends ui.saveFaeryInteract.CommonResultPanelUI {
        private person: clientCore.Person;
        private monster: clientCore.Bone;
        private reward: pb.IItem[];
        private uid:number;
        init(info: { uid:number, sex: number, cloths: number[], monster: number, type: number, point: number, item: pb.IItem[] }) {
            this.uid = info.uid;
            this.sideClose = true;
            this.imgResult.skin = `saveFaeryInteract/${info.type == 4 ? "fail" : "win"}.png`;
            this.imgResult.visible = info.type > 0;
            this.labPoint.text = "+" + info.point;
            this.btnFriend.visible = info.type == 0;
            this.imgTip.skin = `saveFaeryInteract/tip${info.type}.png`;
            this.imgLimit.visible = info.type == 2;
            this.reward = info.item;
            if (info.type == 2) {
                this.monster = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(info.monster), "idle", true, this.imgRole);
                // this.monster.scaleX = -1;
                this.monster.pos(0,180);
            } else {
                this.person = new clientCore.Person(info.sex, info.cloths);
                this.person.scale(0.6, 0.6);
                this.imgRole.addChild(this.person);
            }
        }

        popupOver() {
            if (this.reward && this.reward.length > 0) {
                alert.showReward(this.reward);
            }
        }

        private addFriend() {
            clientCore.CommonSCommand.ins.addFriend(this.uid);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnFriend, Laya.Event.CLICK, this, this.addFriend);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.person?.destroy();
            this.monster?.dispose();
            this.person = this.monster = null;
        }
    }
}