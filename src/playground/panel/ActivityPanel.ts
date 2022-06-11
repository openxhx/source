namespace playground {


    interface IReward{
        index: number;
        status: number; //0-可领 1-不可领 2-已领
        cfg: xls.triple;
    }

    /**
     * 活动
     */
    export class ActivityPanel extends ui.playground.panel.ActivityPanelUI {
        private _control: PlaygroundControl;
        private _msg: pb.sc_flower_land_get_active_reward_panel;
        constructor() {
            super();
            this.list.vScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse, null, false);
        }
        show(sign: number, msg: pb.sc_flower_land_get_active_reward_panel): void {
            this._control = clientCore.CManager.getControl(sign) as PlaygroundControl;
            this._msg = msg;
            this.txTimes.changeText(msg.diceTimes + '');
            let cfg: xls.gardenCommonData = xls.get(xls.gardenCommonData).get(1);
            let array: xls.triple[] = clientCore.LocalInfo.sex == 1 ? cfg.NewYearsDayFemale : cfg.NewYearsDayMale;
            
            let listArr: IReward[] = [];
            let len: number = array.length;
            for(let i:number=0; i<len; i++){
                listArr.push({index: i + 1,status: this._msg.info[i] == 1 ? 0 : (array[i].v1 > this._msg.diceTimes ? 1 : 2),cfg: array[i]});
            }
            this.list.array = _.sortBy(listArr,'status');
            clientCore.DialogMgr.ins.open(this);
            clientCore.Logger.sendLog('2021年1月29日活动', '花仙乐园更新', '打开活跃活动面板');
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            // BC.addEvent(this, this.btnAll, Laya.Event.CLICK, this, this.onReward);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._msg = this._control = null;
            super.destroy();
        }

        private onReward(): void {
            let len: number = this._msg.info.length;
            let array: number[] = [];
            for (let i: number = 0; i < len; i++) {
                if (this._msg.info[i] == 1) {
                    array.push(i + 1);
                }
            }
            if (array.length <= 0) {
                alert.showFWords('当前没有可领取的奖励哦~');
                return;
            }
            this._control.getReward(array, new Laya.Handler(this, () => {
                _.forEach(array, (ele) => {
                    this._msg.info[ele - 1] = 0;
                    this.list.refresh();
                })
                util.RedPoint.reqRedPointRefresh(9601);
            }))
        }

        private listRender(item: ui.playground.item.ActivityItemUI, index: number): void {
            let data: IReward = this.list.array[index];
            item.taskTxt.changeText(`投掷${data.cfg.v1}个骰子`);
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
                this._control.getReward([data.index],new Laya.Handler(this,()=>{
                    data.status = 2;
                    this._msg.info[data.index] = 0;
                    this.list.array = _.sortBy(this.list.array,'status','index');
                    util.RedPoint.reqRedPointRefresh(9601);
                }))
            }
        }

        private onClick(item: ui.playground.item.ActivityItemUI, id: number): void {
            clientCore.ToolTip.showTips(item, { id: id });
        }
    }
}