namespace secretPercious {


    interface IReward{
        index: number;
        status: number; //0-可领 1-不可领 2-已领
        cfg: xls.triple;
    }

    /**
     * 领奖
     */
    export class RewardPanel extends ui.secretPercious.panel.RewardPanelUI {
        private _model: SecretPerciousModel;
        private _control: SecretPerciousControl;
        constructor() {
            super();
            this.list.vScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse, null, false);
        }
        show(sign: number): void {
            this._control = clientCore.CManager.getControl(sign) as SecretPerciousControl;
            this._model = clientCore.CManager.getModel(sign) as SecretPerciousModel;
            this.txTimes.changeText(this._model.historyTimes + '');
            let array: xls.triple[] = clientCore.LocalInfo.sex == 1 ? clientCore.GlobalConfig.config.divinationAwardFemale : clientCore.GlobalConfig.config.divinationAwardMale;
            
            let listArr: IReward[] = [];
            let len: number = array.length;
            for(let i:number=0; i<len; i++){
                let status: number = util.getBit(this._model.rewardIdx, i + 1);
                listArr.push({index: i + 1,status: status == 1 ? 2 : (array[i].v1 <= this._model.historyTimes ? 0 : 1),cfg: array[i]});
            }
            this.list.array = _.sortBy(listArr,'status');
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._model = null;
            super.destroy();
        }

        private listRender(item: ui.secretPercious.item.RewardItemUI, index: number): void {
            let data: IReward = this.list.array[index];
            item.taskTxt.changeText(`累计占卜${data.cfg.v1}次`);
            item.imgHas.visible = data.status == 2;
            //奖励按钮
            item.btnReward.visible = data.status != 2;
            item.btnReward.visible && (item.btnReward.disabled = data.status == 1);
            //奖励内容
            clientCore.GlobalConfig.setRewardUI(item.rewardView, { id: data.cfg.v2, cnt: data.cfg.v3, showName: false });
            item.rewardView.off(Laya.Event.CLICK, this, this.onClick);
            item.rewardView.on(Laya.Event.CLICK, this, this.onClick, [item, data.cfg.v2]);
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type == Laya.Event.CLICK && e.target instanceof component.HuaButton){
                let data: IReward = this.list.array[index]; 
                this._control.getReward(data.index-1,new Laya.Handler(this,()=>{
                    data.status = 2;
                    this._model.rewardIdx = util.setBit(this._model.rewardIdx,data.index,1);
                    this.list.array = _.sortBy(this.list.array,'status','index');
                }))
            }
        }

        private onClick(item: ui.playground.item.ActivityItemUI, id: number): void {
            clientCore.ToolTip.showTips(item, { id: id });
        }
    }
}