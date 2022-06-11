namespace rechargeActivity {
    export class ContinueRechargePanel extends BasePanel {
        private _totalDay: number;
        private _curDay: number;
        private _curSelectIndex = 0;

        constructor() {
            super();
        }

        init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info) {
            super.init(data, info);
            this._totalDay = data.length;
            this._mainUI = new ui.rechargeActivity.panel.ContinueRechargePanelUI();
            this.addChild(this._mainUI);
            this.initPanel();
            this.addEventListenters();
            this._mainUI["rewardDetailList"].mouseHandler = new Laya.Handler(this, this.onShowTips);
        }

        initPanel() {

            this._curDay = this.rechargeInfo.sequencePayCurDay;
            for (let i = 1; i < 6; i++) {
                if (i <= this._curDay) {
                    this._mainUI["btnDay_" + i].skin = "rechargeActivity/open_" + i + "_" + clientCore.LocalInfo.sex + ".png";
                    this._mainUI["imgDay_" + i].visible = false;
                    this._mainUI["imgLock_" + i].visible = false;
                }
                this._mainUI["imgLock_" + i].mouseEnabled = false;
            }

            this.onDaySelect(this._curDay > 5 ? 5 : this._curDay);
        }

        refresh() {
            let index = this._curSelectIndex;
            this._curSelectIndex = 0;
            this.onDaySelect(index);
        }

        addEventListenters() {
            super.addEventListenters();
            BC.addEvent(this, this._mainUI["btnGetReward"], Laya.Event.CLICK, this, this.onGetRewardClick);
            BC.addEvent(this, this._mainUI["btnTry"], Laya.Event.CLICK, this, this.onTry);
            for (let i = 1; i < 6; i++) {
                BC.addEvent(this, this._mainUI["btnDay_" + i], Laya.Event.CLICK, this, this.onDaySelect, [i]);
            }
        }

        onDaySelect(index: number) {
            if (index == this._curSelectIndex) {
                return;
            }
            this._curSelectIndex = index;
            console.log("点击对象：" + index);
            for (let i = 1; i < 6; i++) {
                if (i > this._curDay) {
                    this._mainUI["btnDay_" + i].skin = "rechargeActivity/lock_" + i + "_" + clientCore.LocalInfo.sex + ".png";
                    this._mainUI["imgDay_" + i].skin = "rechargeActivity/lockWord_" + i + ".png";
                }
                let sp = this._mainUI["btnDay_" + i];
                sp.filters = i == index ? [new Laya.GlowFilter('0xffff00', 10, 0, 0)] : [];
                if (i == index)
                    sp.parent.addChild(sp);
            }
            if (index > this._curDay) {
                this._mainUI["btnDay_" + index].skin = "rechargeActivity/open_" + index + "_" + clientCore.LocalInfo.sex + ".png";
                this._mainUI["imgDay_" + index].skin = "rechargeActivity/openWord_" + index + ".png";
            }
            this.showRewardByIndex(index);
        }

        private showRewardByIndex(index: number) {
            this._mainUI["btnGetReward"].disabled = false;
            if (index > this._curDay) {
                this._mainUI["btnGetReward"].fontSkin = "commonBtn/s_y_back tomorrow.png";
                this._mainUI["btnGetReward"].disabled = true;
                this._mainUI["btnGetReward"].visible = true;
            } else if (index == this._curDay) {
                if (this.rechargeInfo.dailySequencePayCnt >= 10) {
                    this._mainUI["btnGetReward"].fontSkin = "commonBtn/s_y_Reward.png";
                    this._mainUI["btnGetReward"].visible = util.getBit(this.rechargeInfo.sequencePayStatus, index) == 0;
                } else {
                    this._mainUI["btnGetReward"].fontSkin = "commonBtn/T_y_chongzhi.png";
                    this._mainUI["btnGetReward"].visible = true;
                }
            } else {
                if (util.getBit(this.rechargeInfo.sequencePayStatus, index) == 0) {
                    this._mainUI["btnGetReward"].fontSkin = "commonBtn/s_y_Reward.png";
                    this._mainUI["btnGetReward"].visible = true;
                } else {
                    this._mainUI["btnGetReward"].visible = false;
                }
            }
            this._mainUI["mcRewardGetState"].visible = util.getBit(this.rechargeInfo.sequencePayStatus, index) == 1;

            let rewardArr = clientCore.LocalInfo.sex == 1 ? this.oriDataArr[index - 1].rewardFamale : this.oriDataArr[index - 1].rewardMale;
            this._mainUI["rewardDetailList"].dataSource = _.map(rewardArr, (o) => {
                return {
                    id: o.v1,
                    num: {value: o.v2.toString()},
                    ico: {skin: clientCore.ItemsInfo.getItemIconUrl(o.v1)},
                    txtName: {text: clientCore.ItemsInfo.getItemName(o.v1), visible: true},
                    imgBg: {skin: clientCore.ItemsInfo.getItemIconBg(o.v1)}
                }
            });
            this._mainUI["rewardDetailList"].repeatX = rewardArr.length;
        }

        private onShowTips(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id: number = e.currentTarget['dataSource'].id;
                if (id >= 3900013 && id <= 3900022) {
                    clientCore.ToolTip.showContentTips(e.currentTarget, 0, _.map(xls.get(xls.itemBag).get(id).include, (element: xls.triple) => {
                        return {v1: element.v1, v2: element.v2};
                    }));
                    return;
                }

                clientCore.ToolTip.showTips(e.currentTarget as Laya.Sprite, {id: id})
            }
        }

        private onGetRewardClick(e: Laya.Event) {
            //获取奖励
            const doGetReward: () => void = () => {
                this.getReward(this.type, this._curSelectIndex).then(succ => {
                    succ && clientCore.Logger.sendLog('2021年8月20日活动', '【付费】蒸汽迷梦连充', `领取连充第${this._curSelectIndex}天奖励`);
                });
            };
            if (this._curSelectIndex == this._curDay) {
                if (this.rechargeInfo.dailySequencePayCnt < 10) {
                    clientCore.ModuleManager.closeModuleByName("rechargeActivity");
                    clientCore.ModuleManager.open('moneyShop.MoneyShopModule');
                } else {
                    doGetReward();
                }
            } else {
                doGetReward();
            }
        }

        private onTry(): void {
            alert.showCloth(2110468);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}