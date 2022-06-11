

namespace clientCore {
    /**
     * 活动图标
     */
    export class ActivityItem extends ui.main.item.ActivityItemUI implements util.IRedPoint {

        /** 活动ID*/
        private _id: number;
        private _cls: xls.activityIcon;
        /**点击后需要消除的勋章id */
        private _needRemoveDailyRedPoint: number;
        /**功能红点 */
        private _littleRed: boolean;
        /**每日红单 */
        private _dailyRed: boolean;
        /**一生一次红点 */
        private _onceRed: boolean;
        constructor() {
            super();
            this.on(Laya.Event.CLICK, this, this.onClick);
            this.r_tip.skin = 'res/activityIcon/icon/red.png';
            this.exchangeRed.visible = false;
            this.r_tip.visible = false;
        }

        public onRedChange(bool: boolean): void {
            this._littleRed = bool;
            this.redPoint = bool;
        }

        public destroy(): void {
            this._cls.littleRed.length > 0 && util.RedPoint.unregBtn(this);
            this._cls = null;
            BC.removeEvent(this);
            super.destroy();
        }

        /**
         * 设置ICON信息
         * @param id 活动ID
         */
        public set data(value: xls.activityIcon) {
            this._id = value.id;
            this._cls = value;
            //涉及三日奖励的活动根据情况显示icon
            /**包含三日奖励的活动 */
            if (value.iconName == 'callPlayer' || value.iconName == 'callPlayer2') {
                net.sendAndWait(new pb.cs_get_login_activity_status()).then((data: pb.sc_get_login_activity_status) => {
                    // let _currDay = data.days.length + 1;
                    // for (let i = 0; i < data.days.length; i++) {
                    //     if (data.days[i] == 0) {
                    //         _currDay = i + 1;
                    //         break;
                    //     }
                    // }
                    // _currDay = _.clamp(_currDay, 1, 3);
                    this.icon.skin = `res/activityIcon/icon/${value.iconName}${data.days.length}.png`;
                })
            } else {
                this.icon.skin = `res/activityIcon/icon/${value.iconName}.png`;
            }
            if (value.littleRed.length > 0) {
                util.RedPoint.regBtn(this, value.littleRed);
                this._littleRed = util.RedPoint.checkShow(value.littleRed);
                this.redPoint = this._littleRed;
            }
            if (value.dailyMedal) {
                clientCore.MedalManager.getMedal([value.dailyMedal]).then((o) => {
                    if (o[0].value == 0) {
                        if (value.id != 39 || clientCore.AnswerMgr.checkActivity()) {
                            /**部分活动特殊处理，以后如果太多的话加通用逻辑 */
                            if (value.id != 19 && value.id != 66) this._needRemoveDailyRedPoint = value.dailyMedal;
                            else BC.addEvent(this, EventManager, globalEvent.SPECIAL_DAILY_MEDAL, this, this.setDailyFalse);
                            this._dailyRed = true;
                            this.redPoint = true;
                        }
                    }
                })
            }
            if (value.onceMedal) {
                clientCore.MedalManager.getMedal([value.onceMedal]).then((o) => {
                    if (o[0].value == 0) {
                        this._onceRed = true;
                        this.redPoint = true;
                    }
                });
            }
            if (value.commonAwardRed) {
                this.checkCanExchange();
                BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.checkCanExchange);
                BC.addEvent(this, EventManager, globalEvent.MATERIAL_CHANGE, this, this.checkCanExchange);
                BC.addEvent(this, EventManager, globalEvent.CLOTH_CHANGE, this, this.checkCanExchange);
            }
        }

        private setDailyFalse(medal: number) {
            if (this.data.dailyMedal == medal) {
                this._dailyRed = false;
                this.redPoint = false;
            }
        }

        private checkCanExchange() {
            //如果有可兑换的，显示红点
            if (this._cls.commonAwardRed) {
                let arr = _.filter(xls.get(xls.commonAward).getValues(), o => o.type == this._cls.commonAwardRed);
                if (arr) {
                    let needRed = false;
                    for (const data of arr) {
                        let clothId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                        let have = clientCore.ItemsInfo.getItemNum(clothId) > 0;
                        if (!have && clientCore.ItemsInfo.getItemLackNum({ itemID: data.num.v1, itemNum: data.num.v2 }) <= 0) {
                            needRed = true;
                            break;
                        }
                    }
                    this.exchangeRed.visible = needRed;
                }
            }
        }

        public set redPoint(bool: boolean) {
            this.r_tip.visible = this._dailyRed || this._onceRed || this._littleRed;
        }

        public get id(): number {
            return this._id;
        }

        public get data(): xls.activityIcon {
            return this._cls;
        }

        private onClick(): void {
            let data: xls.systemTable = xls.get(xls.systemTable).get(this._cls.relationSystem);

            //心灵之囚活动特殊处理 第一次打开需要在另一个模块之中 cry T_T
            if (data.id == 108) {
                clientCore.MedalManager.getMedal([MedalConst.SECRETROOM_1]).then((msg: pb.ICommonData[]) => {
                    let frist: boolean = msg[0].value == 0;
                    if (frist) {
                        ModuleManager.open('secretroom.SecretroomModule', 1);
                    } else {
                        let module: xls.moduleOpen = xls.get(xls.moduleOpen).get(data.moduleOpenId);
                        ModuleManager.open(module.name, module.extraData);
                    }
                })
            } else {
                let module: xls.moduleOpen = xls.get(xls.moduleOpen).get(data.moduleOpenId);
                ModuleManager.open(module.name, module.extraData);
            }

            if (this._needRemoveDailyRedPoint) {
                clientCore.MedalManager.setMedal([{ id: this._needRemoveDailyRedPoint, value: 1 }]);
                this._dailyRed = false;
                this.redPoint = false;
            }
            if (this._cls.onceMedal && this.r_tip.visible) {
                clientCore.MedalManager.setMedal([{ id: this._cls.onceMedal, value: 1 }]);
                this._onceRed = false;
                this.redPoint = false;
            }
        }
    }
}