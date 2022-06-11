namespace moonStory {
    export class SsxyBuyPanel extends ui.moonStory.panel.SsxyBuyPanelUI {
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listNowReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listReward.mouseHandler = new Laya.Handler(this, this.listMouse, [0]);
            this.listNowReward.mouseHandler = new Laya.Handler(this, this.listMouse, [1]);
            this.show();
        }

        public show() {
            let model = clientCore.CManager.getModel(this._sign) as MoonStoryModel;
            let configs = xls.get(xls.medalChallenge).getValues();
            let totalReward: xls.pair[] = [];
            let nowReward: xls.pair[] = [];
            for (let i: number = 0; i < configs.length; i++) {
                let reward = clientCore.LocalInfo.sex == 1 ? configs[i].femaleCredit : configs[i].maleCredit;
                for (let j: number = 0; j < reward.length; j++) {
                    let indexTotal = _.findIndex(totalReward, (o) => { return o.v1 == reward[j].v1 });
                    if (indexTotal >= 0) {
                        totalReward[indexTotal].v2 += reward[j].v2;
                    } else {
                        let _new = new xls.pair();
                        _new.v1 = reward[j].v1;
                        _new.v2 = reward[j].v2;
                        totalReward.push(_new);
                    }
                    if (configs[i].cost <= model.activeValue) {
                        let indexNow = _.findIndex(nowReward, (o) => { return o.v1 == reward[j].v1 });
                        if (indexNow >= 0) {
                            nowReward[indexNow].v2 += reward[j].v2;
                        } else {
                            let _new = new xls.pair();
                            _new.v1 = reward[j].v1;
                            _new.v2 = reward[j].v2;
                            nowReward.push(_new);
                        }
                    }
                }
            }
            let active = new xls.pair();
            active.v1 = 9900019;
            active.v2 = 500;
            totalReward.unshift(active);
            this.listReward.array = totalReward;
            this.listReward.repeatX = totalReward.length;
            this.listNowReward.array = nowReward;
            this.listNowReward.repeatX = nowReward.length;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        private listMouse(flag: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (flag == 0) {
                    clientCore.ToolTip.showTips(this.listReward.cells[index], { id: this.listReward.array[index].v1 });
                } else {
                    clientCore.ToolTip.showTips(this.listNowReward.cells[index], { id: this.listNowReward.array[index].v1 });
                }
            }
        }

        private buy() {
            clientCore.RechargeManager.pay(42).then((data) => {
                // alert.showReward(data.items);
                let model = clientCore.CManager.getModel(this._sign) as MoonStoryModel;
                model.medalBuyStatus = 1;
                model.activeValue += 500;
                this.onClose();
                EventManager.event("MOONSTORY_MEDAL_ACTIVE");
            });
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buy);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}