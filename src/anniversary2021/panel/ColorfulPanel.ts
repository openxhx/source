namespace anniversary2021 {
    /**
     * 缤纷色彩
     */
    export class ColorfulPanel extends ui.anniversary2021.panel.ColorfulPanelUI implements IPanel {
        private _sign: number
        private _panelMap: IPanel[] = [];
        private _selectIndex: number;
        ruleId: number = 1137;
        init(sign: number): void {
            this._sign = sign;
            this.pos(153, -48);
            this.addEvents();
            this.onClick(2);
        }

        show(parent: Laya.Sprite): void {
            clientCore.Logger.sendLog('2021年3月19日活动', '【付费】小花仙周年庆典', '打开缤纷色彩面板');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
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
                        panel = new Colorful3Panel();
                        break;
                    case 2:
                        panel = new Colorful1Panel();
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