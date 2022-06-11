namespace lantern2021{
    /**
     * 喜乐闹元宵
     * lantern2021.Lantern2021Module
     * 策划案： \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0226\【主活动】喜乐闹元宵.xlsx
     */
    export class Lantern2021Module extends ui.lantern2021.Lantern2021ModuleUI{
        private _panelMap: IPanel[] = [];
        private _control: Lantern2021Control;
        private _bone: clientCore.Bone;
        constructor(){ super(); }
        init(): void{
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('naoyuanxiao'),0,true,this.spBone);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.sign = clientCore.CManager.regSign(new Lantern2021Model(),new Lantern2021Control());
            this._control = clientCore.CManager.getControl(this.sign) as Lantern2021Control;
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.eventTask));
            this.addPreLoad(xls.load((xls.valentineAnswer)));
            this.addPreLoad(this._control.getInfo(this.sign));
            clientCore.Logger.sendLog('2021年2月26日活动', '【主活动】喜乐闹元宵', '打开活动面板');
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnExchange,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnMake,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnGuess,Laya.Event.CLICK,this,this.onClick);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this._bone?.dispose();
            this._bone = null;
            this._panelMap.length = 0;
            this._panelMap = null;
            this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
        private onClick(e: Laya.Event): void{
            switch(e.currentTarget){
                case this.btnExchange: //奖励兑换
                    clientCore.Logger.sendLog('2021年2月26日活动', '【主活动】喜乐闹元宵', '打开奖励兑换面板');
                    this.openDialog(0,ExchangePanel);
                    break;
                case this.btnMake: //制元宵
                    clientCore.Logger.sendLog('2021年2月26日活动', '【主活动】喜乐闹元宵', '打开猜灯谜面板');
                    this.openDialog(1,MakePanel);
                    break;
                case this.btnGuess: //猜灯谜
                    clientCore.Logger.sendLog('2021年2月26日活动', '【主活动】喜乐闹元宵', '打开制元宵面板');
                    this.openDialog(2,GuessPanel);
                    break;
                case this.btnRule: //规则
                    clientCore.Logger.sendLog('2021年2月26日活动', '【主活动】喜乐闹元宵', '打开规则面板');
                    alert.showRuleByID(1130);
                    break;
                default:
                    break;
            }
        }
        private openDialog(index: number, cls: any): void {
            this._panelMap[index] = this._panelMap[index] || new cls();
            this._panelMap[index].show(this.sign);
        }
    }
}