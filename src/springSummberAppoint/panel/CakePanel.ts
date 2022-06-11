
namespace springSummberAppoint{
    /**
     * 春日甜饼
     */
    export class CakePanel extends ui.springSummberAppoint.panel.CakePanelUI implements IPanel{

        private _panels: IPanel[] = [];
        private _tab: number;
        private _sign: number;

        ruleId: number;

        constructor(){ 
            super(); 
            this.addEvents();
        }

        show(sign:number,parent: Laya.Sprite): void{
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this._tab = -1;
            this._sign = sign;
            this.onTab(1);
            parent.addChild(this);
        }
        hide(): void{
            this._panels[this._tab]?.hide();
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void{
            _.forEach(this._panels,(element: IPanel)=>{ element?.dispose(); })
            this._panels.length = 0;
            this._panels = null;
            this.removeEvents();
        }

        private addEvents(): void{
            for(let i:number=1; i<3; i++){
                BC.addEvent(this,this[`cp_${i}`],Laya.Event.CLICK,this,this.onTab,[i]);
            }
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onTab(index: number): void{
            if(this._tab == index)return;
            if (this._tab != -1) this._panels[this._tab].hide();
            let panel: IPanel;
            switch(index){
                case 1:
                    clientCore.Logger.sendLog('2021年4月23日活动', '【付费】春夏之约第二期', '打开圣诗白鸽面板');
                    panel = this.getPanel(index,CakePanel2);
                    // panel = this.getPanel(index,CakePanel1);
                    break;
                case 2:
                    // clientCore.Logger.sendLog('2021年4月23日活动', '【付费】春夏之约第二期', '打开圣诗白鸽面板');
                    // panel = this.getPanel(index,CakePanel2);
                    break;
            }
            this.ruleId = panel.ruleId;
            panel.show(this._sign,this.spPanel);
            this._tab = index;
            for(let i:number=1; i<3; i++){
                this[`cp_${i}`].index = i == index ? 1 : 0;
            }
        }

        /**
         * 得到对应面板
         * @param index 
         * @param cls 
         */
        private getPanel(index: number, cls: any): IPanel {
            this._panels[index] = this._panels[index] || new cls();
            return this._panels[index];
        }
    }
}