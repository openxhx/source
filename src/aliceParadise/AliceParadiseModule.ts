namespace aliceParadise {
    /**
     * 爱丽丝的乐园
     * aliceParadise.AliceParadiseModule
     * 策划案: \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0618\【主活动】爱丽丝的乐园20210618_inory.docx
     */
    export class AliceParadiseModule extends ui.aliceParadise.AliceParadiseModuleUI {
        private _model: AliceParadiseModel;
        private _control: AliceParadiseControl;
        private _rewardPanel: RewardPanel;
        private readonly phoArr: Array<string> = [
            "tu_ceng_21", "alice_nan"
        ];

        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new AliceParadiseModel(), new AliceParadiseControl());
            this._model = clientCore.CManager.getModel(this.sign) as AliceParadiseModel;
            this._control = clientCore.CManager.getControl(this.sign) as AliceParadiseControl;
            const index: number = clientCore.LocalInfo.sex - 1;
            this.imgPho.skin = `unpack/aliceParadise/${this.phoArr[index]}.png`;
            this.init2VerticalReward();
            this.addPreLoad(Promise.all([
                xls.load(xls.taskData),
                this.getGameInfo()
            ]));
        }

        private async getGameInfo() {
            this._model.rewardStatus = await this._control.getStatus();
        }

        private init2VerticalReward(): void {
            for (let i: number = 0; i < 3; i++) {
                (this[`reward_${i + 1}_0`]["imgState"] as Laya.Image).rotation = 90;
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btn_close, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onRule);
            let i: number, j: number;
            for (i = 0, j = 2; i < j; i++) {
                BC.addEvent(this, this[`btnTry${i + 1}`] as Laya.Button, Laya.Event.CLICK, this, this.onTrySuit);
            }
            for (i = 0, j = 3; i < j; i++) {
                BC.addEvent(this, this[`reward_${i + 1}_0`], Laya.Event.CLICK, this, this.onReceiveHandler);
                BC.addEvent(this, this[`reward_0_${i + 1}`], Laya.Event.CLICK, this, this.onReceiveHandler);
            }
            for (i = 0, j = 9; i < j; i++) {
                BC.addEvent(this, this[`task_${i + 1}`] as Laya.Button, Laya.Event.CLICK, this, this.onTask, [i]);
            }
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGetAll);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }
        //点击任务处理
        private onTask(index: number): void {
            let data: pb.ITask = this._model.taskStatus[index];
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



        //获取最后的奖励
        private onGetAll(e: Laya.Event): void {
            if (this.isCanGetAll()) {
                this._control.getReward(7, Laya.Handler.create(this, this.onGetRewardBoxCallback));//请求领取奖励
            }
        }

        private onTrySuit(e: Laya.Event): void {
            const index: number = parseInt(e.target.name.substr(e.target.name.length - 1));
            switch (index) {
                case 1:
                    this.onCloth();
                    break;
                case 2:
                    this.onShow();
                    break;
            }
        }

        private onReceiveHandler(e: Laya.Event): void {
            const rewardUi: ui.aliceParadise.item.AliceParadiseRewardItemUI = e.target as ui.aliceParadise.item.AliceParadiseRewardItemUI;
            const colTag: number = +rewardUi.name.substr(rewardUi.name.length - 1, 1);
            const rowTag: number = +rewardUi.name.substr(rewardUi.name.length - 3, 1);
            let rewardIndex: number;
            let rewardState: number;
            let arrTaskIndex: number[];
            let startIndex: number;
            let i: number, j: number;
            //是否已经领取过奖励
            const isReceived: () => Boolean = () => {
                return this._model.checkReward(rewardIndex + 1);
            };
            //是否还没达到领奖条件
            const isNoReward: () => Boolean = () => {
                let taskState: pb.ITask;
                let taskData: xls.taskData;
                let noReward: boolean = false;
                for (i = 0, j = 3; i < j; i++) {
                    taskState = this._model.taskStatus[arrTaskIndex[i]];
                    taskData = this._model.taskInfo[arrTaskIndex[i]];
                    if (taskState.step < taskData.task_condition.v3) {
                        noReward = true;
                        break;
                    }
                }
                return noReward;
            };
            if (colTag == 0) {
                rewardIndex = rowTag - 1;
                if (isReceived()) {
                    return;
                }
                startIndex = (rowTag - 1) * 3;
                arrTaskIndex = [];
                for (i = startIndex, j = startIndex + 3; i < j; i++) {
                    arrTaskIndex.push(i);
                }
            } else {
                rewardIndex = 2 + colTag;
                if (isReceived()) {
                    return;
                }
                startIndex = colTag - 1;
                arrTaskIndex = [];
                let stepIndex: number = 0;
                i = startIndex;
                while (stepIndex < 3) {
                    arrTaskIndex.push(i);
                    i += 3;
                    stepIndex++;
                }
            }
            if (isNoReward()) {//没有达到领奖条件
                this._rewardPanel = this._rewardPanel || new RewardPanel();
                this._rewardPanel.show(clientCore.GlobalConfig.getPeachRewards(rewardIndex + 1));
                return;
            }
            this._control.getReward(rewardIndex + 1, Laya.Handler.create(this, this.onGetRewardBoxCallback));//请求领取奖励
        }

        //领取奖励后的回调
        private onGetRewardBoxCallback(rewardIndex: number): void {
            this._model.rewardStatus = util.setBit(this._model.rewardStatus, rewardIndex + 1, 1);//重置状态码
            if (rewardIndex <= 5) {
                let colTag: number;
                let rowTag: number;
                if (rewardIndex < 3) {
                    rowTag = rewardIndex + 1;
                    colTag = 0;
                } else {
                    rowTag = 0;
                    colTag = rewardIndex - 2;
                }
                this.renderReward(this[`reward_${rowTag}_${colTag}`]);//更新渲染
            } else {
                this.isCanGetAll();
            }

        }

        async onPreloadOver() {
            await this._model.creatTaskInfo();
            this.setUI();
        }

        private setUI(): void {
            let i: number, j: number;
            for (i = 0, j = 9; i < j; i++) {
                this.renderTask(this[`task_${i + 1}`], true);
            }
            for (i = 0, j = 3; i < j; i++) {
                this.renderReward(this[`reward_${i + 1}_0`]);
                this.renderReward(this[`reward_0_${i + 1}`]);
            }
            this.isCanGetAll();
        }

        private isCanGetAll(): boolean {
            const rewardState: boolean = this._model.checkReward(7);
            if (rewardState) {
                this.imgAllDone.visible = true;
                this.btnGet.visible = false;
            } else {
                this.imgAllDone.visible = false;
                if (this._model.isAllTaskDone()) {//没有领取奖励
                    this.btnGet.visible = true;
                    return true;
                } else {//有任务没做完
                    this.btnGet.visible = false;
                }
            }
            return false;
        }

        //渲染任务
        private renderTask(taskUi: ui.aliceParadise.item.AliceParadiseTaskItemUI, isInit: boolean): void {
            const index: number = (+taskUi.name.substr(taskUi.name.length - 1, 1) - 1);
            const taskData: xls.taskData = this._model.taskInfo[index];
            const taskState: pb.ITask = this._model.taskStatus[index];
            const finished: boolean = taskState.step >= taskData.task_condition.v3;//任务是否已经完成
            if (finished) {
                taskUi.imgDuck.visible = taskUi.imgDone.visible = true;
                taskUi.bxReadying.visible = false;
            } else {
                taskUi.imgDuck.visible = taskUi.imgDone.visible = false;
                taskUi.bxReadying.visible = true;
                const totalNum: number = taskData.task_condition.v3;
                taskUi.labProgress.text = `(${taskState.step}/${totalNum})`;
            }
            if (isInit && !finished) {
                taskUi.labName.text = taskData.task_content;
            }
        }

        //渲染奖励
        private renderReward(rewardUi: ui.aliceParadise.item.AliceParadiseRewardItemUI): void {
            const colTag: number = +rewardUi.name.substr(rewardUi.name.length - 1, 1);
            const rowTag: number = +rewardUi.name.substr(rewardUi.name.length - 3, 1);
            let arrTaskIndex: number[] = [];
            let startIndex: number;
            let rewardIndex: number;
            let i: number, j: number;
            if (colTag == 0) {
                rewardIndex = rowTag - 1;
                startIndex = (rowTag - 1) * 3;
                for (i = startIndex, j = startIndex + 3; i < j; i++) {
                    arrTaskIndex.push(i);
                }
            } else {
                rewardIndex = 2 + colTag;
                startIndex = colTag - 1;
                let stepIndex: number = 0;
                i = startIndex;
                while (stepIndex < 3) {
                    arrTaskIndex.push(i);
                    i += 3;
                    stepIndex++;
                }
            }
            const rewardState: boolean = this._model.checkReward(rewardIndex + 1);
            if (!rewardState) {
                let taskState: pb.ITask;
                let taskData: xls.taskData;
                let noReward: boolean = false;
                for (i = 0, j = 3; i < j; i++) {
                    taskState = this._model.taskStatus[arrTaskIndex[i]];
                    taskData = this._model.taskInfo[arrTaskIndex[i]];
                    if (taskState.step < taskData.task_condition.v3) {
                        noReward = true;
                        break;
                    }
                }
                if (noReward) {
                    rewardUi.imgReceived.visible = false;
                    rewardUi.imgState.skin = "aliceParadise/gray_ap_box.png";
                } else {
                    rewardUi.imgReceived.visible = true;
                    rewardUi.imgState.skin = "aliceParadise/ready_ap_box.png";
                }
            } else {
                rewardUi.imgReceived.visible = true;
                rewardUi.imgState.skin = "aliceParadise/img_ap_reward.png";
            }
        }


        public popupOver(): void {
            clientCore.Logger.sendLog('2021年6月18日活动', '【主活动】爱丽丝的乐园', '打开活动面板');
        }

        private onRule(): void {
            alert.showRuleByID(this._model.ruleId);
        }

        //#region suit处理
        /** 服装预览*/
        private onCloth(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        /** 背景秀预览*/
        private onShow(): void {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', {
                id: this._model.stageId,
                condition: '',
                limit: ''
            });
        }

        //#endregion


        public destroy(): void {
            if (this._rewardPanel) {
                this._rewardPanel.destroy();
                this._rewardPanel = null;
            }
            super.destroy();
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
        }
    }
}
