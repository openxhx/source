namespace girlWs{
    /**
     * 付费：少女万岁
     * girlWs.GirlWsModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0305\【付费】少女万岁20210305_Inory.docx
     */
    export class GirlWsModule extends ui.girlWs.GirlWsModuleUI{
        private _control: GirlWsControl;
        private _model: GirlWsModel;
        private _panelMap: IPanel[] = [];
        constructor(){ super(); }
        init(): void{
            // this.drawCallOptimize = true;
            this.sign = clientCore.CManager.regSign(new GirlWsModel(),new GirlWsControl());
            this._model = clientCore.CManager.getModel(this.sign) as GirlWsModel;
            this._control = clientCore.CManager.getControl(this.sign) as GirlWsControl;
            this.addPreLoad(Promise.all([
                xls.load(xls.eventExchange),
                xls.load(xls.rouletteDraw),
                xls.load(xls.rouletteDrawCost),
                xls.load(xls.rechargeEvent),
                this._control.getDiscount(this._model)
            ]));
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            for(let i:number=0; i<3; i++){
                BC.addEvent(this,this.tab.getChildAt(i),Laya.Event.CLICK,this,this.onClick,[i]);
            }
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            clientCore.Logger.sendLog('2021年3月5日活动', '【付费】少女万岁', '打开活动面板');
            this.onClick(0);
        }
        destroy(): void{
            clientCore.UIManager.releaseCoinBox();
            _.forEach(this._panelMap,(element: IPanel)=>{ element?.dispose(); });
            this._panelMap.length = 0;
            this._panelMap = null;
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
        private onClick(index: number): void{
            clientCore.UIManager.releaseCoinBox();
            this.btnRule.visible = false;
            this.vStack.selectedIndex = this.tab.ani1.index = index;
            switch(index){
                case 0: //森之物语
                    clientCore.Logger.sendLog('2021年3月5日活动', '【付费】少女万岁', '点击森之物语页签');
                    this.openView(0,FairyPanel,this.vStack.getChildAt(index));
                    break;
                case 1: //缤纷星辰
                    clientCore.Logger.sendLog('2021年3月5日活动', '【付费】少女万岁', '点击缤纷星辰页签');
                    clientCore.UIManager.setMoneyIds([this._model.DRAW_ITEM_ID]);
                    this.btnRule.visible = true;
                    this.openView(1,StarPanel,this.vStack.getChildAt(index));
                    clientCore.UIManager.setMoneyIds([this._model.DRAW_ITEM_ID]);
                    clientCore.UIManager.showCoinBox();
                    break;
                case 2: //美丽小铺
                    this.openView(2,ShopPanel,this.vStack.getChildAt(index));
                    break;
            }
        }
        private openView(index: number,cls: any,ui: any): void{
            let panel: IPanel = this._panelMap[index];
            if(!panel){
                panel = new cls();
                panel.init(this.sign,ui);
                this._panelMap[index] = panel;
            }
            panel.show();
        }
        private onRule(): void{
            alert.showRuleByID(1132);
        }
    }
}