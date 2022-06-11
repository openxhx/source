namespace ranch {
    export class RanchTaskPanel extends ui.ranch.panel.RanchTaskUI {
        private _taskInfo: xls.taskData;
        constructor() {
            super();
            this.sideClose = true;
        }

        show(info: xls.taskData) {
            clientCore.Logger.sendLog('2021年5月14日活动', '【主活动】牧场体验营', `点击查看奶牛任务${info.task_id - 16000}`);
            this._taskInfo = info;
            this.labContent.text = info.task_content;
            this.labTask.text = info.task_target;
            this.imgNpc.skin = `unpack/ranch/${info.npc_icon}.png`;
            let npc = xls.get(xls.characterId).get(info.npc_icon).name;
            this.labNpc.text = `${npc}的请求:`;
            this.labTask.x = 256 + npc.length * 22;
            let serverInfo = clientCore.TaskManager.getTaskById(info.task_id);
            this.labProgress.text = serverInfo.step + "/" + info.task_condition.v3;
            this.labCost.text = clientCore.ItemsInfo.getItemNum(info.coinCondition[0].v1) + "/" + info.coinCondition[0].v2;
            this.listRender();
            if (!info.system_interface || serverInfo.state >= 2) {
                this.btnGo.visible = false;
            } else {
                this.btnGo.visible = true;
            }
            clientCore.DialogMgr.ins.open(this, false);
        }

        private listSelect() {
            let reward = (clientCore.LocalInfo.sex == 1 ? this._taskInfo.f_others_award : this._taskInfo.m_others_award)[0];
            if (reward) {
                clientCore.ToolTip.showTips(this.reward, { id: reward.v1 });
                return;
            };
        }

        private listRender() {
            let reward = (clientCore.LocalInfo.sex == 1 ? this._taskInfo.f_others_award : this._taskInfo.m_others_award)[0];
            clientCore.GlobalConfig.setRewardUI(this.reward, { id: reward.v1, cnt: reward.v2, showName: false });
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
            if (type == 1 && clientCore.ItemsInfo.getItemNum(this._taskInfo.coinCondition[0].v1) < this._taskInfo.coinCondition[0].v2) {
                alert.showFWords(clientCore.ItemsInfo.getItemName(this._taskInfo.coinCondition[0].v1) + "不足");
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
            net.sendAndWait(new pb.cs_pasture_experience_submit_task({ id: this._taskInfo.task_id, type: type })).then((msg: pb.sc_pasture_experience_submit_task) => {
                alert.showReward(msg.items);
                EventManager.event("RANCH_ORDER_FRESH", this._taskInfo.task_id);
                util.RedPoint.reqRedPointRefresh(26401);
                this.closeClick();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.go);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submit, [1]);
            BC.addEvent(this, this.btnFinish, Laya.Event.CLICK, this, this.submit, [2]);
            BC.addEvent(this, this.reward, Laya.Event.CLICK, this, this.listSelect);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}