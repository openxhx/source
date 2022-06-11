namespace taoleFind {
    /**
     * 淘乐节寻礼
     * taoleFind.TaoleFindModule
     */
    export class TaoleFindModule extends ui.taoleFind.TaoleFindModuleUI {

        private _info: pb.sc_taole_channel_repair_activity_get_info;

        init(d: any) {
            this.addPreLoad(net.sendAndWait(new pb.cs_taole_channel_repair_activity_get_info()).then((data: pb.sc_taole_channel_repair_activity_get_info) => {
                this._info = data;
            }))
        }
        onPreloadOver() {
            this.updateView();
        }

        private onDetail() {
            alert.showRuleByID(1108);
        }

        private updateView() {
            for (let i = 0; i < 9; i++) {
                (this.boxContain.getChildAt(i) as Laya.Sprite).visible = util.getBit(this._info.flag, i + 1) == 0;
            }
            let totalBit = util.get1num(this._info.flag);
            this.imgGet.visible = false;
            if (totalBit == 10) {
                this.btn.visible = false;
                this.imgGet.visible = true;
            }
            else if (totalBit == 9) {
                this.btn.visible = true;
                this.btn.fontSkin = 'taoleFind/t_y_lingjiang.png';
            }
            else {
                this.btn.visible = true;
                this.btn.fontSkin = this._info.daily == 0 ? 'taoleFind/t_y_jiekai.png' : 'taoleFind/t_y_tomorrow.png';
            }
        }

        private onBtn() {
            let totalBit = util.get1num(this._info.flag);
            if (totalBit == 9) {
                //9张牌都翻了 领奖
                net.sendAndWait(new pb.cs_taole_channel_repair_activity_get_reward({ index: 10 })).then((data: pb.sc_taole_channel_repair_activity_get_reward) => {
                    alert.showReward(data.itms);
                    this._info.flag = util.setBit(this._info.flag, 10, 1);
                    this.updateView();
                })
            }
            else {
                //没翻过牌
                if (this._info.daily == 0) {
                    let bitArr = util.getBitArray(this._info.flag, 1, 9);
                    let bitIdxArr = _.map(bitArr, (bit, idx) => {
                        if (bit == 0) {
                            return idx + 1;
                        }
                        else {
                            return -1;
                        }
                    })
                    bitIdxArr = _.shuffle(bitIdxArr).filter(idx => idx != -1);
                    let idx = bitIdxArr[0];
                    net.sendAndWait(new pb.cs_taole_channel_repair_activity_get_reward({ index: idx })).then((data: pb.sc_taole_channel_repair_activity_get_reward) => {
                        alert.showReward(data.itms);
                        this._info.flag = util.setBit(this._info.flag, idx, 1);
                        this._info.daily = 1;
                        this.updateView();
                        util.RedPoint.reqRedPointRefresh(20401);
                    })
                }
                else {
                    this.destroy();
                }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btn, Laya.Event.CLICK, this, this.onBtn);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}