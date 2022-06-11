namespace orderSystem {
    export class OrderRewardPanel extends ui.orderSystem.panel.RewardPanelUI {

        public sideClose: boolean = true;

        constructor() {
            super()
            this.addEventListeners();
        }

        public show(): void {
            clientCore.DialogMgr.ins.open(this);
        }


        setData(itemNum: number, exp: number, npcId: number, friend: number) {
            this.txtRwdNum.text = itemNum.toString();
            this.txtExp.text = exp.toString();
            this.txtFriend.text = friend.toString();
            this.imgNpc.skin = clientCore.ItemsInfo.getItemIconUrl(npcId);
            // this.box.scale(0.1, 0.1);
            // Laya.Tween.to(this.box, { scaleX: 1, scaleY: 1 }, 400, Laya.Ease.backOut);
        }

        addEventListeners() {
            // BC.addEvent(this, this, Laya.Event.CLICK, this, this.onPanelClick);
        }

        public destroy(): void {
            super.destroy();
            // if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickOrderSystemRewardPanel") {
            //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            // }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}