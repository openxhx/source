namespace hiddenElf{
    /**
     * 隐匿的精灵
     * hiddenElf.HiddenElfModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0108\【主活动最新】隐匿的妖精_connie.xlsx
     */
    export class HiddenElfModule extends ui.hiddenElf.HiddenElfModuleUI{

        private _model: HiddenElfModel;
        private _control: HiddenElfControl;

        private _itemPanel: ItemPanel;
        private _exchangePanel: ExchangePanel;
        private _shopPanel: ShopPanel;
        private _materialPanel: MaterialPanel;

        constructor(){ super(); }

        init(): void{
            this.sign = clientCore.CManager.regSign(new HiddenElfModel(),new HiddenElfControl());
            this._model = clientCore.CManager.getModel(this.sign) as HiddenElfModel;
            this._control = clientCore.CManager.getControl(this.sign) as HiddenElfControl;
            //预加载
            this.addPreLoad(this._control.getInfo(this.sign));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.onShowCoin();
            //增加点击范围
            this.btnShop.hitArea = new Laya.Rectangle(0,-164,195,199);
            this.btnItem.hitArea = new Laya.Rectangle(0,-100,195,139);
            this.btnMetarial.hitArea = new Laya.Rectangle(0,0,195,173);
        }

        addEventListeners(): void{
            BC.addEvent(this,this.btnStart,Laya.Event.CLICK,this,this.onStartGame);
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnItem,Laya.Event.CLICK,this,this.onItem);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onExchange);
            BC.addEvent(this,this.btnShop,Laya.Event.CLICK,this,this.onShop);
            BC.addEvent(this,this.btnMetarial,Laya.Event.CLICK,this,this.onMeterial);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            this.txtTimes.changeText(`${5-this._model.gameTimes}/5`);
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '打开活动面板');
        }
        destroy(): void{
            clientCore.UIManager.releaseCoinBox();
            clientCore.CManager.unRegSign(this.sign);
            this._itemPanel = this._exchangePanel = this._shopPanel = this._materialPanel = null;
            super.destroy();
        }
        private onStartGame(): void{
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '点击开始寻找');
            if(this._model.gameTimes >= 5){
                alert.showFWords('游戏次数不足啦~');
                return;
            }
            this.destroy();
            clientCore.ModuleManager.open('hiddenElfGame.HiddenElfGameModule');
        }
        /** 打开特殊道具*/
        private onItem(): void{
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '点击特殊商店');
            this._itemPanel = this._itemPanel || new ItemPanel();
            this._itemPanel.show(this.sign);
            this._itemPanel.once(Laya.Event.CLOSE,this,this.onShowCoin);
        }
        /** 打开兑换处*/
        private onExchange(): void{
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '点击奖励兑换');
            this._exchangePanel = this._exchangePanel || new ExchangePanel();
            this._exchangePanel.show(this.sign);
        }
        /** 打开神秘商人*/
        private onShop(): void{
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '点击妖精商人');
            if(this._model.buyTimes >= 4){
                alert.showFWords('今日购买次数已达上限了哦~');
                return;
            }
            this._shopPanel = this._shopPanel || new ShopPanel();
            this._shopPanel.show(this.sign);
            this._shopPanel.once(Laya.Event.CLOSE,this,this.onShowCoin);
        }
        /** 打开材料兑换*/
        private onMeterial(): void{
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '点击提交材料');
            if(this._model.isReward){
                alert.showFWords('今天的奖励已经领完啦，小花仙明天再来吧~');
                return;
            }
            this._materialPanel = this._materialPanel || new MaterialPanel();
            this._materialPanel.show(this.sign);
        }
        private onRule(): void{
            clientCore.Logger.sendLog('2021年1月8日活动', '【主活动】隐匿的妖精', '点击规则说明');
            alert.showRuleByID(1122);
        }
        private onShowCoin(): void{
            clientCore.UIManager.setMoneyIds([this._model.ACTIVITY_ID,clientCore.MoneyManager.LEAF_MONEY_ID,clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }
    }
}