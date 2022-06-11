namespace task {
    export class DailyTaskRender extends ui.task.render.DailyTaskRenderUI {
        constructor() {
            super();
            this.listRwd.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRwd.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && this.listRwd.getItem(idx).v1 > 0)
                clientCore.ToolTip.showTips(this.listRwd.getCell(idx), { id: this.listRwd.getItem(idx).v1 });
        }

        public set dataSource(taskInfo: pb.ITask) {
            if (!taskInfo)
                return;
            let xlsInfo = xls.get(xls.taskData).get(taskInfo.taskid);
            this.txtTaskName.text = xls.get(xls.taskData).get(taskInfo.taskid).task_target;
            this.txtTaskInfo.text = '·' + xls.get(xls.taskData).get(taskInfo.taskid).task_content + '·';
            this.btnGo.visible = false;
            // this.btnGetRwd.visible = false;
            this.imgComplete.visible = false;
            // this.imgMask.x = -this.imgProBg.width + this.imgProBg.width * _.clamp((taskInfo.step / xlsInfo.task_condition.v3), 0, 1);
            this.imgProBg.width = 298*_.clamp((taskInfo.step / xlsInfo.task_condition.v3), 0, 1);
            this.txtProgress.text = `${Math.min(taskInfo.step, xlsInfo.task_condition.v3)}/${xlsInfo.task_condition.v3} `;
            this.imgRole.skin = pathConfig.getRoleIcon(xlsInfo.npc_icon);
            this.imgFull.visible = taskInfo.step >= xlsInfo.task_condition.v3;
            if (taskInfo.state == clientCore.TASK_STATE.ACCEPT) {
                this.btnGo.visible = true;
                this.btnGo.fontSkin = 'commonBtn/s_y_completed.png';
            }
            else if (taskInfo.state == clientCore.TASK_STATE.COMPLETE) {
                this.btnGo.visible = true;
                this.btnGo.fontSkin = 'commonBtn/s_y_Reward.png';
            }
            else if (taskInfo.state == clientCore.TASK_STATE.REWARDED) {
                this.imgComplete.visible = true;
            }
            let active = new xls.pair();//活跃度
            active.v1 = 9900019;
            active.v2 = xlsInfo.activity_award;
            let rwds = clientCore.LocalInfo.sex == 1 ? xlsInfo.f_others_award : xlsInfo.m_others_award;
            this.listRwd.dataSource = [active].concat(rwds);
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            cell.ico.skin = data.v1 == -1 ? 'task/actIcon.png' : clientCore.ItemsInfo.getItemIconUrl(data.v1);
            cell.num.value = data.v2.toString();
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
            cell.num.scale(1.6, 1.6);
        }
    }
}