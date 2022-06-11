namespace oceanicSong{
    /**
     * 群星闪耀
     */
    export class FlashComPanel extends ui.oceanicSong.panel.StarComPanelUI implements IPanel{
        private _panels: IPanel[] = [];
        private _tab: number;
        private _sign: number;
        ruleId: number;
        constructor(){ super(); }
        init(sign: number): void{
            this._sign = sign;
            this.addEvents();
        }
        show(parent: Laya.Sprite): void{
            clientCore.UIManager.setMoneyIds([9900003]);//代币
            clientCore.UIManager.showCoinBox();
            this.onClick(1);
            parent.addChild(this);
        }
        hide(): void{
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void{
            this.removeEvents();
            _.forEach(this._panels, (element: IPanel)=>{ element?.dispose(); });
            this._panels.length = 0;
            this._panels = null;
        }
        private addEvents(): void{
            for(let i:number=0; i<2; i++){
                BC.addEvent(this, this[`cp_${i}`], Laya.Event.CLICK, this, this.onClick, [i]);
            }
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }
        private onClick(index: number): void{
            this.cp_0.index = index == 0 ? 0 : 1;
            this.cp_1.index = index == 1 ? 0 : 1;
            this._panels[this._tab]?.hide();
            let panel: IPanel;
            switch(index){
                case 0:
                    panel = this.getPanel(index, StarPanel);
                    break;
                case 1:
                    panel = this.getPanel(index, OceanicSongFlashPanel);
                    break;
            }
            this.ruleId = panel.ruleId;
            panel.show(this);
            this._tab = index;
        }
        private getPanel(idx: number, cls: any): IPanel{
            if(!this._panels[idx]){
                this._panels[idx] = new cls();
                this._panels[idx].init(this._sign);
            }
            return this._panels[idx];
        }
    }
}