namespace mapBean {
    export class FamilyPartyBean implements IFamilyActivity {
        private _destroy: boolean = false;
        private _acivityInfo: pb.IFamilyActivity;
        private _mainUI: ui.familyQABean.FamilyPartyBeanUI;
        start(data?: any): void {
            this._acivityInfo = data;
            this.initFamilyPartyUI();
        }
        initFamilyPartyUI(){
            this._mainUI = new ui.familyQABean.FamilyPartyBeanUI();
            clientCore.LayerManager.uiLayer.addChild(this._mainUI);
            this._mainUI.anchorX = 0.5;
            this._mainUI.x = Laya.stage.width / 2;
            this._mainUI.y = 10;
            Laya.timer.loop(500, this, this.updateUIByTime);
            net.listen(pb.sc_notify_family_activity_finish, this, this.onColorBlockFinish);
            BC.addEvent(this, this._mainUI.btnEnter, Laya.Event.CLICK, this, this.onJoin);
            this.updateUIByTime();
        }

        private updateUIByTime() {
            let now = clientCore.ServerManager.curServerTime;
            let joinStart = this._acivityInfo.startTime - 600;//开始前10分钟
            let joinEnd = this._acivityInfo.startTime + 2;//跳地图，前端加2S延迟
            this._mainUI.visible = now < this._acivityInfo.endTime && now >= joinStart;
            if (_.inRange(now, joinStart, joinEnd)) {
                this._mainUI.txtTitle.text = "家族聚会即将开始";
                this._mainUI.txtTimeInfo.text = "开始倒计时：";
                this._mainUI.btnEnter.disabled = true;
                this._mainUI.txtTime.text = util.StringUtils.getDateStr(joinEnd - now);
            }
            else {
                this._mainUI.txtTitle.text = "家族聚会进行中";
                this._mainUI.txtTimeInfo.text = "结束倒计时：";
                this._mainUI.btnEnter.disabled = false;
                this._mainUI.txtTime.text = util.StringUtils.getDateStr(this._acivityInfo.endTime - now);
            }
        }

        private onColorBlockFinish(data: pb.sc_notify_family_activity_finish) {
            this._acivityInfo = data.activity;
            if(data.activity.count == 0){
                this.destroy();
            }
        }
        private async onJoin() {
            clientCore.MapManager.enterFamily(clientCore.FamilyMgr.ins.familyId, 20);
        }

        destroy() {
            Laya.timer.clear(this, this.updateUIByTime);
            net.unListen(pb.sc_notify_family_activity_finish, this, this.onColorBlockFinish);
            BC.removeEvent(this);
            this._destroy = true;
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
    }
}