namespace loveMagic{
    /**
     * 就餐
     */
    export class MakePanel extends ui.loveMagic.panel.MakePanelUI{

        private readonly EXCHANGE_ID: number = 2559;
        private _cost: xls.pair;
        private _model: LoveMagicModel;
        private _control: LoveMagicControl;

        constructor(){ super(); }

        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as LoveMagicModel;
            this._control = clientCore.CManager.getControl(sign) as LoveMagicControl;
            let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(this.EXCHANGE_ID);
            this._cost = cfg.cost[0];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleProperty[0] : cfg.maleProperty[0];
            this.getTxt.changeText(`x${reward.v2}`);
            this.updateNeed();
            this.updateTimes();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._cost = this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnMake,Laya.Event.CLICK,this,this.onMake);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        private updateNeed(): void{
            this.needTxt.changeText(`${clientCore.ItemsInfo.getItemNum(this._cost.v1)}/${this._cost.v2}`);
        }

        private updateTimes(): void{
            this.timesTxt.changeText(`今日剩余:${1 - this._model.exchangeTimes}/1`);
            this.btnMake.disabled = this._model.exchangeTimes >= 1;
        }

        private onMake(): void{
            if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: this._cost.v1,itemNum: this._cost.v2}])){
                alert.showFWords('所需要的材料不足哦~');
                return;
            }
            clientCore.Logger.sendLog('2021年4月9日活动', '【主活动】爱的魔法', '制作1次餐点');
            this._control?.exchange(new Laya.Handler(this,()=>{
                this._model.exchangeTimes++;
                this.updateTimes();
                this.updateNeed();
            }));
        }
    }
}