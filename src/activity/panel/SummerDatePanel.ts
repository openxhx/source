namespace activity {
    export class SummerDataPanel extends ActivityBasePanel<ui.activity.panel.SummerPanelUI>{
        private _srvInfo: pb.sc_get_login_activity_status;
        private _xlsInfo: util.HashMap<xls.continueLogin>;
        private _curDay: number = 0;
        init() {
            this.addPreLoad(xls.load(xls.continueLogin));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_login_activity_status()).then((data: pb.sc_get_login_activity_status) => {
                this._srvInfo = data;
                this._curDay = data.days.length;
            }));
        }

        preLoadOver() {
            this._xlsInfo = xls.get(xls.continueLogin);
            this.initView();
        }

        private initView() {
            this.ui.img_role_b.visible = clientCore.LocalInfo.sex != 1;
            this.ui.img_role_g.visible = clientCore.LocalInfo.sex == 1;
            this.ui.img_reward7.skin = clientCore.LocalInfo.sex == 1 ? "unpack/activity/11.png" : "unpack/activity/22.png";
            let reward: xls.pair;
            for (let i: number = 1; i < 7; i++) {
                reward = clientCore.LocalInfo.sex == 1 ? this._xlsInfo.get(i).reward[0] : this._xlsInfo.get(i).rewardMale[0];
                this.ui["day_" + i].img_day.skin = `activity/${i}.png`;
                this.ui["day_" + i].img_reward.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                this.ui["day_" + i].lab_rewardCount.text = `x${reward.v2}`;
            }
            this.updateView();
        }

        private updateView() {
            let status: boolean;
            let onSign: boolean;
            for (let i: number = 0; i < 7; i++) {
                status = this._srvInfo.days[i] == 1;
                onSign = i < this._curDay;
                if (i == 6) {
                    this.ui.img_select7.visible = !status && onSign;
                    this.ui.lab_rewardCount7.visible = !status;
                    this.ui.img_got7.visible = status;
                } else {
                    this.ui["day_" + (i + 1)].img_select.visible = !status && onSign;
                    this.ui["day_" + (i + 1)].lab_rewardCount.visible = !status
                    this.ui["day_" + (i + 1)].img_got.visible = status;
                }
            }
            this.ui.btn_getReward.visible = this.checkCanGet();
            this.ui.btn_tomorrow.visible = !this.checkCanGet() && this._curDay < 7;
        }

        private checkCanGet(): boolean {
            for (let i: number = 0; i < this._curDay; i++) {
                if (this._srvInfo.days[i] == 0) {
                    return true;
                }
            }
            return false;
        }

        private requestReward() {
            net.sendAndWait(new pb.cs_get_login_activity_reward({ index: this._curDay })).then((data: pb.sc_get_login_activity_reward) => {
                let suitId = clientCore.LocalInfo.sex == 1 ? this._xlsInfo.get(7).reward[0].v1 : this._xlsInfo.get(7).rewardMale[0].v1;
                let index = _.findIndex(data.reward, (rew) => {
                    return rew.id == suitId;
                });
                if (index >= 0) {
                    data.reward.splice(index, 1);
                    let suitPart = clientCore.SuitsInfo.getSuitInfo(suitId);
                    for (let i: number = 0; i < suitPart.clothes.length; i++) {
                        data.reward.push(new pb.Item({ id: suitPart.clothes[i], cnt: 1 }));
                    }
                }
                alert.showReward(clientCore.GoodsInfo.createArray(data.reward));
                for (let i: number = 0; i < this._srvInfo.days.length; i++) {
                    this._srvInfo.days[i] = 1;
                }
                util.RedPoint.reqRedPointRefresh(3306);
                this.updateView();
            })
        }

        addEvent() {
            BC.addEvent(this, this.ui.btn_getReward, Laya.Event.CLICK, this, this.requestReward);
            BC.addEvent(this, this.ui.btn_test, Laya.Event.CLICK, this, () => {
                let suitId = clientCore.LocalInfo.sex == 1 ? this._xlsInfo.get(7).reward[0].v1 : this._xlsInfo.get(7).rewardMale[0].v1;
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", suitId);
            });
        }

        removeEvent() {
            BC.removeEvent(this);
        }
    }
}