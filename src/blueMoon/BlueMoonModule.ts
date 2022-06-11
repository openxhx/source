namespace blueMoon {
    /**
     * 幽蓝祈月
     * 2021/9/10
     */
    /**当前打折状态 */
    export const enum discountState {
        yizhe,
        sanzhe,
        wuzhe,
        qizhe,
        jiuzhe,
        yuanjia
    }
    export class BlueMoonModule extends ui.blueMoon.BlueMoonModuleUI {
        private buyInfo: pb.IYFLSTopCloudBuyHistory[];
        private coinId: number = 9900003;//道具ID
        private disSta: discountState;
        private suitId: number = 2110483;//套装ID
        private readonly time: Array<string> = ["2021-9-10 20:10:00", "2021-9-23 23:59:59"];//时间
        private _cd0: number;//时间差
        private _cd1: number;//时间差

        init() {
            this.nowTimeGet();
            this.doTime();
            this.addPreLoad(this.surPlusNum());
            this.addPreLoad(this.getBuyInfo());
            this.listBuyInfo.vScrollBarSkin = "";
            this.listBuyInfo.renderHandler = new Laya.Handler(this, this.buyInfoRender);
            this.labNum();
            clientCore.Logger.sendLog('2021年9月10日活动','【付费】幽蓝祈月', '打开幽蓝祈月面板');
        }
        /**按钮事件监听 */
        addEventListeners(): void {
            Laya.timer.loop(1000, this, this.doTime);
            Laya.timer.loop(5000, this, this.getUpdata);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);

        }

        removeEventListeners(): void {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.doTime);
            Laya.timer.clear(this, this.getUpdata);

        }
        /**限量数量 */
        private labNum(): void {
            this.labNum1.changeText(`${channel.ChannelControl.ins.isOfficial ? 25 : 50}`);
            this.labNum3.changeText(`${channel.ChannelControl.ins.isOfficial ? 80 : 160}`);
            this.labNum5.changeText(`${channel.ChannelControl.ins.isOfficial ? 200 : 400}`);
            this.labNum7.changeText(`${channel.ChannelControl.ins.isOfficial ? 400 : 800}`);
            this.labNum9.changeText(`${channel.ChannelControl.ins.isOfficial ? 600 : 1200}`);
        }


        /**套装展示 */
        private onTry(): void {
            alert.showCloth(this.suitId);
        }
        /**退出 */
        destroy() {
            this.buyInfo = null;
            super.destroy();
        }


        /**时间差获取 */
        private nowTimeGet(): void {
            let now: number = clientCore.ServerManager.curServerTime;
            let buyStart: number = util.TimeUtil.formatTimeStrToSec(this.time[0]);
            let buyEnd: number = util.TimeUtil.formatTimeStrToSec(this.time[1]);
            this._cd0 = buyStart - now;
            this._cd1 = buyEnd - now;
        }
        /**改变时间 */
        private doTime(): void {
            this._cd0--;
            this._cd1--;
            this.showLabCd();
        }
        /**倒计时方法 */
        private showLabCd(): void {
            let dis0 = Math.max(0, this._cd0);
            let dis1 = Math.max(0, this._cd1);
            if (this._cd0 > 0) {
                this.labTime.text = `${util.StringUtils.getDateStr2(dis0)}`;
                this.btnBuy.disabled = true;
                this.imgBuy.visible = false;
            }
            else {
                this.labTime.text = `${util.StringUtils.getDateStr2(dis1)}`;
                if (clientCore.ItemsInfo.checkHaveItem(this.suitId)) {
                    this.imgBuy.visible = true;
                    this.btnBuy.disabled = true;
                } else {
                    this.imgBuy.visible = false;
                    this.btnBuy.disabled = false;
                }

            }


        }
        /**打折状态 */
        private disState(msg: pb.sc_season_appoint_panel): void {
            if (msg.oneDiscount > 0) {
                this.disSta = discountState.yizhe;
                this.labSurplus.text = `${msg.oneDiscount}`;
            }
            else if (msg.threeDiscount > 0) {
                this.disSta = discountState.sanzhe;
                this.labSurplus.text = `${msg.threeDiscount}`;

            }
            else if (msg.fiveDiscount > 0) {
                this.disSta = discountState.wuzhe;
                this.labSurplus.text = `${msg.fiveDiscount}`;

            }
            else if (msg.sevenDiscount > 0) {
                this.disSta = discountState.qizhe;
                this.labSurplus.text = `${msg.sevenDiscount}`;

            }
            else if (msg.nineDiscount > 0) {
                this.disSta = discountState.jiuzhe;
                this.labSurplus.text = `${msg.nineDiscount}`;
            }
            else {
                this.disSta = discountState.yuanjia;
                this.labSurplus.text = `不限量`;
            }
        }

        /**当前折扣剩余数量获取 */
        private surPlusNum() {
           return net.sendAndWait(new pb.cs_season_appoint_panel()).then((msg: pb.sc_season_appoint_panel) => {
                this.disState(msg);
                this.imgBuyState();
            });
        }
        /**刷新 */
        private getUpdata(): void {
            this.surPlusNum();

        }

        /**图片状态 */
        private imgBuyState(): void {
            if (this.disSta == discountState.yizhe) {
                this.imgNum1.skin = `blueMoon/imgBuy.png`;
                this.imgNum3.skin = `blueMoon/imgBuy.png`;
                this.imgNum5.skin = `blueMoon/imgBuy.png`;
                this.imgNum7.skin = `blueMoon/imgBuy.png`;
                this.imgNum9.skin = `blueMoon/imgBuy.png`;
                this.imgDiscount.skin = `blueMoon/discount1.png`;
                this.labPrice1.text = `46`;
            }
            else if (this.disSta == discountState.sanzhe) {
                this.imgNum1.skin = `blueMoon/imgNone.png`;
                this.imgNum3.skin = `blueMoon/imgBuy.png`;
                this.imgNum5.skin = `blueMoon/imgBuy.png`;
                this.imgNum7.skin = `blueMoon/imgBuy.png`;
                this.imgNum9.skin = `blueMoon/imgBuy.png`;
                this.imgDiscount.skin = `blueMoon/discount3.png`;
                this.labPrice1.text = `138`;
            }
            else if (this.disSta == discountState.wuzhe) {
                this.imgNum1.skin = `blueMoon/imgNone.png`;
                this.imgNum3.skin = `blueMoon/imgNone.png`;
                this.imgNum5.skin = `blueMoon/imgBuy.png`;
                this.imgNum7.skin = `blueMoon/imgBuy.png`;
                this.imgNum9.skin = `blueMoon/imgBuy.png`;
                this.imgDiscount.skin = `blueMoon/discount5.png`;
                this.labPrice1.text = `230`;
            }

            else if (this.disSta == discountState.qizhe) {
                this.imgNum1.skin = `blueMoon/imgNone.png`;
                this.imgNum3.skin = `blueMoon/imgNone.png`;
                this.imgNum5.skin = `blueMoon/imgNone.png`;
                this.imgNum7.skin = `blueMoon/imgBuy.png`;
                this.imgNum9.skin = `blueMoon/imgBuy.png`;
                this.imgDiscount.skin = `blueMoon/discount7.png`;
                this.labPrice1.text = `322`;
            }
            else if (this.disSta == discountState.jiuzhe) {
                this.imgNum1.skin = `blueMoon/imgNone.png`;
                this.imgNum3.skin = `blueMoon/imgNone.png`;
                this.imgNum5.skin = `blueMoon/imgNone.png`;
                this.imgNum7.skin = `blueMoon/imgNone.png`;
                this.imgNum9.skin = `blueMoon/imgBuy.png`;
                this.imgDiscount.skin = `blueMoon/discount9.png`;
                this.labPrice1.text = `414`;
            }
            else {
                this.imgNum1.skin = `blueMoon/imgNone.png`;
                this.imgNum3.skin = `blueMoon/imgNone.png`;
                this.imgNum5.skin = `blueMoon/imgNone.png`;
                this.imgNum7.skin = `blueMoon/imgNone.png`;
                this.imgNum9.skin = `blueMoon/imgNone.png`;
                this.imgDiscount.skin = `blueMoon/discount0.png`;
                this.labPrice1.text = `460`;
            }
        }
        /**购买 */
        private async onBuy() {
            await this.getUpdata();
            let price = parseInt(this.labPrice1.text);
            let have = clientCore.ItemsInfo.getItemNum(this.coinId);
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(this.coinId)}购买幽蓝弥梦套装?`, {
                callBack: {
                    caller: this,
                    funArr: [async () => {
                        await this.getUpdata();
                        if (have >= price) {
                            if (price == parseInt(this.labPrice1.text)) {
                                let idx: number;
                                switch (this.disSta) {
                                    case discountState.yizhe: idx = 1;
                                        break;
                                    case discountState.sanzhe: idx = 3;
                                        break;
                                    case discountState.wuzhe: idx = 5;
                                        break;
                                    case discountState.qizhe: idx = 7;
                                        break;
                                    case discountState.jiuzhe: idx = 9;
                                        break;
                                    case discountState.yuanjia: idx = 0;
                                        break;
                                }
                                net.sendAndWait(new pb.cs_season_appoint_buy({ discount: idx })).then((msg: pb.sc_season_appoint_buy) => {
                                    alert.showReward(msg.item);
                                });
                            }
                            else {
                                this.onBuy();
                            }
                        }
                        else {
                            alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        }
                    }]
                }
            })

        }

        /**拉取购买记录 */
        private getBuyInfo() {
            return net.sendAndWait(new pb.cs_season_appoint_buy_history()).then((msg: pb.sc_season_appoint_buy_history) => {
                this.buyInfo = msg?.buyHistory ?? [];
                this.listBuyInfo.array = this.buyInfo;
                this.listBuyInfo.startIndex = this.buyInfo.length - 4;
                this.listBuyInfo.tweenTo(this.buyInfo.length - 4);
            })
        }
        private buyInfoRender(item: ui.bigCharge.render.PanicInfoRenderUI) {
            let data: pb.YFLSTopCloudBuyHistory = item.dataSource;
            if (data.nick.length > 3) {
                item.labName.fontSize = Math.floor(60 / data.nick.length);
            } else {
                item.labName.fontSize = 20;
            }
            item.labName.text = data.nick;
            if (data.discount == 1) {
                item.laboff.text = "一折";
            } else if (data.discount == 3) {
                item.laboff.text = "三折";
            } else if (data.discount == 5) {
                item.laboff.text = "五折";
            } else if (data.discount == 7) {
                item.laboff.text = "七折";
            } else if (data.discount == 9) {
                item.laboff.text = "九折";
            }
        }



    }
}