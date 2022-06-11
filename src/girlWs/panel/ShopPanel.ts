namespace girlWs{
    /**
     * 美丽小铺
     */
    export class ShopPanel implements IPanel{
        private _ui: ui.girlWs.panel.ShopPanelUI;
        init(sign: number, ui: ui.girlWs.panel.ShopPanelUI): void{
            this._ui = ui;
            this.addEvents();
        }
        show(): void{
            
        }
        dispose(): void{
            this.removeEvents();
            this._ui = null;
        }
        private addEvents(): void{

        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }
    }
}