namespace odeToJay {
    /**
     * 摩卡的宝藏
     */
    export class PreciousPanel extends ui.odeToJay.panel.PreciousPanelUI {

        private _model: OdeToJayModel;
        private _control: OdeToJayControl;
        private _rewardPanel: RewardPanel;
        constructor() { super(); }

        async show(sign: number): Promise<void> {
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】摩卡的宝藏', '打开游戏面板');
            this._model = clientCore.CManager.getModel(sign) as OdeToJayModel;
            this._control = clientCore.CManager.getControl(sign) as OdeToJayControl;
            for (let i: number = 1; i < 9; i++) { this.taskRender(this['task_' + i], this._model.taskMap[i - 1]); }
            for (let i: number = 1; i <= 5; i++) { this.rewardRender(i) };
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            //任务
            for (let i: number = 1; i < 9; i++) {
                BC.addEvent(this, this['task_' + i].spTouch, Laya.Event.CLICK, this, this.onTask, [i]);
            }
            //奖励
            BC.addEvent(this, this.btnBigReward, Laya.Event.CLICK, this, this.onReward, [5]);
            for (let i: number = 1; i < 5; i++) {
                BC.addEvent(this, this['reward_' + i], Laya.Event.CLICK, this, this.onReward, [i]);
            }
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._rewardPanel = this._model = this._control = null;
            super.destroy();
        }

        /** 任务*/
        private onTask(index: number): void {
            let data: pb.ITask = this._model.taskMap[index - 1];
            let cls: xls.taskData = xls.get(xls.taskData).get(data.taskid);
            if (!cls) {
                alert.showFWords('任务不存在~');
                return;
            }
            let finish: boolean = data.step >= cls.task_condition.v3;
            if (finish) {
                alert.showFWords('任务已经完成了~');
                return;
            }
            clientCore.ToolTip.gotoMod(cls.system_interface);
        }

        /** 奖励*/
        private onReward(index: number): void {
            let isReward: boolean = this._model.checkReward(index);
            if (!isReward) { //未领奖
                let canReward: boolean = this._model.checkStep(index);
                if (canReward) {
                    this._control.getReward(index, new Laya.Handler(this, () => {
                        util.RedPoint.reqRedPointRefresh(8801);
                        this._model.rewardIdx = util.setBit(this._model.rewardIdx, index, 1);
                        this.rewardRender(index);
                    }));
                } else {
                    this._rewardPanel = this._rewardPanel || new RewardPanel();
                    this._rewardPanel.show(clientCore.GlobalConfig.getPeachRewards(index));
                }
            }
        }

        private taskRender(item: ui.peach.item.TaskItemUI, data: pb.ITask): void {
            if (data) {
                let cls: xls.taskData = xls.get(xls.taskData).get(data.taskid);
                if (!cls) {
                    console.error(`配置表中似乎并不存在id${data.taskid}任务~`);
                    return;
                }
                let finish: boolean = data.step >= cls.task_condition.v3;
                item.boxTask.visible = !finish;
                if (!finish) {
                    item.txTask.text = cls.task_target;
                    item.txCnt.changeText(`(${data.step}/${cls.task_condition.v3})`);
                }
            }
        }

        private rewardRender(index: number): void {
            let isReward: boolean = this._model.checkReward(index);
            let canReward: boolean = this._model.checkStep(index);
            //第五阶段特殊处理
            if (index == 5) {
                this.imgBigReward.visible = isReward;
                this.r_tip.visible = canReward && !isReward;
                return;
            }
            let reward: ui.peach.item.RewardItemUI = this['reward_' + index];
            let isShow: boolean = canReward && !isReward;
            reward.imgGet.visible = canReward && isReward;
            reward.r_tip.visible = isShow;
        }

        private onRule(): void {
            alert.showRuleByID(1154);
        }
    }
}