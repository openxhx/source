namespace springMedal {
    export class MedalBuyPanel extends ui.springMedal.panel.MedalBuyPanelUI {
        private _sign: number;
        private _isAdult: Boolean = clientCore.LocalInfo.age >= 18;;

        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
            this.listAll30.renderHandler = new Laya.Handler(this, this.listRender);
            this.listAll128.renderHandler = new Laya.Handler(this, this.listRender);
            this.listNow30.renderHandler = new Laya.Handler(this, this.listRender);
            this.listNow128.renderHandler = new Laya.Handler(this, this.listRender);
            this.listAll30.mouseHandler = new Laya.Handler(this, this.listMouse, [0]);
            this.listAll128.mouseHandler = new Laya.Handler(this, this.listMouse, [1]);
            this.listNow30.mouseHandler = new Laya.Handler(this, this.listMouse, [2]);
            this.listNow128.mouseHandler = new Laya.Handler(this, this.listMouse, [3]);
            this.show();
        }

        public show() {
            let model = clientCore.CManager.getModel(this._sign) as SpringMedalModel;
            let configs = xls.get(xls.medalChallenge).getValues();
            let total30Reward: xls.pair[] = [];
            let now30Reward: xls.pair[] = [];
            let total128Reward: xls.pair[] = [];
            let now128Reward: xls.pair[] = [];
            for (let i: number = 0; i < configs.length/2; i++) {
                let reward30 = clientCore.LocalInfo.sex == 1 ? configs[i].femaleCredit : configs[i].maleCredit;
                let cost = this._isAdult ? configs[i].adultCost : configs[i].teenagerCost;
                for (let j: number = 0; j < reward30.length; j++) {
                    let indexTotal = _.findIndex(total30Reward, (o) => { return o.v1 == reward30[j].v1 });
                    if (indexTotal >= 0) {
                        total30Reward[indexTotal].v2 += reward30[j].v2;
                    } else {
                        let _new = new xls.pair();
                        _new.v1 = reward30[j].v1;
                        _new.v2 = reward30[j].v2;
                        total30Reward.push(_new);
                    }
                    if (cost <= model.activeValue) {
                        let indexNow = _.findIndex(now30Reward, (o) => { return o.v1 == reward30[j].v1 });
                        if (indexNow >= 0) {
                            now30Reward[indexNow].v2 += reward30[j].v2;
                        } else {
                            let _new = new xls.pair();
                            _new.v1 = reward30[j].v1;
                            _new.v2 = reward30[j].v2;
                            now30Reward.push(_new);
                        }
                    }
                }
                let reward128 = clientCore.LocalInfo.sex == 1 ? configs[i+configs.length/2].femaleCredit : configs[i+configs.length/2].maleCredit;
                for (let j: number = 0; j < reward128.length; j++) {
                    let indexTotal = _.findIndex(total128Reward, (o) => { return o.v1 == reward128[j].v1 });
                    if (indexTotal >= 0) {
                        total128Reward[indexTotal].v2 += reward128[j].v2;
                    } else {
                        let _new = new xls.pair();
                        _new.v1 = reward128[j].v1;
                        _new.v2 = reward128[j].v2;
                        total128Reward.push(_new);
                    }
                    if (cost <= model.activeValue) {
                        let indexNow = _.findIndex(now128Reward, (o) => { return o.v1 == reward128[j].v1 });
                        if (indexNow >= 0) {
                            now128Reward[indexNow].v2 += reward128[j].v2;
                        } else {
                            let _new = new xls.pair();
                            _new.v1 = reward128[j].v1;
                            _new.v2 = reward128[j].v2;
                            now128Reward.push(_new);
                        }
                    }
                }
            }
            let active = new xls.pair();
            active.v1 = 9900019;
            active.v2 = this._isAdult?500:300;
            total30Reward.unshift(active);
            total128Reward.unshift(active);
            this.listAll30.array = total30Reward;
            this.listAll30.repeatX = total30Reward.length;
            this.listNow30.array = now30Reward;
            this.listNow30.repeatX = now30Reward.length;
            this.listAll128.array = total128Reward;
            this.listAll128.repeatX = total128Reward.length;
            this.listNow128.array = now128Reward;
            this.listNow128.repeatX = now128Reward.length;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        private listMouse(flag: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (flag == 0) {
                    clientCore.ToolTip.showTips(this.listAll30.cells[index], { id: this.listAll30.array[index].v1 });
                } else if (flag == 1) {
                    clientCore.ToolTip.showTips(this.listAll128.cells[index], { id: this.listAll128.array[index].v1 });
                } else if (flag == 2) {
                    clientCore.ToolTip.showTips(this.listNow30.cells[index], { id: this.listNow30.array[index].v1 });
                } else if (flag == 3) {
                    clientCore.ToolTip.showTips(this.listNow128.cells[index], { id: this.listNow128.array[index].v1 });
                }
            }
        }

        private buy(id: number) {
            clientCore.RechargeManager.pay(id).then(() => {
                let model = clientCore.CManager.getModel(this._sign) as SpringMedalModel;
                if (id == 33) model.medalBuyStatus = 30;
                else model.medalBuyStatus = 128;
                if(clientCore.LocalInfo.age >= 18){
                    model.activeValue += 500;
                }else{
                    model.activeValue += 300;
                }
                this.onClose();
                alert.showFWords("激活成功~");
                EventManager.event("SPRING_MEDAL_ACTIVE");
            });
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btn30, Laya.Event.CLICK, this, this.buy, [33]);
            BC.addEvent(this, this.btn128, Laya.Event.CLICK, this, this.buy, [42]);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}