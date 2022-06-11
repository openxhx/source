namespace family.panel {

    enum PanelType {
        MEMBER = 1,
        BUILD,
        EVENT
    }

    /**
     * 家族信息
     */
    export class FamlyInfoPanel extends ui.family.panel.FamilyInfoUI {

        private _currentPanel: IPanel;
        private _panelMap: Object;
        private _currType: PanelType;

        /** 离开家族弹窗*/
        private _leavePanel: panel.LeavePanel;

        constructor() { super(); }

        show(viewType: number): void {
            this._currType = -1;
            this._panelMap = {};
            clientCore.DialogMgr.ins.open(this);
            this.onTab(viewType);

        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.onTab, [PanelType.MEMBER]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.onTab, [PanelType.BUILD]);
            BC.addEvent(this, this.tab3, Laya.Event.CLICK, this, this.onTab, [PanelType.EVENT]);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            for (let key in this._panelMap) {
                let ipanel: IPanel = this._panelMap[key];
                ipanel && ipanel.destroy();
                delete this._panelMap[key];
            }
            this._panelMap = null;
            super.destroy();
            EventManager.event("close_family_module");
        }

        private onTab(type: number): void {
            if (this._currType == type) return;
            for (let i: number = 1; i <= 3; i++) {
                this["tab" + i].skin = type == i ? "family/tab1.png" : "family/tab2.png";
            }
            this._currType = type;
            this._currentPanel && this._currentPanel.dispose();
            this._currentPanel = this.createPanel(type);
            this._currentPanel.update(this.boxPanel);
        }

        private createPanel(type: number): IPanel {
            let _panel: IPanel = this._panelMap[type];
            if (!_panel) {
                switch (type) {
                    case PanelType.MEMBER:
                        _panel = new MemberPanel();
                        break;
                    case PanelType.BUILD:
                        _panel = new BuildPanel();
                        break;
                    case PanelType.EVENT:
                        _panel = new EventPanel();
                        break;
                }
                this._panelMap[type] = _panel;
            }
            return _panel;
        }
    }
}