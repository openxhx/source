namespace oceanicSong {
    /**
     * 1元购
     */
    export class OceanicSongBuyPanel extends ui.oceanicSong.panel.OceanicSongBuyPanelUI implements IPanel {
        ruleId: number;
        private _sign: number;
        private _control: OceanicSongControl;
        private _model: OceanicSongModel;

        private readonly _SUIT_ARR: Array<string> = ["zu_1", "zu_2"];
        private readonly _check_suit: number = 2100306;
        private readonly _time_start: Array<string> = ["2021-6-11 00:00:00", "2021-6-12 20:00:00"];//开始时间
        private readonly _time_end: Array<string> = ["2021-6-12 19:55:00", "2021-6-12 23:59:59"];//开始时间
        private _curTimeState: TYOneBuyCd;
        private _cd: number;
        private _couponsId: number = 9900186;//券的id号
        private readonly _rotation: number = 15;
        private tw: Laya.Tween;
        public init(sign: number): void {
            this._sign = sign;
            this._control = clientCore.CManager.getControl(this._sign) as OceanicSongControl;
            this._model = clientCore.CManager.getModel(this._sign) as OceanicSongModel;
            this.txLimit.changeText(`限量${channel.ChannelControl.ins.isOfficial ? 2000 : 5000}套`);
            this.initSuit();
            this.startCdTimeOut();
            this.initState();
            this.resetBtnGray();
            this.addEvent();
        }

        private startCdTimeOut(): void {
            this.boxTime.visible = true;
            this.state_over.visible = false;
            let now: number = clientCore.ServerManager.curServerTime;//当前的服务器时间
            // let buyCouponsStart: number = new Date(this._time_start[0]).getTime();
            let buyCouponsStart: number = util.TimeUtil.formatTimeStrToSec(this._time_start[0]);
            if (now < buyCouponsStart) {
                this._curTimeState = TYOneBuyCd.NO_START_COUPONS;
                this._cd = buyCouponsStart - now;
                this.startTime();
                return;
            }
            if (!clientCore.ItemsInfo.checkHaveItem(this._couponsId)) {
                //还没有购券
                // let buyCouponsEnd: number = new Date(this._time_end[0]).getTime();
                let buyCouponsEnd: number = util.TimeUtil.formatTimeStrToSec(this._time_end[0]);
                if (now > buyCouponsEnd) {
                    this._curTimeState = TYOneBuyCd.END_COUPONS;
                    this.lab_cd.text = "购券时间已经结束!";
                    return;
                } else {
                    this._curTimeState = TYOneBuyCd.START_COUPONS;
                    this._cd = buyCouponsEnd - now;
                    this.startTime();
                    return;
                }
            }
            //已经购券
            // let getStart: number = new Date(this._time_start[1]).getTime();
            let getStart: number = util.TimeUtil.formatTimeStrToSec(this._time_start[1]);
            if (now < getStart) {
                this._curTimeState = TYOneBuyCd.NO_GET;
                this._cd = getStart - now;
                this.startTime();
                return;
            }
            if (clientCore.SuitsInfo.checkHaveSuits(this._check_suit)) {
                this.boxTime.visible = false;
                this.lab_cd.text = `恭喜,兑换成功`;
                return;
            }
            // let endStart: number = new Date(this._time_end[1]).getTime();
            let endStart: number = util.TimeUtil.formatTimeStrToSec(this._time_end[1]);
            if (now < endStart) {
                this._curTimeState = TYOneBuyCd.START_GET;
                this._cd = endStart - now;
                this.startTime();
                return;
            }
            this.lab_cd.text = "返还结束!";//没有兑换
            this.state_over.visible = true;
            this._curTimeState = TYOneBuyCd.END_GET;
        }

        private startTime(): void {
            this.showLabCd();
            Laya.timer.loop(1000, this, this.doTime);
        }

        private doTime(): void {
            this._cd--;
            this.showLabCd();
            if (this._cd <= 0) {
                Laya.timer.clear(this, this.doTime);
                this.startCdTimeOut();
                this.initState();
                this.resetBtnGray();
            }
        }
        //显示cdLab信息
        private showLabCd(): void {
            const s: number = Math.ceil(this._cd);
            let h: number = Math.floor(s / 60 / 60);
            let m: number = Math.floor((s - h * 60 * 60) / 60);
            let ss: number = s - h * 60 * 60 - m * 60;
            let hs: string = h < 10 ? `0${h}` : `${h}`;
            let ms: string = m < 10 ? `0${m}` : `${m}`;
            let sss: string = ss < 10 ? `0${ss}` : `${ss}`;
            if (this._curTimeState == TYOneBuyCd.NO_START_COUPONS) {
                this.lab_cd.text = `离开始购券倒计时 ${hs}:${ms}:${sss}`;
                return;
            }
            if (this._curTimeState == TYOneBuyCd.START_COUPONS) {
                this.lab_cd.text = `购券结束倒计时 ${hs}:${ms}:${sss}`;
                return;
            }
            if (this._curTimeState == TYOneBuyCd.NO_GET) {
                this.lab_cd.text = `离开时兑换倒计时 ${hs}:${ms}:${sss}`;
                return;
            }
            if (this._curTimeState == TYOneBuyCd.START_GET) {
                this.lab_cd.text = `兑换结束倒计时 ${hs}:${ms}:${sss}`;
                return;
            }
        }

        private initSuit(): void {
            const index: number = clientCore.LocalInfo.sex - 1;
            this.img_suit.skin = `unpack/oceanicSong/${this._SUIT_ARR[index]}.png`;
        }
        /**
         * 本人的购买状态
         */
        private initState(): void {
            let off2Btn: { x: number, y: number };
            if (this._curTimeState == TYOneBuyCd.NO_START_COUPONS || this._curTimeState == TYOneBuyCd.START_COUPONS || this._curTimeState == TYOneBuyCd.END_COUPONS) {
                this.btn_ok.fontSkin = "oceanicSong/s_y_oconebuy.png";
                off2Btn = { x: 75, y: 20 };
                this.btn_ok.fontX = off2Btn.x;
                this.btn_ok.fontY = off2Btn.y;
                this.img_q_titl.visible = true;
                this.state_converted.visible = false;
                this.img_q_titl.skin = `oceanicSong/title_7.png`;
                return;
            }
            if (this._curTimeState == TYOneBuyCd.NO_GET) {
                this.btn_ok.fontSkin = "oceanicSong/s_y_oc_waitreward.png";
                off2Btn = { x: 85, y: 20 };
                this.btn_ok.fontX = off2Btn.x;
                this.btn_ok.fontY = off2Btn.y;
                this.img_q_titl.visible = true;
                this.state_converted.visible = false;
                this.img_q_titl.skin = `oceanicSong/dui_jiang_quan.png`;
                return;
            }
            if (this._curTimeState == TYOneBuyCd.START_GET || this._curTimeState == TYOneBuyCd.END_GET) {
                this.btn_ok.fontSkin = "oceanicSong/s_y_oc_getreward.png";
                off2Btn = { x: 100, y: 20 };
                this.btn_ok.fontX = off2Btn.x;
                this.btn_ok.fontY = off2Btn.y;
            }
            if (clientCore.SuitsInfo.checkHaveSuits(this._check_suit)) {
                this.state_converted.visible = true;
                this.img_k.rotation = this._rotation;
                this.img_q_titl.visible = false;
            } else {
                this.img_q_titl.visible = true;
                this.state_converted.visible = false;
                this.img_q_titl.skin = `oceanicSong/dui_jiang_quan.png`;
            }
        }
        //按钮置灰的操作
        private resetBtnGray(): void{
            if( this._curTimeState == TYOneBuyCd.NO_START_COUPONS 
                || this._curTimeState == TYOneBuyCd.NO_GET 
                || this._curTimeState == TYOneBuyCd.END_COUPONS
                || this._curTimeState == TYOneBuyCd.END_GET
                ){
                    this.btn_ok.gray = true;
            }else{
                this.btn_ok.gray = false;
            }
        }

        public show(parent: Laya.Sprite): void {
            this._control.init1BuyPanel(Laya.Handler.create(this, this.onInitPanel));
            parent.addChild(this);
            clientCore.Logger.sendLog('2021年6月11日活动', '【付费】海洋之歌', '打开1元购面板');
        }



        private onInitPanel(msg: pb.sc_ocean_song_panel): void {
            this.lab_surplus.text = `剩余:${msg.num}`;
        }

        public hide(): void {
            this.removeSelf();
        }

        private addEvent(): void {
            BC.addEvent(this, this.btn_ok, Laya.Event.CLICK, this, this.onClickHandler);
            //#region 试装
            BC.addEvent(this, this.btn_try, Laya.Event.CLICK, this, this.trySuitHandler);
            //#endregion
        }

        private removeEvent(): void {
            BC.removeEvent(this);
        }

        private trySuitHandler(e: Laya.Event): void {
            this.trySuit(this._check_suit);
        }

        //没有背景show
        private trySuit(suitId: number): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", suitId);
        }

        private onClickHandler(e: Laya.Event): void {
            if (this._curTimeState == TYOneBuyCd.END_GET || this._curTimeState == TYOneBuyCd.END_COUPONS) return;
            if (this._curTimeState == TYOneBuyCd.NO_GET || this._curTimeState == TYOneBuyCd.NO_START_COUPONS) return;
            if (this._curTimeState == TYOneBuyCd.START_COUPONS) {
                clientCore.RechargeManager.pay(51).then((data) => {
                    this.startCdTimeOut();
                    this.initState();
                    this.resetBtnGray();
                }).catch(() => {

                });
                return;
            }
            if (this._curTimeState == TYOneBuyCd.START_GET) {
                this._control.getExchange(Laya.Handler.create(this, this.onExchange));
            }
        }

        private onExchange(msg: pb.sc_ocean_song_exchange_cloth): void {
            this.startCdTimeOut();
            this.initState();
            this.resetBtnGray();
            if (msg) {
                this.playTw();
            }
        }
        private playTw(): void {
            this.img_q_titl.visible = false;
            this.tw = Laya.Tween.to(this.img_k, { rotation: this._rotation }, 500, Laya.Ease.linearIn, Laya.Handler.create(this, this.playTwOver));
        }

        private playTwOver(): void {
            this.tw.clear();
            this.tw = null;
            this.state_converted.visible = true;
        }

        public dispose(): void {
            this.removeEvent();
            if (this.tw) {
                this.tw.clear();
                this.tw = null;
            }
            this._control = this._model = null;
            Laya.timer.clear(this, this.doTime);
        }
    }

    export const enum TYOneBuyCd {
        NO_START_COUPONS = 1,
        START_COUPONS = 2,
        END_COUPONS = 3,
        NO_GET = 4,
        START_GET = 5,
        END_GET = 6
    }
}
