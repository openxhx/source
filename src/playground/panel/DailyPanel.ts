namespace playground {
    /**
     * 每日领取
     */
    export class DailyPanel extends ui.playground.panel.ReceivePanelUI {
        private _cls: xls.gardenCommonData;
        private _model: PlaygroundModel;
        private _control: PlaygroundControl;
        constructor() {
            super();

        }
        show(sign: number): void {
            this._model = clientCore.CManager.getModel(sign) as PlaygroundModel;
            this._control = clientCore.CManager.getControl(sign) as PlaygroundControl;
            this.initView();
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._cls = this._model = this._control = null;
            super.destroy();
        }
        private initView(): void {
            this._cls = xls.get(xls.gardenCommonData).get(1);
            let data: xls.pair[] = this._cls.diceDailyGet;
            //每日领取
            this.dailyTxt.changeText('x' + data[0].v1);
            //奇妙花宝领取
            this.petNormalTxt.changeText('x' + data[1].v1);
            this.petSpecialTxt.changeText('x' + data[1].v2);
            //领取状态
            for (let i: number = 1; i <= 3; i++) { this.updateStatus(i); }
            //任务状态
            let task: xls.taskData = xls.get(xls.taskData).get(this._cls.diceDailyTask);
            let msg: pb.ITask = clientCore.TaskManager.playgroundTask(task.task_id);
            this.taskDescTxt.changeText(`完成拉贝尔秘闻2次(${msg ? msg.step : 0}/${task.task_condition.v3})`);
        }
        /**
         * 更新状态
         * @param index 
         */
        private updateStatus(index: number): void {
            let status: number = this._model.diceInfo[index - 1] >> 0;
            let btn: component.HuaButton = this['btn_' + index];
            let isGet: boolean = status == 0;
            this['has_' + index].visible = isGet;
            btn.visible = !isGet;
            if (!isGet) btn.fontSkin = status == 1 ? 'commonBtn/l_p_get.png' : 'commonBtn/T_p_go.png';
        }

        private onClick(index: number): void {
            let status: number = this._model.diceInfo[index - 1] >> 0;
            if (status == 0) return;
            if (status == 1) { //可领
                this._control.getDaily(index, new Laya.Handler(this, () => {
                    this._model.diceInfo[index - 1] = 0;
                    this.updateStatus(index);
                    util.RedPoint.reqRedPointRefresh(9602);
                }))
            } else if (status == 2) { //未完成
                let mod: number;
                if (index == 2) {
                    mod = 52;
                } else {
                    let task: xls.taskData = xls.get(xls.taskData).get(this._cls.diceDailyTask);
                    mod = task.system_interface;
                }
                EventManager.event(PlaygroundConst.GO_MODULE, mod);
            }
        }
    }
}