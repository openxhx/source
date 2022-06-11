namespace login2.panel {
    enum TAB {
        PHONE,
        NORMAL
    }
    /**
     * 注册
     */
    export class RegPanel extends ui.login2.panel.RegPanelUI {
        private _tab: TAB = TAB.PHONE;
        private _phoneReg: PhoneRegControl;
        private _normalReg: NormalRegControl;
        constructor() {
            super();
            this._phoneReg = new PhoneRegControl(this.reg_phone);
            this._normalReg = new NormalRegControl(this.reg_normal);
        }
        public show(): void {
            clientCore.DialogMgr.ins.open(this);
            this.showTab();
            this.changeAgreement()
        }

        public addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnReg, Laya.Event.CLICK, this, this.onApply);
            BC.addEvent(this, this.imgBox, Laya.Event.CLICK, this, this.changeAgreement);
            BC.addEvent(this, this.txtClause, Laya.Event.CLICK, this, this.onAgreement);
            BC.addEvent(this, this.tab_account, Laya.Event.CLICK, this, this.onTabChange, [TAB.NORMAL]);
            BC.addEvent(this, this.tab_phone, Laya.Event.CLICK, this, this.onTabChange, [TAB.PHONE]);
        }

        public removeEventListeners() {
            BC.removeEvent(this);
        }

        public hide() {
            clientCore.DialogMgr.ins.close(this);
        }

        private changeAgreement() {
            this.imgGou.visible = !this.imgGou.visible;
            this.btnReg.disabled = !this.imgGou.visible;
        }

        private onAgreement() {
            if (Laya.Render.isConchApp) {
                clientCore.NativeMgr.instance.openUrl('http://www.61.com/about/service.html');
            }
            else {
                window.open('http://www.61.com/about/service.html', '_blank');
            }
        }

        private onTabChange(tab: TAB) {
            if (this._tab != tab) {
                this._tab = tab;
                this.showTab();
            }
        }

        private showTab() {
            this.reg_phone.visible = this._tab == TAB.PHONE;
            this.reg_normal.visible = this._tab == TAB.NORMAL;
            (this.tab_phone.getChildAt(0) as Laya.Clip).index = this._tab == TAB.PHONE ? 1 : 0;
            (this.tab_account.getChildAt(0) as Laya.Clip).index = this._tab == TAB.NORMAL ? 1 : 0;
            (this.tab_phone.getChildAt(1) as Laya.Image).y = this._tab == TAB.PHONE ? 23 : 33;
            (this.tab_account.getChildAt(1) as Laya.Image).y = this._tab == TAB.NORMAL ? 23 : 33;
        }

        public onApply() {
            switch (this._tab) {
                case TAB.PHONE:
                    this._phoneReg?.startReg();
                    break;
                case TAB.NORMAL:
                    this._normalReg?.startReg();
                    break;
                default:
                    break;
            }
        }
    }
}