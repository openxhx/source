namespace clothChange {
    export class RenameImagePanel extends ui.clothChange.panel.RenameImageUI {
        private _id: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        show(posId: number) {
            this._id = posId;
            this.txtInput.text = '';
            this.txtInput.prompt = ClothChangeModel.instance.getImagesInfoById(posId).srvData.name;
            clientCore.DialogMgr.ins.open(this);
        }

        private async onSure() {
            let oriName = ClothChangeModel.instance.getImagesInfoById(this._id).srvData.name;
            let nowName = this.txtInput.text;
            if (nowName.length == 0) {
                alert.showFWords('不允许命名为空');
                return;
            }
            if (nowName == oriName) {
                alert.showFWords('名字相同');
                return;
            }
            await ClothChangeModel.instance.renameImage(this._id, nowName);
            this.onCancle();
        }

        private onCancle() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onInputChange() {
            this.txtInput.text = this.txtInput.text.slice(0, 6);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onCancle);
            BC.addEvent(this, this.txtInput, Laya.Event.INPUT, this, this.onInputChange);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}