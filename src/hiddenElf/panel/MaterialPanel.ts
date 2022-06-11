namespace hiddenElf{
    /**
     * 材料兑换
     */
    export class MaterialPanel extends ui.hiddenElf.panel.MaterialsPanelUI{
        private _model: HiddenElfModel;
        private _control: HiddenElfControl;
        constructor(){ 
            super();
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
        }
        show(sign: number): void{
            this._control = clientCore.CManager.getControl(sign) as HiddenElfControl;
            this._model = clientCore.CManager.getModel(sign) as HiddenElfModel;
            this.initView();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(): void{
            this._model = this._control = null;
            super.destroy();
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnSubmit,Laya.Event.CLICK,this,this.onSubmit);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private initView(): void{
            this.list.array = clientCore.GlobalConfig.config.materialsRange2;
            this.list.selectedIndex = 0;
            clientCore.GlobalConfig.setRewardUI(this.mcReward, { id: 9900121, cnt: 100, showName: false });
            this.updateView();
        }
        private listRender(item: ui.hiddenElf.item.MaterialItemUI,index: number): void{
            let itemId: number = item.dataSource;
            let cnt = clientCore.ItemsInfo.getItemNum(itemId);
            item.imgSel.visible = index == this.list.selectedIndex;
            clientCore.GlobalConfig.setRewardUI(item.mcReward, { id: itemId, cnt: cnt, showName: false });
        }
        private updateView(): void{
            let max: number = clientCore.GlobalConfig.config.materialsNum2;
            this.todayTxt.changeText(`今日已提交:${this._model.submitCnt + "/" + max}`);
            this.btnSubmit.disabled = this._model.submitCnt == max;
            this.btnReward.disabled = this._model.submitCnt < max;
        }
        private onSubmit(): void {
            let itemId: number = this.list.selectedItem;
            let itemCnt: number = Math.min(Math.min(clientCore.ItemsInfo.getItemNum(itemId), 20), clientCore.GlobalConfig.config.materialsNum2 - this._model.submitCnt);
            if (itemCnt <= 0) {
                alert.showFWords('所需道具数量不足，无法提交~');
                return;
            }
            this._control.submitMaterial(itemId, itemCnt, Laya.Handler.create(this, () => {
                this._model.submitCnt += itemCnt;
                this.updateView();
                this.list.refresh();
            }))
        }
        private onReward(): void{
            this._control.getReward(new Laya.Handler(this,()=>{
                this._model.isReward = true;
                this.hide();
            }));
        }
    }
}