namespace task {
    export class MainTaskRender extends ui.task.render.MainTaskRenderUI {
        constructor() {
            super();
            this.listRwd.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRwd.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK)
                clientCore.ToolTip.showTips(this.listRwd.getCell(idx), { id: this.listRwd.getItem(idx).v1 });
        }

        public set dataSource(taskInfo: pb.ITask) {
            if (!taskInfo)
                return;
            let xlsInfo = xls.get(xls.taskData).get(taskInfo.taskid);
            let taskType = xls.get(xls.taskData).get(taskInfo.taskid).type;
            this.txtTaskName.text = xls.get(xls.taskData).get(taskInfo.taskid).task_title;
            this.txtTaskInfo.text = '·' + xls.get(xls.taskData).get(taskInfo.taskid).task_content + '·';
            // this.imgMask.x = -this.imgProBg.width + this.imgProBg.width * _.clamp((taskInfo.step / xlsInfo.task_condition.v3), 0, 1);
            this.imgProBg.width = 298*_.clamp((taskInfo.step / xlsInfo.task_condition.v3), 0, 1);
            this.txtProgress.text = `${taskInfo.step}/${xlsInfo.task_condition.v3} `;
            this.imgRole.skin = pathConfig.getRoleIcon(xlsInfo.npc_icon);
            this.imgIcon.skin = taskType == clientCore.TASK_TYPE.MAIN ? 'task/main.png' : 'task/branch.png';
            this.imgFull.visible = taskInfo.step >= xlsInfo.task_condition.v3;
            if (taskInfo.state == clientCore.TASK_STATE.INIT) {
                this.btnGo.fontSkin = 'commonBtn/T_y_jiequrenwu.png';
            }
            else if (taskInfo.state == clientCore.TASK_STATE.ACCEPT) {
                this.btnGo.fontSkin = 'commonBtn/s_y_completed.png';
            }
            else if (taskInfo.state == clientCore.TASK_STATE.COMPLETE) {
                this.btnGo.fontSkin = 'commonBtn/s_y_Reward.png';
            }
            this.listRwd.dataSource = clientCore.LocalInfo.sex == 1 ? xlsInfo.f_others_award : xlsInfo.m_others_award;
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            cell.ico.skin = data.v1 == -1 ? 'task/actIcon.png' : clientCore.ItemsInfo.getItemIconUrl(data.v1);
            cell.num.value = data.v2.toString();
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
            cell.num.scale(1.5, 1.5);
        }
    }
}