namespace operaSide {
    /**
     * 中秋话剧-阵营活动 选择阵营
     * operaSide.OperaSideSelectModule
     */
    export class OperaSideSelectModule extends ui.operaSide.OperaSideSelectModuleUI {
        init(d: any) {
            super.init(d);
            this.mcPanel.visible = false;
        }

        private onRoleClick(id: number) {
            this.btnClose.visible = this.box.visible = false;
            this.mcPanel.visible = true;
            this.mcPanel.imgLeft.visible = id == 2;
            this.mcPanel.imgRight.visible = id == 1;
            this.mcPanel.imgTalk.skin = `operaSide/nan${id}.png`
        }

        private onReturn() {
            this.btnClose.visible = this.box.visible = true;
            this.mcPanel.visible = false;
        }

        private onSure() {
            this.selectSide(this.mcPanel.imgLeft.visible ? 2 : 1);
        }

        private _side: number;
        private selectSide(side: number) {
            this._side = side;
            if (side == 3) {

                alert.showSmall('是否随机选择一个阵营加入（加入后在剧情结束前将不能转换阵营）', { needClose: false, callBack: { caller: this, funArr: [this.sureSelect] } });
            }
            else {
                this.sureSelect();
            }
        }

        private sureSelect() {
            EventManager.event(globalEvent.MID_OPERA_EVENT_COMPLETE, this._side);
            clientCore.OperaManager.instance.actionCurrRoute();
        }

        private onClose() {
            this.destroy();
            clientCore.ModuleManager.open('operaSide.OperaMapModule')
        }

        addEventListeners() {
            BC.addEvent(this, this.imgLeft, Laya.Event.CLICK, this, this.onRoleClick, [1]);
            BC.addEvent(this, this.imgRight, Laya.Event.CLICK, this, this.onRoleClick, [2]);
            BC.addEvent(this, this.btnRandom, Laya.Event.CLICK, this, this.selectSide, [3]);
            BC.addEvent(this, this.mcPanel.btnRtn, Laya.Event.CLICK, this, this.onReturn);
            BC.addEvent(this, this.mcPanel.bntSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, EventManager, globalEvent.MID_OPERA_PROGRESS_UPDATE, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}