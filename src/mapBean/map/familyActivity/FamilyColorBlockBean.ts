namespace mapBean {
    export class FamilyColorBlockBean implements IFamilyActivity {
        private _destroy: boolean = false;
        private _acivityInfo: pb.IFamilyActivity;
        private _mainUI: ui.familyQABean.FamilyQABeanUI;
        start(data?: any): void {
            this._acivityInfo = data;
            this.initColorBlockUI(this._acivityInfo);
        }
        private initColorBlockUI(info: pb.IFamilyActivity) {
            this._mainUI = new ui.familyQABean.FamilyQABeanUI();
            this._mainUI.txtTitle.text = "四色之祭正在进行中";
            clientCore.LayerManager.uiLayer.addChild(this._mainUI);
            this._mainUI.anchorX = 0.5;
            this._mainUI.x = Laya.stage.width / 2;
            this._mainUI.y = 10;
            this.updateQAUIByTime();
            Laya.timer.loop(500, this, this.onQaTimer);
            Laya.timer.loop(8000, this, this.onReqPeopleNum);
            net.listen(pb.sc_notify_family_activity_finish, this, this.onColorBlockFinish);
            BC.addEvent(this, this._mainUI.btnWatch, Laya.Event.CLICK, this, this.onJoin);
            BC.addEvent(this, this._mainUI.btnJoin, Laya.Event.CLICK, this, this.onJoin);
        }
        
        private checkQAIsOver(info: pb.IFamilyActivity) {
            return clientCore.ServerManager.curServerTime > info.endTime;
        }

        private onColorBlockFinish(data: pb.sc_notify_family_activity_finish) {
            this._acivityInfo = data.activity;
            this.updateQAUIByTime();
            if(data.activity.count == 0){
                this.destroy();
            }
        }

        private onReqPeopleNum() {
            net.sendAndWait(new pb.cs_refresh_family_activity_info({eventId:4})).then((data: pb.sc_refresh_family_activity_info) => {
                if (!this._destroy) {
                    this._acivityInfo.people = data.people;
                    this.updateQAUIByTime();
                }
            })
        }

        private updateQAUIByTime() {
            this._mainUI.txtNum1.text = this._mainUI.txtNum2.text = this._acivityInfo.people.toString();
            let now = clientCore.ServerManager.curServerTime;
            let joinStart = this._acivityInfo.startTime - 600;//开始前10分钟
            let joinEnd = this._acivityInfo.startTime;
            this._mainUI.visible = !this.checkQAIsOver(this._acivityInfo) && now >= joinStart;
            if (_.inRange(now, joinStart, joinEnd)) {
                this._mainUI.boxJoin.visible = true;
                this._mainUI.boxWatch.visible = false;
                this._mainUI.txtTime.text = util.StringUtils.getDateStr(joinEnd - now);
            }
            else {
                this._mainUI.boxJoin.visible = false;
                this._mainUI.boxWatch.visible = true;
            }
        }

        private onQaTimer() {
            this.updateQAUIByTime();
        }

        private async onJoin() {
            Laya.timer.clear(this, this.onReqPeopleNum);
            let mod = await clientCore.ModuleManager.open('familyColorBlock.FamilyColorBlockModule', this._acivityInfo.startTime);
            mod.once(Laya.Event.CLOSE, this, () => {
                if (!this._destroy) {
                    Laya.timer.loop(5000, this, this.onReqPeopleNum);
                }
            })
        }

        destroy() {
            Laya.timer.clear(this, this.onQaTimer);
            Laya.timer.clear(this, this.onReqPeopleNum);
            net.unListen(pb.sc_notify_family_activity_finish, this, this.onColorBlockFinish);
            BC.removeEvent(this);
            this._destroy = true;
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
    }
}
