namespace clientCore {
    /**
     * 好感度任务
     */
    export class FavorTaskPanel extends ui.main.panel.FavorTaskPanelUI {
        constructor() { super(); }

        onAwake(): void {
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
            this.ani1.gotoAndStop(0);
            this.btnOpen.on(Laya.Event.CLICK,this,this.onBtnOpenClick);
            this.btnClose.on(Laya.Event.CLICK,this,this.onBtnCloseClick);
            this.btnTop.on(Laya.Event.CLICK, this, this.onClick, [0]);
            this.btnBottom.on(Laya.Event.CLICK, this, this.onClick, [1]);
            EventManager.on(globalEvent.UPDATE_FAVORTASK, this, this.updateView);
            EventManager.on(globalEvent.UPDATE_FAVORTASK_ITEM, this, this.updateView);
            this.updateView();
        }

        private updateView(): void {
            let _array: FavorTaskInfo[] = FavorTaskMgr.ins.taskMap.getValues();
            this.visible = _array.length > 0;
            if (this.visible) {
                this.btnBottom.visible = this.btnTop.visible = _array.length >= 3;
                this.list.array = _array;
            }
        }

        private listRender(item: ui.main.item.TaskNpcItemUI, index: number): void {
            let info: FavorTaskInfo = this.list.array[index];
            item.ico.skin = pathConfig.getRoleIcon(info.roleId);
            item.spMask.y = (1 - info.progress) * 62;
            item.imgTip.skin = info.svrData.flag == 1 ? "main/icon_new.png" : (!info.checkFinish() ? "main/icon_gantan1.png" : "main/icon_yes1.png");
        }

        private listSelect(index: number): void {
            if (index == -1) return;
            let info: FavorTaskInfo = this.list.array[index];
            clientCore.FavorTaskMgr.ins.handlerTask(info.roleId);
            this.list.selectedIndex = -1;
            this.deleteFlag(index, info);
        }

        /**
         * 清理标记
         * @param index 
         * @param info 
         */
        private deleteFlag(index: number, info: FavorTaskInfo): void {
            if (info.svrData.flag != 1) return;
            info.svrData.flag = 0;
            this.list.changeItem(index, info);
            net.send(new pb.cs_delete_favor_task_flag({ roleid: info.roleId, taskid: info.taskId }));
        }

        private onClick(type: number): void {
            if (this.list.array.length > 3) {
                let max: number = this.list.scrollBar.max;
                let value: number = this.list.scrollBar.value;
                value = type == 0 ? Math.max(value - 261, 0) : Math.min(max, value + 261);
                this.list.tweenTo(Math.floor(value / max));
            }
        }

        private onBtnOpenClick():void{
            this.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
            this.ani1.play(0,false);
        }

        private onBtnCloseClick():void{
            this.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
            this.ani1.play(0,false);
        }
    }
}