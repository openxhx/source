namespace threeDay {
    /**
     * 三日礼包
     * threeDay.ThreeDayModule
     */
    export class ThreeDayModule extends ui.threeDay.ThreeDayModuleUI {
        private _currDay: number;
        private _maxDay: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        init(d: any) {
            this.addPreLoad(xls.load(xls.continueLogin));
            this.addPreLoad(this.reqInfo());
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        onPreloadOver() {
            this.showView();
        }

        private reqInfo() {
            return net.sendAndWait(new pb.cs_get_login_activity_status()).then((data: pb.sc_get_login_activity_status) => {
                this._maxDay = data.days.length;
                this._currDay = this._maxDay + 1;
                for (let i = 0; i < data.days.length; i++) {
                    // if (util.getBit(data.flag, i) == 0) {
                    //     this._currDay = i;
                    //     break;
                    // }
                    if (data.days[i] == 0) {
                        this._currDay = i + 1;
                        break;
                    }
                }
                return Promise.resolve();
            })
        }

        private showView() {
            let currRole = Math.min(this._maxDay, this._currDay);
            this.imgBg.skin = `unpack/threeDay/day_${currRole}.png`;
            this.imgTalk.skin = `threeDay/talk${currRole}_${this._currDay <= this._maxDay ? 1 : 2}.png`;
            this.btn.fontSkin = this._currDay <= this._maxDay ? 'commonBtn/s_y_Reward.png' : 'commonBtn/s_y_back tomorrow.png';
            if (this._currDay == 4) {
                this.btn.fontSkin = 'threeDay/l_y_close2.png';
            }
            // this.txtTime.text = `请在6月${4 + this._currDay}日23:59:59前领取`;
            this.boxTime.visible = this._currDay <= this._maxDay;
            let xlsInfo = xls.get(xls.continueLogin).get(this._currDay);
            let rwdArr = xlsInfo ? (clientCore.LocalInfo.sex == 1 ? xlsInfo.reward : xlsInfo.rewardMale) : [];
            this.list.dataSource = rwdArr;
            this.list.repeatX = rwdArr.length;
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            cell.num.value = data.v2.toString();
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(this.list.getCell(idx), { id: this.list.getItem(idx).v1 });
            }
        }

        private _netReqing: boolean = false;
        private onBtn() {
            if (this._netReqing) return;
            if (this._currDay > this._maxDay || this._currDay > 3) {
                this.destroy();
                if (this._currDay == 4) {
                    clientCore.RegRemoveManager.remove(clientCore.REG_ENUM.THREE_DAY_GIFT);
                }
            }
            else {
                this._netReqing = true;
                net.sendAndWait(new pb.cs_get_login_activity_reward({ index: this._currDay })).then((o: pb.sc_get_login_activity_reward) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(o.reward));
                    this._netReqing = false;
                    this.reqInfo().then(() => {
                        this.showView();
                    })
                    util.RedPoint.reqRedPointRefresh(7201);
                }).catch(() => { this._netReqing = false; })
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btn, Laya.Event.CLICK, this, this.onBtn);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}