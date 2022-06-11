namespace rechargeActivity {

    enum Status {
        NONE,
        REWARD,
        HAS
    }

    /**
     * 月充
     */
    export class MoonRechargePanel extends BasePanel {

        public needLoading: boolean = true;

        private _flag1: number;
        private _flag2: number;
        private _flag3: number;

        async waitLoading(): Promise<void> {
            await res.load('atlas/moonRecharge.atlas', Laya.Loader.ATLAS);
        }

        init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info): void {
            if (!this._mainUI) {
                this._mainUI = new ui.rechargeActivity.panel.MoonRechargePanelUI();
                this._mainUI.pos(140, 18);
                this._mainUI['imgSuit1'].visible = clientCore.LocalInfo.sex == 1;
                this._mainUI['imgSuit2'].visible = clientCore.LocalInfo.sex == 2;
                //clientCore.FlowerPetInfo.checkIsHave(this._big, index + 1)
                this._flag1 = info.monthCardRewardFlag;
                this._flag2 = info.seasonCardRewardFlag;
                this._flag3 = info.yearsCardRewardFlag;
                if (clientCore.FlowerPetInfo.checkIsHave(4, 6)) this._flag1 = Status.HAS;
                if (clientCore.ItemsInfo.checkHaveItem(143950)) this._flag2 = Status.HAS;
                if (clientCore.FlowerPetInfo.checkIsHave(4, 7)) this._flag3 = Status.HAS;
                this.addChild(this._mainUI);
                this.addEvents();
            }
            this._mainUI['btnGet'].visible = false;
            // 花宝剩余时间啦
            this.updateDay();
            for (let i: number = 1; i <= 3; i++) { this.updateBtn(i); }
            clientCore.Logger.sendLog('2021年7月30日活动', '【付费】花宝充值促销', '打开花宝充值促销面板');
        }

        destroy(): void {
            this.removeEvents();
            this._mainUI?.destroy();
            this._mainUI = null;
        }

        private updateDay(): void {
            if (clientCore.FlowerPetInfo.petType == 0) { //不是花宝选手
                this._mainUI['labDays'].text = ('0');
                //this._mainUI['btnGet'].visible = false;
                return;
            }
            let t: string = util.TimeUtil.analysicYear(clientCore.ServerManager.curServerTime) + " 00:00:00";
            let zeroT = util.TimeUtil.formatTimeStrToSec(t);
            let diffTime: number = clientCore.FlowerPetInfo.expireTime - zeroT;
            let days = Math.floor(diffTime / 24 / 3600);
            this._mainUI['labDays'].text = (`${days}`);
            //this._mainUI['btnGet'].visible = days >= 1800 && (this._flag1 < 2 || this._flag2 < 2 || this._flag3 < 2);
        }

        private updateBtn(index: number): void {
            let flag: number = this[`_flag${index}`];
            let has: boolean = flag == Status.HAS;
            this._mainUI[`imgGot${index}`].visible = has;
            this._mainUI[`btn${index}`].visible = !has && !this._mainUI['btnGet'].visible;
            if (!has) {
                this._mainUI[`btn${index}`].skin = flag == Status.NONE ? 'moonRecharge/btn_chongzhi.png' : 'moonRecharge/btn_get.png';
            }
        }

        private addEvents(): void {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this._mainUI[`btn${i}`], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            //BC.addEvent(this, this._mainUI[`btnGet`], Laya.Event.CLICK, this, this.getAll);
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        private getAll() {
            net.sendAndWait(new pb.cs_get_flower_baby_skin()).then((msg: pb.sc_get_flower_baby_skin) => {
                alert.showReward(msg.items);
                //this._mainUI['btnGet'].visible = false;
                for (let i: number = 1; i <= 3; i++) {
                    this['_flag' + i] = Status.HAS;
                    this.updateBtn(i);
                }
            });
        }

        private onClick(index: number): void {
            let flag: number = this[`_flag${index}`]
            if (flag == Status.NONE) {
                clientCore.ToolTip.gotoMod(52);
            } else {
                net.sendAndWait(new pb.cs_get_buy_flower_card_ext_reawrd({ type: index })).then((msg: pb.sc_get_buy_flower_card_ext_reawrd) => {
                    alert.showReward(msg.items);
                    for (let i: number = 1; i <= index; i++) {
                        this['_flag' + i] = Status.HAS;
                        this.updateBtn(i);
                    }
                });
            }
        }
    }
}