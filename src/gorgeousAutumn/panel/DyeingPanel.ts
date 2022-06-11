namespace gorgeousAutumn {
    export class DyeingPanel extends ui.gorgeousAutumn.panel.DyeingPanelUI {

        show() {
            this.initPicture();
            clientCore.DialogMgr.ins.open(this);
        }

        private initPicture() {
            this.picture.skin = `unpack/gorgeousAutumn/step_${GorgeousAutumnModel.instance.curStep}.png`;
            this.ani1.play(0, true);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.dyeing);
        }

        private async dyeing() {
            BC.removeEvent(this, this, Laya.Event.CLICK, this, this.dyeing);
            alert.showFWords('开始上色');
            let ani = clientCore.BoneMgr.ins.play('res/animate/activity/shangse.sk', 0, false, this);
            ani.pos(640, 666);
            ani.once(Laya.Event.COMPLETE, this, () => {
                ani.dispose();
                alert.showFWords('上色成功');
                alert.showReward(GorgeousAutumnModel.instance.dyeingReward);
                GorgeousAutumnModel.instance.curStep++;
                this.picture.skin = `unpack/gorgeousAutumn/step_${GorgeousAutumnModel.instance.curStep}.png`;
                this.ani1.stop();
                this.picture.scale(1, 1);
                BC.addEvent(this, this, Laya.Event.CLICK, this, this.closePanel);
            })
        }

        private closePanel() {
            BC.removeEvent(this, this, Laya.Event.CLICK, this, this.closePanel);
            EventManager.event('GORGEOUS_AUTUMN_DYEING_OVER');
            clientCore.DialogMgr.ins.close(this);
        }
    }
}