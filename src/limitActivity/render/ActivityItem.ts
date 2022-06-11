namespace limitActivity {
    /**
     * 活动单元
     */
    export class ActivityItem extends ui.limitActivity.render.ActivityItemUI implements util.IRedPoint {
        private _cfg: xls.limitActivity;
        /** 每日红点*/
        private _dailyRed: boolean;
        /** 点击后需要消除的勋章id */
        private _needRemoveDailyRedPoint: number;
        /** 一生一次红点*/
        private _onceRed: boolean;
        /** 服务红点*/
        private _svrRed: boolean;
        /** 兑换红点*/
        private _exchageRed: boolean;
        constructor() { super(); }

        public setInfo(caller: LimitActivityModule, value: xls.limitActivity) {
            this._cfg = value;
            this.imgRed.visible = false;
            //检查服务器红点
            if (value.littleRed.length > 0) {
                util.RedPoint.unregBtn(this);
                util.RedPoint.regBtn(this, value.littleRed);
                this._svrRed = util.RedPoint.checkShow(value.littleRed);
            } else {
                this._svrRed = false;
            }
            //检查一生一次红点
            if (value.onceMedal) {
                clientCore.MedalManager.getMedal([value.onceMedal]).then((o) => {
                    if (o[0].value == 0) {
                        this._onceRed = true;
                    }
                });
            } else {
                this._onceRed = false;
            }
            //检查每日红点
            if (value.dailyMedal) {
                clientCore.MedalManager.getMedal([value.dailyMedal]).then((o) => {
                    if (o[0].value == 0) {
                        if (value.id != 39 || clientCore.AnswerMgr.checkActivity()) {
                            /**部分活动特殊处理，以后如果太多的话加通用逻辑 */
                            if (value.id != 19 && value.id != 66) this._needRemoveDailyRedPoint = value.dailyMedal;
                            else BC.addEvent(this, EventManager, globalEvent.SPECIAL_DAILY_MEDAL, this, this.setDailyFalse);
                            this._dailyRed = true;
                            this.updateRed();
                        }
                    }
                })
            } else {
                this._dailyRed = false;
            }
            //兑换红点
            if (value.commonAwardRed) {
                this._exchageRed = clientCore.LimitActivityMgr.checkCanExchangeByType(value.relationActivity);
            } else {
                this._exchageRed = false;
            }
            this.updateRed();
            //点击注册
            BC.addEvent(caller, this, Laya.Event.CLICK, this, this.onClick);
            //ui初始化
            let cfg: xls.eventControl = xls.get(xls.eventControl).get(value.relationActivity);
            let time: string[] = cfg.eventTime.split('_');
            let sDate: Date = new Date(time[0].replace(/-/g, '/'));
            let eDate: Date = new Date(time[1].replace(/-/g, '/'));
            if ((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24) > 365) {
                this.timeTxt.changeText("活动时间：常驻");
            } else {
                time = cfg.eventTimeShow.split('_');
                sDate = new Date(time[0].replace(/-/g, '/'));
                eDate = new Date(time[1].replace(/-/g, '/'));
                this.timeTxt.changeText(`活动时间：${sDate.getMonth() + 1}/${sDate.getDate()}~${eDate.getMonth() + 1}/${eDate.getDate()}`);
            }
            this.imgIcon.skin = pathConfig.getLimitActivityIco(value.img);
        }

        public onRedChange(b: boolean): void {
            this._svrRed = b;
        }

        private updateRed(): void {
            this.imgRed.visible = this._svrRed || this._dailyRed || this._onceRed || this._exchageRed;
        }

        private setDailyFalse(medal: number) {
            if (this._cfg.dailyMedal == medal) {
                this._dailyRed = false;
                this.updateRed();
            }
        }

        private onClick(): void {
            if (this._needRemoveDailyRedPoint) {
                clientCore.MedalManager.setMedal([{ id: this._needRemoveDailyRedPoint, value: 1 }]);
                this.updateRed();
            }
            if (this._cfg.onceMedal && this.imgRed.visible) {
                clientCore.MedalManager.setMedal([{ id: this._cfg.onceMedal, value: 1 }]);
                this.updateRed();
            }
            let cfg: xls.eventControl = xls.get(xls.eventControl).get(this._cfg.relationActivity);
            let module: xls.moduleOpen = xls.get(xls.moduleOpen).get(cfg.relatedModule);
            clientCore.ModuleManager.closeModuleByName('limitActivity');
            clientCore.ModuleManager.open(module.name, module.extraData);
            clientCore.Logger.sendLog('活动', '限时活动触达', this._cfg.stat);
        }
    }
}