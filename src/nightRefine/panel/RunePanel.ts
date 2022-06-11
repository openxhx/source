namespace nightRefine{
    /**
     * 符文激活
     */
    export class RunePanel extends ui.nightRefine.panel.RunePanelUI{
        private _model: NightRefineModel;
        private _id: number;
        show(id: number,sign: number): void{
            this._id = id;
            this._model = clientCore.CManager.getModel(sign) as NightRefineModel;
            let cfg: xls.taskData = xls.get(xls.taskData).get(id);
            this.imgIco.skin = `nightRefine/${id - this._model.BASE_TASK}.png`;
            this.txDesc.text = cfg.task_content;
            //条件
            let msg: pb.ITask = this._model.getTask(id);
            this.txtHas.text = `${cfg.task_target}(${msg.step}/${cfg.task_condition.v3})`;
            //前往
            this.btnGo.disabled = !cfg.system_interface || cfg.system_interface == this._model.MODULE_ID;
            this.btnGo.disabled == false && BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goMod, [cfg.system_interface]);
            this.btnActive.disabled = msg.step < cfg.task_condition.v3;
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._model = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnActive, Laya.Event.CLICK, this, this.onActive);
            
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        /** 激活*/
        private onActive(): void{
            this.hide();
            clientCore.TaskManager.getRefine(this._id);
        }

        private goMod(mod: number): void{
            clientCore.ToolTip.gotoMod(mod);
        }
    }
}