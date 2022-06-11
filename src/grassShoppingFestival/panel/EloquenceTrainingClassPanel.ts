namespace grassShoppingFestival {
    /**
     * 口才训练班面板
     */
    export class EloquenceTrainingClassPanel extends ui.grassShoppingFestival.panel.EloquenceTrainingClassPanelUI {
        private _model: GrassShoppingFestivalModel;
        private _control: GrassShoppingFestivalControl;
        private _bigTestPanel: EloquenceBigTestPanel;
        public constructor(sign: number) {
            super();
            this.sideClose = false;
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as GrassShoppingFestivalModel;
            this._control = clientCore.CManager.getControl(this.sign) as GrassShoppingFestivalControl;
        }

        createChildren(): void {
            super.createChildren();
            this.addEvent();
        }

        initOver(): void {
            this.initUI();
        }

        private initUI(): void {
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.renderList);
            let dataList: Array<IEloquenceTrainingClassRenderData> = [
                { index: 0, taskIdOrGameTimes: this._model.freeTaskId, sign: +this.sign },
                { index: 1, taskIdOrGameTimes: this._model.taskId, sign: +this.sign },
                { index: 2, taskIdOrGameTimes: this._model.gameTimes, sign: +this.sign },
            ];
            this.list.array = dataList;
        }

        private addEvent(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, EventManager, GrassShoppingFestivalEventType.CLOSE_EloquenceBigTestPanel, this, this.onCloseBigTestPanel);
        }
        public removeEvent(): void {
            BC.removeEvent(this);
        }

        private onCloseBigTestPanel(): void {
            if (this._bigTestPanel) {
                this._bigTestPanel = null;
            }
        }

        private onClose(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        //#region 列表渲染
        //渲染列表
        private renderList(item: ui.grassShoppingFestival.item.EloquenceTrainingClassRenderUI, index: number): void {
            const data: IEloquenceTrainingClassRenderData = item.dataSource;
            item.hbState.visible = false;
            if (data.index == 0 || data.index == 1) {
                item.labSurplusProgress.visible = false;
                // item.imgZ.visible = true;
                item.imgOverTxt.visible = false;
                item.imgKc.visible = true;
                item.labKcNum.visible = true;
                item.labItemNum.visible = true;
                const cfg: xls.taskData = xls.get(xls.taskData).get(data.taskIdOrGameTimes);
                const condition: xls.triple = cfg.task_condition;
                const rewards: xls.pair[] = clientCore.LocalInfo.sex == 1 ? cfg.f_others_award : cfg.m_others_award;
                item.labKcNum.text = `X${rewards[0].v2}`;
                const task: pb.ITask = clientCore.TaskManager.getTaskById(data.taskIdOrGameTimes);
                let w: pb.ITask = clientCore.TaskManager.getTaskById(cfg.task_id);
                let subName: string;
                if (cfg.task_id >= 18009) {
                    subName = "收获";
                } else {
                    subName = "种植";
                }
                if (data.index != 0) {
                    item.hbState.visible = true;
                }
                item.labItemNum.text = `${subName}${w.step}/${condition.v3}份${clientCore.ItemsInfo.getItemName(condition.v2)}`;
                if (task.state == 3) {//已经领取到奖励了
                    item.stateGeted.visible = true;
                    item.btnCommon.visible = false;
                } else {
                    item.stateGeted.visible = false;
                    item.btnCommon.visible = true;
                    if (task.state == 2) {
                        item.btnCommon.skin = `grassShoppingFestival/btn_give.png`;
                    } else {
                        item.btnCommon.skin = `grassShoppingFestival/btn_go.png`;
                    }
                }
            } else {
                item.labSurplusProgress.visible = true;
                // item.imgZ.visible = false;
                item.imgOverTxt.visible = true;
                item.imgKc.visible = false;
                item.labKcNum.visible = false;
                item.labItemNum.visible = false;
                item.labSurplusProgress.text = `今日剩余${data.taskIdOrGameTimes}/3`;
                if (data.taskIdOrGameTimes >= 3) {
                    item.stateGeted.visible = true;
                    item.btnCommon.visible = false;
                } else {
                    item.stateGeted.visible = false;
                    item.btnCommon.visible = true;
                    item.btnCommon.skin = `grassShoppingFestival/btn_go.png`;
                }
            }
            BC.removeEvent(item);
            BC.addEvent(item, item.btnCommon, Laya.Event.CLICK, this, this.onItemClickHandler);
        }

        private onItemClickHandler(e: Laya.Event): void {
            const data: IEloquenceTrainingClassRenderData = e.currentTarget.parent["dataSource"];
            const mainFun: (id: number) => void = id => {
                if (e.currentTarget["skin"] == "grassShoppingFestival/btn_give.png") {
                    this._control.getTaskReward(id).then((msg) => {
                        alert.showReward(msg.item);
                        this.list.refresh();
                    });
                } else {
                    this.onClose();
                    clientCore.ToolTip.gotoMod(15);
                }
            };
            if (data.index == 0) {
                mainFun(data.taskIdOrGameTimes);
            } else if (data.index == 1) {
                if (clientCore.FlowerPetInfo.petType > 0) {
                    mainFun(data.taskIdOrGameTimes);
                } else {
                    alert.showSmall(`是否前往充值奇妙花宝？`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                this.onClose();
                                clientCore.ToolTip.gotoMod(52);//花宝
                            }]
                        }
                    });
                }
            } else {
                this._bigTestPanel = new EloquenceBigTestPanel(+this.sign);
                clientCore.DialogMgr.ins.open(this._bigTestPanel);
                this.onClose();
            }
        }
        //#endregion




        public destroy(): void {
            this.removeEvent();
            for (let i: number = 0, j: number = this.list.numChildren; i < j; i++) {
                BC.removeEvent(this.list.getChildAt(i));//移除事件监听
            }
            this._model = this._control = null;
            this.list.renderHandler = null;
            EventManager.event(GrassShoppingFestivalEventType.CLOSE_EloquenceTrainingClassPanel);
            if (this._bigTestPanel) {
                this._bigTestPanel = null;
            }
            super.destroy();
        }
    }
}