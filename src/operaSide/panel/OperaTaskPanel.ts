namespace operaSide {
    export class OperaTaskPanel extends ui.operaSide.panel.OperaTaskPanelUI {
        private _timesArr: number[];
        private _totalTimes: number[];
        constructor() {
            super();
            this.listTask.renderHandler = new Laya.Handler(this, this.onListTaskRender);
            this.listTask.mouseHandler = new Laya.Handler(this, this.onListTaskMouse);
            this.listBuy.renderHandler = new Laya.Handler(this, this.onListBuyRender);
            this.listBuy.mouseHandler = new Laya.Handler(this, this.onListBuyMouse);
            this._timesArr = [0, 0, 0];
            this._totalTimes = [];
            let config = xls.get(xls.dramaBaseData).get(1);
            for (const limit of config.inspireLimit) {
                this._totalTimes.push(limit);
            }
            this.listBuy.dataSource = config.inspire;
        }
        show() {
            clientCore.DialogMgr.ins.open(this);
            net.sendAndWait(new pb.cs_inspiring_panel()).then((data: pb.sc_inspiring_panel) => {
                if (!this._closed) {
                    this._timesArr = data.timesList.slice();
                    this.listBuy.startIndex = this.listBuy.startIndex;
                }
            })
            this.showTaskList()
        }

        private onListTaskRender(cell: ui.operaSide.render.OperaTaskRenderUI, idx: number) {
            let taskInfo = cell.dataSource as pb.ITask;
            let xlsTask = xls.get(xls.taskData).get(taskInfo.taskid);
            if (xlsTask) {
                cell.txt.text = `${xlsTask.task_content} (${taskInfo.step}/${xlsTask.task_condition.v3})`;
                let rwd = clientCore.LocalInfo.sex == 1 ? xlsTask.f_others_award : xlsTask.m_others_award;
                cell.list.dataSource = _.map(rwd, (o) => {
                    return {
                        ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) },
                        imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) },
                        num: { value: o.v2 },
                    }
                });
                cell.list.mouseHandler = new Laya.Handler(this, this.onTaskRewardMouse, [rwd]);
                cell.list.repeatX = rwd.length;
            }
            cell.btnGet.visible = taskInfo.state == clientCore.TASK_STATE.COMPLETE;
            cell.imgGet.visible = taskInfo.state == clientCore.TASK_STATE.REWARDED;
            cell.btnGo.visible = taskInfo.state < clientCore.TASK_STATE.COMPLETE;
        }

        private onTaskRewardMouse(rwd: xls.pair[], e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.target, { id: rwd[idx].v1 })
            }
        }

        private onListTaskMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let xlsInfo = xls.get(xls.taskData).get(this.listTask.getItem(idx).taskid);
                if (e.target.name == 'btnGet') {
                    clientCore.TaskManager.playAction(xlsInfo.task_id, "end", false);
                }
                else if (e.target.name == 'btnGo') {
                    clientCore.ToolTip.gotoMod(xlsInfo.system_interface);
                }
            }
        }

        private onListBuyRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as xls.triple;
            this.getByName(cell, 'imgIcon', Laya.Image).skin = `operaSide/icon${idx}.png`;
            this.getByName(cell, 'txtNum', Laya.Label).text = '+' + data.v3;
            this.getByName(cell, 'imgCoin', Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            this.getByName(cell, 'num', Laya.FontClip).value = data.v2.toString();
            this.getByName(cell, 'imgBot', Laya.Image).visible = this.getByName(cell, 'txtTimes', Laya.Label).visible = this._totalTimes[idx] > 0;
            if (this._totalTimes[idx] > 0) {
                this.getByName(cell, 'txtTimes', Laya.Label).text = '今日次数:' + this._timesArr[idx] + '/' + this._totalTimes[idx];
            }
            this.getByName(cell, 'btnGet', Laya.Button).disabled = this._timesArr[idx] >= this._totalTimes[idx] && this._totalTimes[idx] > 0;
        }

        private getByName<T extends Laya.Node>(cell: Laya.Box, name: string, type: { new(): T }): T {
            return cell.getChildByName(name) as T;
        }

        private _tmpIdx: number;
        private _tmpTimes: number;
        private onListBuyMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnGet') {
                let info = this.listBuy.getItem(idx) as xls.triple;
                let needId = info.v1;
                let needNum = info.v2;
                let addPointNum = info.v3;
                this._tmpIdx = idx;
                if (idx == 2) {
                    let buyInfo: alert.QuickBuyInfo = new alert.QuickBuyInfo(9900072);
                    buyInfo.singlePrice = needNum / addPointNum;
                    buyInfo.tokenID = needId;
                    buyInfo.stepNum = addPointNum;
                    buyInfo.maxCanBuyNum = 3000000;
                    buyInfo.haveNum = clientCore.ItemsInfo.getItemNum(9900072);
                    buyInfo.defaultBuyNum = 0;
                    buyInfo.caller = this;
                    buyInfo.cancelFun = () => { };
                    buyInfo.sureFun = (itemID: number, buyNum: number) => {
                        this._tmpTimes = buyNum / addPointNum;
                        this.sureBuy();
                    };
                    alert.quickBuy(buyInfo);
                }
                else {
                    this._tmpTimes = 1;
                    alert.buySecondConfirm(needId, needNum, `${addPointNum}点士气值?`, { caller: this, funArr: [this.sureBuy] });
                }
            }
        }

        private sureBuy() {
            clientCore.OperaSideManager.instance.buyMorale(this._tmpIdx, this._tmpTimes).then(() => {
                this._timesArr[this._tmpIdx] += 1;
                this.listBuy.startIndex = this.listBuy.startIndex;
            })
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private showTaskList() {
            this.listTask.dataSource = clientCore.TaskManager.getOperaSideTaskInfo();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            EventManager.on(globalEvent.TASK_STATE_CHANGE, this, this.showTaskList);
            EventManager.on(globalEvent.TASK_GET_REWARD, this, this.showTaskList);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.TASK_STATE_CHANGE, this, this.showTaskList);
            EventManager.off(globalEvent.TASK_GET_REWARD, this, this.showTaskList);
        }
    }
}