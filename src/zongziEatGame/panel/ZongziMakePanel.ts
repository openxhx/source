namespace zongziEatGame {
    export class ZongziMakePanel extends ui.zongziEatGame.panel.ZongziMakePanelUI {
        private result: number;
        constructor(result: number) {
            super();
            this.sideClose = false;
            this.result = result;
        }

        popupOver() {
            this.playAni();
        }

        private playAni() {
            this.aniRole.once(Laya.Event.STOPPED, this, () => {
                clientCore.DialogMgr.ins.close(this);
            })
            this.aniRole.play("open" + this.result, false, true);
        }
    }
}