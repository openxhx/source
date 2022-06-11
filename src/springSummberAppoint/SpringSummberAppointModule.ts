namespace springSummberAppoint {
    /**
     * 春夏之约
     * springSummberAppoint.SpringSummberAppointModule
     */
    export class SpringSummberAppointModule extends ui.springSummberAppoint.SpringSummberAppointModuleUI {
        private _tab: number = -1;
        private _panels: IPanel[] = [];
        private _model: SpringSummberAppointModel;
        private _control: SpringSummberAppointControl;
        private _first: boolean;
        constructor() { super(); }
        init(): void {
            this.sign = clientCore.CManager.regSign(new SpringSummberAppointModel(), new SpringSummberAppointControl());
            this._model = clientCore.CManager.getModel(this.sign) as SpringSummberAppointModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpringSummberAppointControl;
            //预加载资源
            this.addPreLoad(Promise.all([
                xls.load(xls.eventExchange),
                xls.load(xls.rouletteDraw),
                xls.load(xls.rouletteDrawCost),
                xls.load(xls.rechargeEvent),
                clientCore.MedalManager.getMedal([MedalConst.SPRING_SUMMER_OPEN]).then((msg: pb.ICommonData[])=>{
                    this._first = msg[0].value == 0;
                })
            ]));
        }
        addEventListeners(): void {
            for (let i: number = 1; i < 7; i++) {
                BC.addEvent(this, this[`tab_${i}`], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRuleClick);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        onPreloadOver(): void {
            this.onClick(1);
        }
        destroy(): void {
            _.forEach(this._panels, (element: IPanel) => { element?.dispose(); })
            this._panels.length = 0;
            this._panels = null;
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
        popupOver(): void{
            if(this._first){
                this._first = false;
                clientCore.MedalManager.setMedal([{id: MedalConst.SPRING_SUMMER_OPEN,value: 1}]);
                alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的蝴蝶兰以及江南银币按照168：1的比例转换为梦的星星，快去参与抽奖吧~');
            }
        }

        private onClick(index: number): void {
            if (this._tab == index) return;
            if (this._tab != -1) this._panels[this._tab].hide();
            let tab: Laya.Image = this[`tab_${index}`];
            this.imgSel.y = tab.y - 17;
            this.btnRule.visible = index != 5 && index != 4;
            let panel: IPanel;
            switch (index) {
                case 1: //春日甜饼
                    clientCore.Logger.sendLog('2021年4月16日活动', '【付费】春夏之约第一期', '打开春日甜饼面板');
                    panel = this.getPanel(index, CakePanel);
                    break;
                case 2: //幽灵诗人
                    clientCore.Logger.sendLog('2021年4月16日活动', '【付费】春夏之约第一期', '打开幽灵诗人面板');
                    panel = this.getPanel(index, PoetPanel);
                    break;
                case 3: //未来之梦
                    clientCore.Logger.sendLog('2021年4月23日活动', '【付费】春夏之约第二期', '打开未来之梦面板');
                    panel = this.getPanel(index,DreamPanel);
                    break;
                case 4: //玫瑰玩偶
                    clientCore.Logger.sendLog('2021年4月23日活动', '【付费】春夏之约第二期', '打开玫瑰玩偶面板');
                    panel = this.getPanel(index, RosePanel);
                    break;
                case 5: //回到未来
                    clientCore.Logger.sendLog('2021年4月16日活动', '【付费】春夏之约第一期', '打开回到未来面板');
                    panel = this.getPanel(index, LimitPanel);
                    break;
                case 6: //超值6元购
                    clientCore.Logger.sendLog('2021年4月16日活动', '【付费】春夏之约第一期', '打开超值6元GO面板');
                    panel = this.getPanel(index, SixBuyPanel);
                    break;

            }
            panel.show(this.sign, this.spPanel);
            this._tab = index;
        }

        private onRuleClick() {
            alert.showRuleByID(this._panels[this._tab].ruleId);
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