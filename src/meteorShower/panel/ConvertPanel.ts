namespace meteorShower{
    /**
     * 材料交换
     */
    export class ConvertPanel extends ui.meteorShower.ConvertPanelUI{
        private _model: MeteorShowerModel;
        private _control: MeteorShowerControl;
        constructor(){ 
            super();
            this.list.selectEnable  = true;
            this.list.renderHandler = new Laya.Handler(this,this.itemRender,null,false);
            this.list.selectHandler = new Laya.Handler(this,this.itemSelect,null,false);
        }
        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as MeteorShowerModel;
            this._control = clientCore.CManager.getControl(sign) as MeteorShowerControl;
            this.list.array = clientCore.GlobalConfig.config.materialsRange;
            this.list.selectedIndex = 0;
            this.updateGain();
            clientCore.DialogMgr.ins.open(this);
            clientCore.Logger.sendLog('2020年11月27日活动', '【主活动】一起来看流星雨', '打开库库鲁兑换弹窗');
        }
        hide(): void{
            this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnConvert,Laya.Event.CLICK,this,this.onConvert);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private itemRender(item: ui.meteorShower.render.ConvertItemUI,index: number): void{
            let id: number = this.list.array[index];
            item.imgSel.visible = index == this.list.selectedIndex;
            clientCore.GlobalConfig.setRewardUI(item.mcRward,{id: id,cnt: clientCore.ItemsInfo.getItemNum(id),showName: false});
        }
        private itemSelect(index: number): void{
            if(index < 0)return;
            let id: number = this.list.array[index];
            let count: number = this.getCount(id);
            this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this.getTxt.text = this.meterTxt.text = 'x' + count;
            this.btnConvert.disabled = count == 0;
        }
        /**
         * 
         * 策划原话以下：
         * 玩家拥有的材料大于20则默认选择数量为20，
         * 玩家拥有的材料数量小于20则默认选择拥有的所有材料。
         * 选择的材料数量不能大于今日可兑换剩余次数
         */
        private getCount(id: number): number{
            let cnt: number = Math.min(20,clientCore.ItemsInfo.getItemNum(id));
            cnt = Math.min(cnt,50 - this._model.msg.exchangeGain);
            return cnt;
        }
        private updateGain(): void{
            this.timesTxt.changeText(`今日已获得:${this._model.msg.exchangeGain}/50`);
        }
        private async onConvert(): Promise<void>{
            let id: number = this.list.array[this.list.selectedIndex];
            let cnt: number = this.getCount(id);
            if(!id)return;
            if(cnt <= 0){
                alert.showFWords('交换数量上限或材料不足~');
                return;
            }
            await this._control.convert(id,this.getCount(id));
            if(this._closed)return;
            this._model.msg.exchangeGain += cnt;
            this.updateGain();
            this.list.changeItem(this.list.selectedIndex,id);
            this.itemSelect(this.list.selectedIndex);
            EventManager.event(Constant.UPDATE_CONVERT_COUNT);
        }
    }
}