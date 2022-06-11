namespace mentor {
    import TASK_STATE = clientCore.TASK_STATE;
    export class MentorTargetPanel extends ui.mentor.panel.MentorTargetPanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            this.createList();
            clientCore.DialogMgr.ins.open(this);
        }

        private createList() {
            let arr = _.compact(clientCore.TaskManager.getMentorTaskInfo());
            let sortArr = _.map(arr, (o) => {
                return {
                    info: o,
                    id: 9999999 - o.taskid,//id倒序
                    rwd: o.state == TASK_STATE.COMPLETE,
                    notComplete: o.state < TASK_STATE.COMPLETE,
                }
            })
            this.list.dataSource = _.sortBy(sortArr, ['rwd', 'notComplete', 'id']).map(o => o.info).reverse();
            this.list.scrollTo(0);
            this.onScroll();
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onListRender(cell: ui.mentor.render.MentorTargetRenderUI, idx: number) {
            let data = cell.dataSource as pb.ITask;
            let taskInfo = clientCore.TaskManager.getTaskById(data.taskid);
            let xlsInfo = xls.get(xls.taskData).get(taskInfo.taskid);
            cell.txtDetail.text = xlsInfo.task_content;
            cell.txtStep.style.width = 100;
            cell.txtStep.style.align = 'right';
            cell.txtStep.style.font = '汉仪中圆简';
            cell.txtStep.style.fontSize = 24;
            cell.imgSp.visible = data.taskid == 9019 || data.taskid == 9020;
            let totalStep = xlsInfo.task_condition.v3;
            //如果没有taskInfo，说明已经领过奖
            if (taskInfo) {
                cell.imgComplete.visible = taskInfo.state == TASK_STATE.COMPLETE || taskInfo.state == TASK_STATE.REWARDED;
                cell.btnGo.visible = taskInfo.state != TASK_STATE.REWARDED;//没有领奖显示按钮
                cell.btnGo.fontSkin = taskInfo.state < TASK_STATE.COMPLETE ? 'commonBtn/T_p_go.png' : 'commonBtn/l_p_complete.png';//要么是领奖要么是前往
                cell.txtStep.visible = taskInfo.state < TASK_STATE.COMPLETE;
            }
            else {
                cell.btnGo.visible = true;
                cell.btnGo.disabled = true;
                cell.imgComplete.visible = false;
            }
            let nowStep = taskInfo ? taskInfo.step : 0;
            let color = nowStep >= totalStep ? '#805329' : '#fa7279';
            let normalColor = '#805329';
            if (cell.imgSp.visible) {
                cell.txtDetail.color = '#ffffff';
                normalColor = color = '#ffffff'
            }
            cell.txtDetail.color = normalColor;
            cell.txtStep.innerHTML = util.StringUtils.getColorText2([
                Math.min(taskInfo.step, totalStep).toString(),
                color,
                `/${totalStep}`,
                normalColor
            ])
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnGo') {
                let data = e.currentTarget['dataSource'] as pb.ITask;
                //完成了任务 领奖
                if (data.state == TASK_STATE.COMPLETE) {
                    clientCore.TaskManager.getMentorTaskReward(data.taskid).then(() => {
                        if (this.list)
                            this.createList();
                    })
                }
                else {
                    let xlsInfo = xls.get(xls.taskData).get(data.taskid)
                    if (xlsInfo)
                        clientCore.ToolTip.gotoMod(xlsInfo.system_interface);
                }
            }
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScrollBar.y = this.imgScrollBg.y + (this.imgScrollBg.height - this.imgScrollBar.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}