namespace anniversary2021 {
    /**
     * 眠花祈福
     */
    export class RosePanel extends ui.anniversary2021.panel.RosePanelUI implements IPanel {
        private _sign: number
        private _panelMap: IPanel[] = [];
        private _selectIndex: number;
        ruleId: number = 1138;
        init(sign: number): void {
            this._sign = sign;
            this.pos(72, 62);
            // this.boxCp.pos(560,80);
            this.addEvents();
            this.onClick(2);
        }

        show(parent: Laya.Sprite): void {
            this._panelMap[this._selectIndex - 1].show(this.boxView);
            parent.addChild(this);
        }

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        dispose(): void {
            _.forEach(this._panelMap, (element: IPanel) => { element?.dispose(); })
            this._panelMap.length = 0;
            this._panelMap = null;
            BC.removeEvent(this);
        }

        private addEvents(): void {
            for (let i: number = 1; i < 3; i++) {
                BC.addEvent(this, this['cp_' + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
        }

        private onClick(index: number): void {
            if (this._selectIndex == index) return;
            if (this._selectIndex) {
                this['cp_' + this._selectIndex].index = 1;
                this._panelMap[this._selectIndex - 1].hide();
            }
            this['cp_' + index].index = 0;
            this._selectIndex = index;
            //界面操作
            let pos: number = index - 1;
            let panel: IPanel = this._panelMap[pos];
            if (!panel) {
                switch (index) {
                    case 1:
                        panel = new Rose3Panel();
                        break;
                    case 2:
                        panel = new Rose2Panel();
                        break;
                }
                panel.init(this._sign);
                this._panelMap[pos] = panel;
            }
            this.ruleId = panel.ruleId;
            panel.show(this.boxView);
        }
    }
}