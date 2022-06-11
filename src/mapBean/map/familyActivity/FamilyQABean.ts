namespace mapBean {
    export class FamilyQABean implements IFamilyActivity {
        private _destory: boolean;
        private _mainUI: ui.familyQABean.FamilyQABeanUI;
        /**能参加的答题的起始时间戳 */
        private _qaInfo: pb.IFamilyActivity;
        start(info: pb.IFamilyActivity) {
            this.initFamilyQAUI(info);
        }

        private initFamilyQAUI(info: pb.IFamilyActivity) {
            this._mainUI = new ui.familyQABean.FamilyQABeanUI();
            clientCore.LayerManager.uiLayer.addChild(this._mainUI);
            this._mainUI.anchorX = 0.5;
            this._mainUI.x = Laya.stage.width / 2;
            this._mainUI.y = 10;
            this._qaInfo = info;
            this.updateQAUIByTime();
            Laya.timer.loop(500, this, this.onQaTimer);
            Laya.timer.loop(8000, this, this.onReqPeopleNum);
            net.listen(pb.sc_notify_family_activity_finish, this, this.onQAFinish);
            BC.addEvent(this, this._mainUI.btnWatch, Laya.Event.CLICK, this, this.onJoin);
            BC.addEvent(this, this._mainUI.btnJoin, Laya.Event.CLICK, this, this.onJoin);
        }

        private checkQAIsOver(info: pb.IFamilyActivity) {
            return clientCore.ServerManager.curServerTime > info.endTime;
        }

        private onQAFinish(data: pb.sc_notify_family_activity_finish) {
            this._qaInfo = data.activity;
            this.updateQAUIByTime();
            if(data.activity.count == 0){
                this.destroy();
            }
        }

        private onReqPeopleNum() {
            net.sendAndWait(new pb.cs_get_family_answer_activity_info()).then((data: pb.sc_get_family_answer_activity_info) => {
                if (!this._destory) {
                    this._qaInfo.people = data.people;
                    this.updateQAUIByTime();
                }
            })
        }

        private updateQAUIByTime() {
            this._mainUI.txtNum1.text = this._mainUI.txtNum2.text = this._qaInfo.people.toString();
            let now = clientCore.ServerManager.curServerTime;
            let joinStart = this._qaInfo.startTime - 600;//开始前10分钟
            let joinEnd = this._qaInfo.startTime;
            this._mainUI.visible = !this.checkQAIsOver(this._qaInfo) && now >= joinStart;
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
            let mod = await clientCore.ModuleManager.open('familyQA.FamilyQAModule', this._qaInfo.startTime);
            mod.once(Laya.Event.CLOSE, this, () => {
                if (!this._destory) {
                    Laya.timer.loop(5000, this, this.onReqPeopleNum);
                }
            })
        }

        destroy() {
            Laya.timer.clear(this, this.onQaTimer);
            Laya.timer.clear(this, this.onReqPeopleNum);
            net.unListen(pb.sc_notify_family_activity_finish, this, this.onQAFinish);
            this._destory = true;
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
    }
}