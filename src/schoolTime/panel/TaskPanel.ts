namespace schoolTime {
    export class TaskPanel extends ui.schoolTime.panel.TaskPanelUI {
        private _sign: number;
        private _type: number;
        private waiting: boolean;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public setType(type: 1 | 2) {
            this._type = type;
            this.imgTip.skin = type == 1 ? 'schoolTime/jin_ri_xu_yao_zhong_zhi.png' : 'schoolTime/jin_ri_xu_yao_sheng_chan.png';
            this.imgTitle.skin = type == 1 ? 'schoolTime/t_yuan_yi_kao_yan.png' : 'schoolTime/t_shou_gong_kao_yan.png';
            let model = clientCore.CManager.getModel(this._sign) as SchoolTimeModel;
            let taskId = this._type == 1 ? model.flowerTask : model.handTask;
            let xlsInfo = xls.get(xls.taskData).get(taskId);
            let serInfo = clientCore.TaskManager.getTaskById(taskId);
            this.labProgress.text = `当前进度:${serInfo.step}/${xlsInfo.task_condition.v3}`;
            this.btnGo.visible = serInfo.state < 2;
            this.btnFinish.visible = serInfo.state == 2;
            this.labFinish.visible = serInfo.state == 3;
            clientCore.GlobalConfig.setRewardUI(this.itemCost, { id: xlsInfo.task_condition.v2, cnt: xlsInfo.task_condition.v3, showName: true });
            clientCore.GlobalConfig.setRewardUI(this.itemTarget, { id: xlsInfo.m_others_award[0].v1, cnt: xlsInfo.m_others_award[0].v2, showName: true });
        }

        /**进行任务 */
        private goTaskModule() {
            let model = clientCore.CManager.getModel(this._sign) as SchoolTimeModel;
            let taskId = this._type == 1 ? model.flowerTask : model.handTask;
            let info = xls.get(xls.taskData).get(taskId);
            clientCore.ToolTip.gotoMod(info.system_interface);
        }

        /**完成任务 */
        private finishTask() {
            this.btnFinish.visible = false;
            this.labFinish.visible = true;
            let model = clientCore.CManager.getModel(this._sign) as SchoolTimeModel;
            let taskId = this._type == 1 ? model.flowerTask : model.handTask;
            net.sendAndWait(new pb.cs_get_finish_school_task_reward({ taskId: taskId })).then((msg: pb.sc_get_finish_school_task_reward) => {
                alert.showReward(msg.item);
                model.allCoin += msg.item[0].cnt;
                EventManager.event('SCHOOL_TIME_SET_COIN', msg.item[0].id - 9900186);
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goTaskModule);
            BC.addEvent(this, this.btnFinish, Laya.Event.CLICK, this, this.finishTask);
        }

        close() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}