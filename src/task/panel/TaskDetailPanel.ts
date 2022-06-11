namespace task {
    export class TaskDetailPanel extends ui.task.panel.TaskDetailPanelUI {
        private _info: pb.ITask;
        constructor() {
            super();
            this.sideClose = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.onListRender);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
        }

        show(info: pb.ITask) {
            this._info = info;
            let xlsInfo = xls.get(xls.taskData).get(info.taskid);
            this.txtTarget.text = xlsInfo.task_target;
            this.txtContent.text = xlsInfo.task_content;
            this.txtTaskName.text = xlsInfo.task_title;
            //暂时只显示女性奖励
            let rwd = clientCore.LocalInfo.sex == 1 ? xlsInfo.f_others_award : xlsInfo.m_others_award;
            this.listReward.dataSource = rwd;
            this.listReward.repeatX = rwd.length;
        }

        private onListRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as xls.pair;
            (cell.getChildByName('img') as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            (cell.getChildByName('txt') as Laya.Label).text = clientCore.ItemsInfo.getItemName(data.v1);
            (cell.getChildByName('txtNum') as Laya.Label).text = 'x' + data.v2;
        }

        private onGo() {
            let xlsInfo = xls.get(xls.taskData).get(this._info.taskid);
            EventManager.event(TaskEvent.GO_TASK_MODULE, [xlsInfo.system_interface,xlsInfo.task_condition.v2]);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}