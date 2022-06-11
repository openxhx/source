namespace luluCamping {
    export class CampingTaskPanel extends ui.luluCamping.panel.LuluCampingTaskUI {
        private _taskInfo: xls.taskData;
        private _idx: number;
        constructor() {
            super();
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
        }

        show(idx: number, info: xls.taskData) {
            this._idx = idx;
            this._taskInfo = info;
            let flag = idx % 3;
            this.imgLulu.visible = flag == 0;
            this.imgLusha.visible = flag == 1;
            this.imgLuna.visible = flag == 2;
            this.labName.skin = `luluCamping/wen_ben${flag}.png`;
            this.labDes.text = info.task_content;
            this.labContent.text = info.task_target;
            let serverInfo = clientCore.TaskManager.getTaskById(info.task_id);
            this.labProgress.text = serverInfo.step + "/" + info.task_condition.v3;
            this.labCost.text = clientCore.ItemsInfo.getItemNum(9900152) + "/" + info.coinCondition[0].v2;
            let reward = clientCore.LocalInfo.sex == 1 ? info.f_others_award : info.m_others_award;
            this.list.array = reward;
            this.list.repeatX = reward.length;
            if (!info.system_interface || serverInfo.state >= 2) {
                this.btnGo.visible = false;
            } else {
                this.btnGo.visible = true;
            }
            clientCore.DialogMgr.ins.open(this, false);
        }

        private listSelect(index: number) {
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
                return;
            };
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**跳转 */
        private go() {
            clientCore.ToolTip.gotoMod(this._taskInfo.system_interface);
        }

        /**提交 */
        private submit(type: number) {
            if (type == 1 && clientCore.ItemsInfo.getItemNum(9900152) < this._taskInfo.coinCondition[0].v2) {
                alert.showFWords(clientCore.ItemsInfo.getItemName(9900152) + "不足");
                return;
            }
            let serverInfo = clientCore.TaskManager.getTaskById(this._taskInfo.task_id);
            if (type == 1 && serverInfo.state != 2) {
                alert.showFWords("任务未完成");
                return;
            }
            if (type == 2) {
                alert.showSmall("确认消耗100神叶直接完成任务?", {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.submit1(type);
                        }]
                    }
                });
            } else {
                this.submit1(type);
            }
        }

        private submit1(type: number) {
            net.sendAndWait(new pb.cs_submit_lulu_camping_task({ id: this._taskInfo.task_id, type: type })).then((msg: pb.sc_submit_lulu_camping_task) => {
                alert.showReward(msg.items);
                util.RedPoint.reqRedPointRefresh(25801);
                EventManager.event("CAMPING_TASK_REFRESH");
                this.closeClick();
                clientCore.AnimateMovieManager.showAnimateMovie(80518 + this._idx, null, null);
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.go);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submit, [1]);
            BC.addEvent(this, this.btnLeaf, Laya.Event.CLICK, this, this.submit, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}