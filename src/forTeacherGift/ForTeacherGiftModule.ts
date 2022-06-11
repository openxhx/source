namespace forTeacherGift {
    /**
     * 先给老师的贺卡
     * 2021.9.10
     * forTeacherGift.ForTeacherGiftModule
     */
    export class ForTeacherGiftModule extends ui.forTeacherGift.ForTeacherGiftModuleUI {
        private _model: ForTeacherGiftModel;
        /**玩家形象 */
        private aniRole: clientCore.Person;

        init() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this._model = ForTeacherGiftModel.instance;
            this._model.getConfig();
            this.addPreLoad(net.sendAndWait(new pb.cs_get_teacher_card_info()).then((msg: pb.sc_get_teacher_card_info) => {
                this._model.rewardFlag = msg.rewardCnt;
            }))
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年9月10日活动', '【主活动】献给老师的贺卡', '打开活动面板');
            this.setTaskInfo();
            this.checkRewardAll();
            this.aniRole = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this.role.addChildAt(this.aniRole, 0);
            this.aniRole.scale(0.6, 0.6);
            this.aniRole.pos(870, 450);
        }

        /**初始化任务状态 */
        private setTaskInfo() {
            for (let i = 0; i < 9; i++) {
                const taskUi: ui.forTeacherGift.item.ForTeacherTaskItemUI = this['task' + i];
                const taskData: xls.taskData = this._model.taskConfig[i];
                const taskState: pb.ITask = clientCore.TaskManager.getTaskById(taskData.task_id);
                const finished: boolean = taskState.step >= taskData.task_condition.v3;
                if (finished) {
                    taskUi.visible = false;
                } else {
                    const totalNum: number = taskData.task_condition.v3;
                    taskUi.labProgress.text = `(${taskState.step}/${totalNum})`;
                    taskUi.labTask.text = taskData.task_content;
                    if(!taskData.system_interface){
                        taskUi.btn.visible = false;
                    }else{
                        BC.addEvent(this, taskUi.btn, Laya.Event.CLICK, this, this.taskJump, [taskData.system_interface]);
                    }
                }
            }
            for (let j = 1; j <= 6; j++) {
                let finished: boolean;
                if (j <= 3) {
                    let flag = (j - 1) * 3;
                    finished = !(this['task' + flag].visible || this['task' + (flag + 1)].visible || this['task' + (flag + 2)].visible);
                } else {
                    let flag = (j - 1) % 3;
                    finished = !(this['task' + flag].visible || this['task' + (flag + 3)].visible || this['task' + (flag + 6)].visible);
                }
                let isGot: boolean = util.getBit(this._model.rewardFlag, j) == 1;
                const item: ui.forTeacherGift.item.ForTeacherRewardItemUI = this['reward' + j];
                item.imgAlert.visible = finished && !isGot;
                item.imgGot.visible = isGot;
                item.imgBox.skin = item.imgAlert.visible ? 'forTeacherGift/btn_gift_1.png' : 'forTeacherGift/btn_gift.png';
            }
        }

        /**任务跳转 */
        private taskJump(id: number) {
            if (!id) return;
            clientCore.ToolTip.gotoMod(id);
        }

        /**包含奖励 */
        private showRewardTip(idx: number) {
            if (idx < 7) {
                clientCore.ToolTip.showContentTips(this['reward' + idx], 0, this._model.taskReward[idx]);
            }
        }

        /**检查是否完成所有任务 */
        private checkRewardAll() {
            let cnt = util.get1num(this._model.rewardFlag);
            this.btnGet.visible = cnt == 6;
            this.imgGot.visible = cnt == 7;
        }

        /**领取装饰奖励 */
        private getReward(idx: number) {
            if (idx == 7 && this.imgGot.visible) return;
            if (idx < 7 && !this['reward' + idx].imgAlert.visible) {
                if (!this['reward' + idx].imgGot.visible) {
                    this.showRewardTip(idx);
                }
                return;
            }
            net.sendAndWait(new pb.cs_get_teacher_card_reward({ getRewardIdx: idx })).then((msg: pb.sc_get_teacher_card_reward) => {
                alert.showReward(msg.item);
                this._model.rewardFlag = util.setBit(this._model.rewardFlag, idx, 1);
                if (idx == 7) {
                    this.btnGet.visible = false;
                    this.imgGot.visible = true;
                } else {
                    this['reward' + idx].imgGot.visible = true;
                    this['reward' + idx].imgAlert.visible = false;
                    this.checkRewardAll();
                }
            })
        }

        /**展示套装详情 */
        private onTryClick(idx: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110486);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1207);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward, [7]);
            for (let i: number = 1; i < 7; i++) {
                BC.addEvent(this, this['reward' + i], Laya.Event.CLICK, this, this.getReward, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.aniRole.destroy();
            this.aniRole = null;
            super.destroy();
        }
    }
}