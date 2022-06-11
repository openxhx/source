namespace oneYuanBuy {
    /**
     * 1元购
     * 2021.08.27
     * 春桃不语一元购
     */
    export class OneYuanBuyModule extends ui.oneYuanBuy.OneYuanBuyModuleUI {

        private _curTimeState: TYOneBuyCd;
        private readonly _SUIT_ARR: Array<string> = ["zu_1", "zu_2"];
        private readonly _check_suit: number = 2100316;//套装ID
        private _couponsId: number = 1511032;//券ID
        private readonly _time_start: Array<string> = ["2021-8-27 00:00:00", "2021-8-28 00:00:00"];//开始时间
        private readonly _time_end: Array<string> = ["2021-8-27 23:59:59", "2021-9-2 23:59:59"];//结束时间
        private _cd: number;

        //初始化
        public init(): void {
            this.initSuit();
            this.addEvent();
            this.timeState();
            this.couponsState();
            this.btn_okState();
            this.startTime();
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年8月27日活动', '【付费】桃夭灼灼1元购', '打开1元购面板');
        }

        //套装初始化
        private initSuit(): void {
            const index: number = clientCore.LocalInfo.sex - 1;
            this.img_suit.skin = `unpack/oneYuanBuy/${this._SUIT_ARR[index]}.png`;
        }

        //按钮点击事件
        private addEvent(): void {
            BC.addEvent(this, this.btn_ok, Laya.Event.CLICK, this, this.onClickBtn_Ok);//购买兑换
            BC.addEvent(this, this.btn_try, Laya.Event.CLICK, this, this.trySuit);//试装
            BC.addEvent(this, this.btn_close, Laya.Event.CLICK, this, this.destroy);
        }

        //试穿按钮
        private trySuit(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._check_suit);
        }
        //一元购按钮
        private onClickBtn_Ok(): void {
            if (this._curTimeState == TYOneBuyCd.START_COUPONS_NO_BUY) {
                clientCore.RechargeManager.pay(51).then((data) => {
                    alert.showReward(data.items);
                    this.timeState();
                    this.couponsState();
                    this.btn_okState();
                }).catch(() => {

                });
                return;
            }
            if (this._curTimeState == TYOneBuyCd.START_GET_NO_GET) {
                this.getExchange(Laya.Handler.create(this, this.onExchange));
            }
        }

        //时间与状态
        private timeState(): void {
            let now: number = clientCore.ServerManager.curServerTime;//当前的服务器时间
            let buyStart: number = util.TimeUtil.formatTimeStrToSec(this._time_start[0]);
            let getStart: number = util.TimeUtil.formatTimeStrToSec(this._time_start[1]);
            let buyEnd: number = util.TimeUtil.formatTimeStrToSec(this._time_end[0]);
            let getEnd: number = util.TimeUtil.formatTimeStrToSec(this._time_end[1]);
            if (buyStart < now && now < buyEnd) {
                this._cd = buyEnd - now;
                if (clientCore.ItemsInfo.checkHaveItem(this._couponsId)) {
                    this._curTimeState = TYOneBuyCd.START_COUPONS_YES_BUY;
                } else {
                    this._curTimeState = TYOneBuyCd.START_COUPONS_NO_BUY;
                }
            }
            if (getStart < now && now < getEnd) {
                this._cd = getEnd - now;
                if (clientCore.ItemsInfo.checkHaveItem(this._couponsId)) {
                    if (!clientCore.SuitsInfo.checkHaveSuits(this._check_suit)) {

                        this._curTimeState = TYOneBuyCd.START_GET_NO_GET;
                    }
                }
                else {
                    if (clientCore.SuitsInfo.checkHaveSuits(this._check_suit)) {
                        this._curTimeState = TYOneBuyCd.START_GET_YES_GET;
                    }
                    else {
                        this._curTimeState = TYOneBuyCd.START_GET_NO_BUY;
                    }
                }
            }
            if (now > getEnd) {
                this._curTimeState = TYOneBuyCd.END_GET;
            }
        }
        //限量数量
        private txLimitNumber(msg: pb.sc_ocean_song_panel): void {
            if (this._curTimeState == TYOneBuyCd.START_COUPONS_NO_BUY || this._curTimeState == TYOneBuyCd.START_COUPONS_YES_BUY) {
                this.txLimit.changeText(`限量${channel.ChannelControl.ins.isOfficial ? 3000 : 5000}套`);
            }
            else {
                this.txLimit.changeText(`剩余${msg.num}套`);
            }
        }

        //券的状态
        private couponsState(): void {
            if (this._curTimeState == TYOneBuyCd.START_COUPONS_NO_BUY || this._curTimeState == TYOneBuyCd.START_GET_NO_BUY) {
                this.img_NoGet.skin = `oneYuanBuy/quan1.png`;
                this.img_NoGet.visible = true;
                this.img_YesGet.visible = false;
            }
            else if (this._curTimeState == TYOneBuyCd.START_COUPONS_YES_BUY || this._curTimeState == TYOneBuyCd.START_GET_NO_GET) {
                this.img_NoGet.skin = `oneYuanBuy/quan2.png`;
                this.img_NoGet.visible = true;
                this.img_YesGet.visible = false;
            }
            else if (this._curTimeState == TYOneBuyCd.START_GET_YES_GET) {
                this.img_NoGet.visible = false;
                this.img_YesGet.visible = true;
            }
            else {
                this.img_NoGet.skin = `oneYuanBuy/quan1.png`;
                this.img_NoGet.visible = true;
                this.img_YesGet.visible = false;
            }
        }

        //btn_ok按钮状态
        private btn_okState(): void {
            if (this._curTimeState == TYOneBuyCd.START_COUPONS_NO_BUY) {
                this.btn_ok.skin = `oneYuanBuy/btn_0.png`;
                this.btn_ok.gray = false;
                this.btn_ok.mouseEnabled = true;
                this.btn_ok.visible = true;
                this.btn_dj.visible = false;
            }
            else if (this._curTimeState == TYOneBuyCd.START_COUPONS_YES_BUY) {
                this.btn_ok.skin = `oneYuanBuy/btn_1.png`;
                this.btn_ok.gray = false;
                this.btn_ok.mouseEnabled = false;
                this.btn_ok.visible = true;
                this.btn_dj.visible = false;
            }
            else if (this._curTimeState == TYOneBuyCd.START_GET_NO_BUY) {
                this.btn_ok.skin = `oneYuanBuy/btn_0.png`;
                this.btn_ok.gray = true;
                this.btn_ok.mouseEnabled = false;
                this.btn_ok.visible = true;
                this.btn_dj.visible = false;
            }
            else if (this._curTimeState == TYOneBuyCd.START_GET_NO_GET) {
                this.btn_ok.skin = `oneYuanBuy/btn_2.png`;
                this.btn_ok.gray = false;
                this.btn_ok.mouseEnabled = true;
                this.btn_ok.visible = true;
                this.btn_dj.visible = false;
            }
            else if (this._curTimeState == TYOneBuyCd.START_GET_YES_GET) {

                this.btn_ok.gray = false;
                this.btn_ok.mouseEnabled = false;
                this.btn_ok.visible = false;
                this.btn_dj.visible = true;
            }
            else {
                this.btn_ok.visible = true;
                this.btn_dj.visible = false;
                this.btn_ok.skin = `oneYuanBuy/btn_0.png`;
                this.btn_ok.gray = true;
                this.btn_ok.mouseEnabled = false;
            }
        }

        //刷新
        private startTime(): void {
            this.showLabCd();
            this.getLimit();
            Laya.timer.loop(1000, this, this.doTime);
            Laya.timer.loop(5000, this, this.getLimit);
        }

        //改变时间
        private doTime(): void {
            this._cd--;
            this.showLabCd();
            if (this._cd <= 0) {
                Laya.timer.clear(this, this.doTime);
                this.timeState();
                this.couponsState();
                this.btn_okState();
            }
        }
        //倒计时方法
        private showLabCd(): void {
            let dis = Math.max(0, this._cd);
            if (this._curTimeState == TYOneBuyCd.START_COUPONS_NO_BUY || this._curTimeState == TYOneBuyCd.START_COUPONS_YES_BUY) {
                this.lab_cd.text = `购券结束倒计时 ${util.StringUtils.getDateStr2(dis)}`;
                return;
            }
            else if (this._curTimeState == TYOneBuyCd.START_GET_NO_BUY || this._curTimeState == TYOneBuyCd.START_GET_NO_GET || this._curTimeState == TYOneBuyCd.START_GET_YES_GET) {
                this.lab_cd.text = `兑换结束倒计时 ${util.StringUtils.getDateStr2(dis)}`;
                return;
            }
            else if (this._curTimeState == TYOneBuyCd.END_GET) {
                this.lab_cd.text = `活动结束`;
                return;
            }
            else {
                this.lab_cd.text = `活动未开始`;
                return;
            }
        }
        //显示剩余卷
        private getLimit(): void {
            this.init1BuyPanel(Laya.Handler.create(this, this.txLimitNumber));
        }
        //获取套装后状态改变
        private onExchange(msg: pb.sc_ocean_song_exchange_cloth): void {
            this.timeState();
            this.couponsState();
            this.btn_okState();
        }
        //获取套装
        public getExchange(handler: Laya.Handler): Promise<void> {
            return net.sendAndWait(new pb.cs_ocean_song_exchange_cloth()).then((msg: pb.sc_ocean_song_exchange_cloth) => {
                alert.showReward(msg.items);
                handler.runWith(msg);
            }).catch(() => {
                handler.runWith(null);
            });
        }
        //获取卷数量
        public init1BuyPanel(handler: Laya.Handler): Promise<void> {
            return net.sendAndWait(new pb.cs_ocean_song_panel()).then((msg: pb.sc_ocean_song_panel) => {
                handler.runWith(msg);
            }).catch(() => {
                handler.runWith(null);
            });
        }
        //关闭
        destroy(): void {
            Laya.timer.clear(this, this.getLimit);
            super.destroy();
        }

    }


    export const enum TYOneBuyCd {
        START_COUPONS_NO_BUY = 1,//活动开始没有购买
        START_COUPONS_YES_BUY = 2,//活动开始购买了
        START_GET_NO_BUY = 3,//兑换开始没有购买
        START_GET_NO_GET = 4,//兑换开始没有兑换
        START_GET_YES_GET = 5,//兑换开始已经兑换
        END_GET = 6//兑换结束
    }

}