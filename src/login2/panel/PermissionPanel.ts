namespace login2.panel {
    export class PermissionPanel extends ui.login2.panel.PermissionPanelUI {
        constructor() {
            super();
            this.panel.vScrollBarSkin = null;
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.panel.vScrollBar, Laya.Event.CHANGE, this, this.change);
            let y = 0;
            for (const o of xls.get(xls.permission).getValues()) {
                let item = new ui.login2.item.PermissionItemUI();
                item.txtName.text = o.name;
                item.txtDetail.text = o.detail;
                item.txtCompany.text = o.company;
                item.txtPermission.text = o.permission
                item.txtUrl.text = o.url;
                item.y = y;
                let height = this.getHeight(item)
                item.height = height;
                this.panel.addChild(item);
                y += height;
            }
        }

        private change() {
            let scrollBar = this.panel.vScrollBar;
            this.imgBar.y = (this.imgScoll.height - this.imgBar.height) * (scrollBar.value / scrollBar.max) + this.imgScoll.y;
        }

        private getHeight(item: Laya.Sprite) {
            let h = 150;
            for (let i = 0; i < item.numChildren; i++) {
                let txt = item.getChildAt(i);
                if (txt instanceof Laya.Label) {
                    h = Math.max(h, txt.textField.textHeight);
                }
            }
            return h;
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        destroy() {
            super.destroy();
            BC.removeEvent(this);
        }
    }
}