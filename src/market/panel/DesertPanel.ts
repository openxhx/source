

namespace market {
    /**
     * 沙漠玫瑰 
     */
    const ORI_PRICE = 420;
    const PRICE = 320;
    const SUIT_ID = 2100195;
    export class DesertPanel extends ui.market.panel.DesertPanelUI {
        private _control: MarketControl;
        private _openTime: number;
        constructor(sign: number) {
            super();
            this.addEventListeners();
            this.sign = sign;
            this._control = clientCore.CManager.getControl(this.sign) as MarketControl;
            // this.imgLimit.skin = channel.ChannelControl.ins.isOfficial ? 'market/limit3k.png' : 'market/limit5k.png'
            this.txtOriPrice.text = ORI_PRICE.toString();
            this.btnBuyed.visible = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet;
            this.txtPrice.text = PRICE.toString();
            this._openTime = util.TimeUtil.formatTimeStrToSec('2020-6-13 12:00:00');
            if (this.checkInTime()) {
                this.imgTimeLimit.visible = false;
            }
            else {
                this.imgTimeLimit.visible = true;
                Laya.timer.loop(500, this, this.onLimitTimer);
            }
        }

        init(): void {
            this._control.getTaleSuitDiscountInfo(new Laya.Handler(this, (msg: pb.sc_fairy_tale_1st_get_qualification) => {
                this.txtLimit.text = '背景秀剩余：' + msg.remainNum.toString();
            }), 0);
            this.imgVip.gray = clientCore.FlowerPetInfo.petType == 0;
            this.onLimitTimer();
        }

        private onLimitTimer() {
            let open = this.checkInTime();
            this.imgTimeLimit.visible = !open;
            this.btnBuy.disabled = !open
            if (open) {
                Laya.timer.clear(this, this.onLimitTimer);
                Laya.timer.clear(this, this.onTimer);
                Laya.timer.loop(5000, this, this.onTimer);
            }
        }

        private checkInTime() {
            return clientCore.ServerManager.curServerTime >= this._openTime;
        }

        private onTimer() {
            if (this.checkInTime())
                this._control.getTaleSuitDiscountInfo(new Laya.Handler(this, (msg: pb.sc_fairy_tale_1st_get_qualification) => {
                    this.txtLimit.text = '背景秀剩余：' + msg.remainNum.toString();
                    if (msg.remainNum == 0)
                        Laya.timer.clear(this, this.onTimer);
                }), 0);
        }

        private onRemove() {
            Laya.timer.clear(this, this.onTimer);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this, Laya.Event.REMOVED, this, this.onRemove);
            BC.addEvent(this, this.btnPet, Laya.Event.CLICK, this, this.onPet);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
            Laya.timer.clear(this, this.onLimitTimer);
        }

        destroy(): void {
            this._control = null;
            super.destroy();
        }

        /** 购买*/
        private onBuy(): void {
            if (clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet) {
                alert.showFWords('你已经购买过套装了哦')
                return;
            }
            if (!this.checkInTime()) {
                alert.showSmall('购买将在6月13日中午12点重新开放');
                return;
            }
            let needPrice = clientCore.FlowerPetInfo.petType > 0 ? PRICE : ORI_PRICE;
            let have = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (have < needPrice) {
                alert.showSmall('灵豆不足，是否前往补充', { callBack: { caller: this, funArr: [this.goMoney] } });
            }
            else {
                clientCore.LoadingManager.showSmall();
                this._control.getTaleSuitDiscountInfo(new Laya.Handler(this, (msg: pb.sc_fairy_tale_1st_get_qualification) => {
                    this.txtLimit.text = '背景秀剩余：' + msg.remainNum.toString();
                    clientCore.LoadingManager.hideSmall(true);
                    alert.showSmall(`确定要花费${needPrice}灵豆购买墨草蕊心套装吗？（目前背景秀剩余数量：${msg.remainNum}）`,
                        {
                            clickMaskClose: false,
                            needClose: false,
                            callBack: {
                                caller: this,
                                funArr: [
                                    this.sureBuy,
                                    this.cancleBuy
                                ]
                            }
                        })
                }), 1);
            }
        }

        private sureBuy() {
            net.sendAndWait(new pb.cs_fairy_tale_1st_buy_suit()).then((msg: pb.sc_fairy_tale_1st_buy_suit) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                this.btnBuyed.visible = true
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private cancleBuy() {
            this._control.getTaleSuitDiscountInfo(new Laya.Handler(this, (msg: pb.sc_fairy_tale_1st_get_qualification) => {
                this.txtLimit.text = '背景秀剩余：' + msg.remainNum.toString();
            }), 2);
        }

        private goMoney() {
            clientCore.ToolTip.gotoMod(50);
        }

        private onPet() {
            clientCore.ToolTip.gotoMod(52);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", SUIT_ID);
        }
    }
}