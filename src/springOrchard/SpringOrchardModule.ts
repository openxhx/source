namespace springOrchard{
    /**
     *  *春日果园
     *  springOrchard.SpringOrchardModule
     */
    export class SpringOrchardModule extends ui.springOrchard.SpringOrchardModuleUI{
        private _qa: QuestionPanel;
        private _exchangePanel: ExchangePanel;
        private _model: SpringOrchardModel;
        private _control: SpringOrchardControl;
        constructor(){ super(); }
        init(): void{
            this.sign = clientCore.CManager.regSign(new SpringOrchardModel(),new SpringOrchardControl());
            this._model = clientCore.CManager.getModel(this.sign) as SpringOrchardModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpringOrchardControl;
            this.addPreLoad(this._control.getInfo(this._model));
            this.addPreLoad(this._control.getMedal(this._model));
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnFight,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnQa,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnExchange,Laya.Event.CLICK,this,this.onClick);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this._model = this._control = null;
            this._qa = this._exchangePanel = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
        onPreloadOver(): void{
            if(this._model.isFrist){
                clientCore.MedalManager.setMedal([{id: MedalConst.SPRING_ORCHARD_OPEN,value: 1}]);
                clientCore.AnimateMovieManager.showAnimateMovie(80514,null,null);
            }
        }
        private onClick(e: Laya.Event): void{
            switch(e.currentTarget){
                case this.btnRule: //规则
                    alert.showRuleByID(1141);
                    break;
                case this.btnFight: //双人对决
                    clientCore.Logger.sendLog('2021年3月26日活动', '【主活动】春日果园', '点击前往果香的对决');
                    if(!clientCore.OrchardMgr.checkActivity()){
                        alert.showFWords('果园当前还未开放~');
                        return;
                    }
                    clientCore.MapManager.enterActivityMap(25);
                    break;
                case this.btnQa: //问答
                    clientCore.Logger.sendLog('2021年3月26日活动', '【主活动】春日果园', '点击前往蜜蜂的疑惑');
                    if(this._model.times >= 1){
                        alert.showFWords('今天已经帮助过小蜜蜂了，明天再来吧~');
                        return;
                    }
                    this._qa = this._qa || new QuestionPanel();
                    this._qa.show(this.sign);
                    break;
                case this.btnExchange: //奖励兑换
                    clientCore.Logger.sendLog('2021年3月26日活动', '【主活动】春日果园', '点击前往奖励兑换');
                    this._exchangePanel = this._exchangePanel || new ExchangePanel();
                    this._exchangePanel.show(this.sign);
                    break;
            }
        }
    }
}