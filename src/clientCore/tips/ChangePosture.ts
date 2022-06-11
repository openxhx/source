namespace clientCore {
    export class ChangePosture {
        private static _tips: ui.commonUI.ChangePostureUI;
        private static curAction: number;
        static setup() {
            this._tips = new ui.commonUI.ChangePostureUI();
            this._tips.anchorY = 0.5;
            this._tips.anchorX = 1;
            net.listen(pb.sc_notify_user_action_change, this, this.onChange);
            BC.addEvent(this, this._tips.btn1, Laya.Event.CLICK, this, this.onBtnClick, [1]);
            BC.addEvent(this, this._tips.btn2, Laya.Event.CLICK, this, this.onBtnClick, [2]);
            BC.addEvent(this, this._tips.btn3, Laya.Event.CLICK, this, this.onBtnClick, [3]);
        }

        private static onBtnClick(idx: number) {
            let target = idx;
            if(this.curAction == idx) target = 0;
            net.send(new pb.cs_save_user_action({ actionId: target }));
            this.hideTips();
            alert.showFWords("切换成功~");
        }

        private static onChange(msg: pb.sc_notify_user_action_change) {
            let player: PersonUnit;
            if (msg.userId == LocalInfo.uid) {
                player = PeopleManager.getInstance().player;
            } else {
                player = PeopleManager.getInstance().getOther(msg.userId);
            }
            if (!player) return;
            player.changeRiderPosture(msg.actionId);
        }

        static hideTips() {
            this._tips.removeSelf();
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
        }

        private static onStageClick(dis: Laya.Sprite) {
            if (this._tips.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            if (dis.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))
                return;
            this.hideTips();
        }

        static showTips(dis: Laya.Sprite) {
            if (dis)
                this.onShowTips(dis);
        }

        private static onShowTips(dis: Laya.Sprite) {
            let pos = new Laya.Point(0, 0);
            dis.localToGlobal(pos, false);
            this._tips.pos(pos.x - dis.width / 2, pos.y + dis.height / 2, true);
            this.setTipInfo();
            clientCore.LayerManager.alertLayer.addChild(this._tips);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick, [dis]);
        }

        private static setTipInfo() {
            this.curAction = PeopleManager.getInstance().player.getActionId();
            for (let i = 1; i <= 3; i++) {
                this._tips["btn" + i].skin = i == this.curAction ? `commonUI/rider${i}_1.png` : `commonUI/rider${i}.png`;
            }
        }
    }
}