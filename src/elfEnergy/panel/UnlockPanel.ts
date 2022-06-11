namespace elfEnergy {
    interface IUnlockInfo {
        id: number,
        txt: string
        ok: boolean
        taskProgress?: number[]
    }
    export class UnlockPanel extends ui.elfEnergy.panel.UnlockPanelUI {
        private _id: number;
        private _xlsInfo: xls.elfEnergy;
        constructor() {
            super();
            this.listCondition.renderHandler = new Laya.Handler(this, this.onListConditonRender);
            this.listCondition.mouseHandler = new Laya.Handler(this, this.onListConditonMouse);
        }

        show(id: number) {
            this._id = id;
            clientCore.DialogMgr.ins.open(this);
            this._xlsInfo = xls.get(xls.elfEnergy).get(id);
            if (this._xlsInfo.unlock.v1 == 2) {
                this.listCondition.visible = false;
                this.boxRwd.visible = true;
                let itemId = this._xlsInfo.unlock.v2;
                this.boxRwd.ico.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
                this.boxRwd.num.value = this._xlsInfo.unlock.v3.toString();
                this.boxRwd.txtName.text = clientCore.ItemsInfo.getItemName(itemId);
                this.btnAwake.disabled = clientCore.ItemsInfo.getItemNum(itemId) < this._xlsInfo.unlock.v3;
            }
            else {
                this.listCondition.visible = true;
                this.boxRwd.visible = false;
                let arr = this.getConditionObj(id);
                this.listCondition.dataSource = arr;
                this.btnAwake.disabled = _.findIndex(arr, (o) => {
                    return !o.ok
                }) > -1
            }
            this.txtLimit.text = '能量收集上限：' + xls.get(xls.userLevel).get(clientCore.LocalInfo.userLv).energy;
            let recoverPower = xls.get(xls.globaltest).get(1).fairyPower;
            this.txtSpeed.text = `能量收集速度：${recoverPower.v1}点/${recoverPower.v2}秒`;
        }

        private onListConditonRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as IUnlockInfo;
            let txt = cell.getChildByName('txtCondition') as Laya.HTMLDivElement;
            let imgOk = cell.getChildByName('imgOk') as Laya.Image;
            let bgnGO = cell.getChildByName('btnGo') as Laya.Button;
            bgnGO.visible = false;
            imgOk.visible = true;
            imgOk.skin = data.ok ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            txt.style.fontSize = 24;
            txt.style.width = 400;
            let str = util.StringUtils.getColorText(data.txt, '#805329');
            if (data.taskProgress) {
                let isFullColor = data.taskProgress[0] >= data.taskProgress[1] ? '#805329' : '#f9606e';
                str += util.StringUtils.getColorText2(['(', '#805329', data.taskProgress[0].toString(), isFullColor, `/${data.taskProgress[1].toString()})`, '#805329'])
            }
            txt.innerHTML = str;
            //特权特殊处理(如果没有特权，显示前往按钮)
            let req = xls.get(xls.elfEnergy).get(data.id).unlock;
            if (req.v1 == 0 && !data.ok) {
                bgnGO.visible = true;
                imgOk.visible = false;
            }
        }

        private onListConditonMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnGo') {
                clientCore.ToolTip.gotoMod(52);
            }
        }

        private getConditionObj(id: number): IUnlockInfo[] {
            let rtns: IUnlockInfo[] = [];
            let req = xls.get(xls.elfEnergy).get(id).unlock;
            if (req.v1 == 0) {
                //vip特权解锁
                let rtn: IUnlockInfo = { id: id, txt: '', ok: false };
                switch (req.v2) {
                    case 1:
                        rtn.txt = '获得奇妙花宝后自动解锁';
                        rtn.ok = clientCore.FlowerPetInfo.petType >= 1;
                        break;
                    case 2:
                        rtn.txt = '获得闪亮花宝后自动解锁';
                        rtn.ok = clientCore.FlowerPetInfo.petType >= 2;
                        break;
                    case 3:
                        rtn.txt = '获得闪耀花宝后自动解锁';
                        rtn.ok = clientCore.FlowerPetInfo.petType >= 3;
                        break;
                }
                rtns.push(rtn);
            }
            if (req.v1 == 1) {
                //任务解锁
                let tasks = xls.get(xls.elfEnergy).get(id).currency;
                rtns = _.map(tasks, (taskId) => {
                    let xlsTask = xls.get(xls.taskData).get(taskId);
                    let taskData = clientCore.TaskManager.getTaskById(taskId);
                    let rtn: IUnlockInfo = { id: id, txt: '', ok: false, taskProgress: [] }
                    rtn.txt = xlsTask?.task_target ? xlsTask?.task_target : `${taskId}无任务目标`;
                    rtn.ok = taskData ? taskData.state == clientCore.TASK_STATE.COMPLETE : true;//没有任务 代表已完成
                    rtn.taskProgress = taskData ? [taskData.step, xlsTask.task_condition.v3] : [xlsTask.task_condition.v3, xlsTask.task_condition.v3];
                    return rtn
                })
            }
            return rtns;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnAwake, Laya.Event.CLICK, this, this.onAwakeClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onAwakeClick() {
            clientCore.BuildQueueManager.unlock(this._id).then(() => {
                this.onClose();
                this.event(Laya.Event.COMPLETE);
            });
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}