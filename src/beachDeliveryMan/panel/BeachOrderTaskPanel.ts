namespace beachDeliveryMan {
    /**
     * 订单任务面板
     */
    export class BeachOrderTaskPanel extends ui.beachDeliveryMan.panel.BeachOrderTaskPanelUI {
        private _model: BeachDeliveryManModel;
        private _control: BeachDeliveryManControl;
        private _taskData: pb.ITask;
        public constructor(sign: number, data: pb.ITask) {
            super();
            this.sign = sign;
            this._taskData = data;
            this._model = clientCore.CManager.getModel(this.sign) as BeachDeliveryManModel;
            this._control = clientCore.CManager.getControl(this.sign) as BeachDeliveryManControl;
        }

        initOver(): void {
            const index: number = this._taskData.taskid - this._model.TASK_ID_OFF;
            this.imgPho.skin = `unpack/beachDeliveryMan/bpho_${index}.png`;
            const cfg: xls.taskData = xls.get(xls.taskData).get(this._taskData.taskid);
            const condition: xls.triple = cfg.task_condition;
            const coinCondition: xls.pair[] = cfg.coinCondition;
            this.labIntroduce.text = cfg.task_content;
            this.labWho.text = `${this._model.TASK_NAMES[index - 1]}的请求:`;
            const whoLen: number = this.labWho.text.length * this.labWho.fontSize;
            this.labWho.width = whoLen;
            this.labReq.x = this.labWho.x + whoLen + 10;
            this.labReq.text = cfg.task_target;
            this.labSpeed.text = `${this._taskData.step}/${condition.v3}`;
            this.labNeed.text = `${clientCore.MoneyManager.getNumById(coinCondition[0].v1)}/${coinCondition[0].v2}`;
            this.init2Reward(cfg);
            if (this._taskData.state == 2 && clientCore.MoneyManager.getNumById(coinCondition[0].v1) >= coinCondition[0].v2) {
                this.btnSubmit.gray = false;
            } else {
                this.btnSubmit.gray = true;
            }
            if (cfg.system_interface) {
                this.btnGo.visible = true;
            } else {
                this.btnGo.visible = false;
            }
        }
        //初始化奖励
        private init2Reward(cfg: xls.taskData): void {
            const rewards: xls.pair[] = clientCore.LocalInfo.sex == 1 ? cfg.f_others_award : cfg.m_others_award;
            clientCore.GlobalConfig.setRewardUI(this.itemReward, { id: rewards[0].v1, cnt: rewards[0].v2, showName: false });
            BC.addEvent(this.itemReward, this.itemReward, Laya.Event.CLICK, this, this.showRewardDetail, [rewards[0]]);
        }

        private showRewardDetail(data: xls.pair): void {
            if (data != null) {
                clientCore.ToolTip.showTips(this.itemReward, { id: data.v1 });
            }
        }
        popupOver(): void {

        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [false]);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnSy, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnSubmit:
                    if (this.btnSubmit.gray == true) return;
                    this._control.getOrderReward(this._taskData.taskid, 1).then(msg => {
                        alert.showReward(msg.items);
                        util.RedPoint.reqRedPointRefresh(28601);
                        this.onClose(true);
                    });
                    break;
                case this.btnSy:
                    const syMap: number[] = this._model.SHENYE_ORDER_NUM;
                    if (clientCore.MoneyManager.getNumById(syMap[0]) < syMap[1]) {
                        alert.showFWords(`您的${clientCore.ItemsInfo.getItemName(syMap[0])}不足!`);
                    } else {
                        alert.showSmall(`是否花费${syMap[1]}${clientCore.ItemsInfo.getItemName(syMap[0])}完成订单任务？`, {
                            callBack: {
                                caller: this, funArr: [() => {
                                    this._control.getOrderReward(this._taskData.taskid, 2).then(msg => {
                                        alert.showReward(msg.items);
                                        util.RedPoint.reqRedPointRefresh(28601);
                                        this.onClose(true);
                                    });
                                }]
                            }
                        });
                    }
                    break;
                case this.btnGo:
                    const cfg: xls.taskData = xls.get(xls.taskData).get(this._taskData.taskid);
                    clientCore.ToolTip.gotoMod(cfg.system_interface);
                    break;
            }
        }

        private onClose(refresh: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(BeachDeliveryManEventType.close_orderTaskPanel, refresh);
        }

        public destroy(): void {
            this._model = this._control = null;
            BC.removeEvent(this.itemReward);
            super.destroy();
        }
    }
}