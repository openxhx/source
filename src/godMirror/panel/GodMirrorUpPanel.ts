namespace godMirror {

    /**
     * 我要上镜面板
     */
    export class GodMirrorUpPanel extends ui.godMirror.panel.GodMirrorUpPanelUI {
        private _person: clientCore.Person;

        open() {
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.5, 0.5);
            this.spCon.addChild(this._person);
            clientCore.DialogMgr.ins.open(this);
        }

        private onUp() {
            GodMirrorModel.uploadView();
            this.onClose();
        }

        private onChange() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击更换形象按钮');
            this.onClose();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('clothChange.ClothChangeModule', null, { openWhenClose: 'godMirror.GodMirrorModule', openData: true })
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.onUp);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.onChange);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._person?.destroy();
            this._person = null;
        }
    }
}