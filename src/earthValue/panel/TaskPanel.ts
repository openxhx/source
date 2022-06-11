namespace earthValue{
    /**
     * 培育任务
     */
    export class TaskPanel extends ui.earthValue.panel.TaskPanelUI{

        private _tasks: pb.ITask[];

        constructor(){
            super();
            this.addEvents();
        }

        private addEvents(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.dispose);
            BC.addEvent(this,this.btnStart,Laya.Event.CLICK,this,this.gotoGame);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        onEnable(): void{
            this._tasks = clientCore.TaskManager.getEarthPerciousTaskInfo();
            for(let i: number=0; i<2; i++){
                let task: pb.ITask = this._tasks[i];
                let cfg: xls.taskData = xls.get(xls.taskData).get(task.taskid);
                let index: number = i + 1;
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.f_others_award[0] : cfg.m_others_award[0];
                let rewardUI: ui.commonUI.item.RewardItemUI = this['reward_' + index];
                this['txt_' + index].text = `${cfg.task_content}(${task.step}/${cfg.task_condition.v3})`;
                this['num_' + index].changeText('x'+reward.v2);
                clientCore.GlobalConfig.setRewardUI(rewardUI,{id: reward.v1,cnt: 1,showName: false});
                BC.addEvent(this,rewardUI,Laya.Event.CLICK,this,()=>{ clientCore.ToolTip.showTips(rewardUI,{id: reward.v1}); });
                //是否已领奖
                let isReward: boolean = task.state == clientCore.TASK_STATE.REWARDED;
                let btn: component.HuaButton = this['btn_' + index];
                btn.visible = !isReward;
                if(btn.visible){
                    btn.fontSkin = task.step >= cfg.task_condition.v3 ? 'earthValue/l_p_get.png' : 'earthValue/l_p_go.png';
                    BC.addEvent(this,btn,Laya.Event.CLICK,this,this.onClick,[i]);
                }
            }
            //每日一次
            this.btnStart.visible = clientCore.EarthPerciousMgr.taskFlag == 0;
        }

        onDisable(): void{
            this._tasks.length = 0;
            this._tasks = null;
            this.removeEvents();
        }

        private onClick(index: number): void{
            let task: pb.ITask = this._tasks[index];
            if(task.state != clientCore.TASK_STATE.REWARDED){
                let cfg: xls.taskData = xls.get(xls.taskData).get(task.taskid);
                if(task.step >= cfg.task_condition.v3){ //可领取
                    clientCore.TaskManager.getEarthTaskReward(task.taskid).then(()=>{
                        this['btn_'+(index + 1)].visible = false;
                    })
                }else{
                    clientCore.ToolTip.gotoMod(cfg.system_interface);
                }
            }
        }

        private dispose(): void{
            clientCore.ToolTip.gotoMod(243);
        }

        private gotoGame(): void{
            this.removeEvents();
            EventManager.event(Constant.UPDATE_VIEW,2);
        }
    }
}