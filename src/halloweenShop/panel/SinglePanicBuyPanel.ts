namespace halloweenShop {
    export class SinglePanicBuyPanel extends ui.halloweenShop.panel.SinglePanicBuyPanelUI {
        private readonly suitId: number = 2110508;
        private readonly price: number = 460;
        private waiting: boolean = false;
        private buyInfo: pb.IYFLSTopCloudBuyHistory[];
        private curOff: number;
        private curOffCount: number;
        private countTime: number = 5;
        private initCnt: number = 5;
        constructor() {
            super();
            this.listBuyInfo.vScrollBarSkin = "";
            this.listBuyInfo.renderHandler = new Laya.Handler(this, this.buyInfoRender);
            this.listOffInfo.renderHandler = new Laya.Handler(this, this.offInfoRender);
            this.listOffInfo.array = [1, 3, 5, 7, 9];
            this.labPrice.text = "" + this.price;
            this.getBuyInfo();
            this.icon0.skin = this.icon1.skin = clientCore.ItemsInfo.getItemIconUrl(HalloweenShopModel.instance.coinid);
            //this.addEventListeners();
        }

        private buyInfoRender(item: ui.halloweenShop.render.PanicInfoRenderUI) {
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

        private offInfoRender(item: ui.yearSong.render.LimitInfoRenderUI) {
            let off: number = item.dataSource;
            item.imgFlag.skin = (off >= this.curOff && this.curOff > 0) ? "halloweenShop/SinglePanicBuyPanel/re_mai_zhong.png" : "halloweenShop/SinglePanicBuyPanel/yi_shou_wan.png"
            item.imgFlag.visible = off <= this.curOff || this.curOff == 0;
            if (this.initCnt <= 0) return;
            if (off == 1) {
                item.labOff.text = "『一折』";
                item.labCnt.text = channel.ChannelControl.ins.isOfficial ? "25" : "50";
            } else if (off == 3) {
                item.labOff.text = "『三折』";
                item.labCnt.text = channel.ChannelControl.ins.isOfficial ? "80" : "160";
            } else if (off == 5) {
                item.labOff.text = "『五折』";
                item.labCnt.text = channel.ChannelControl.ins.isOfficial ? "200" : "400";
            } else if (off == 7) {
                item.labOff.text = "『七折』";
                item.labCnt.text = channel.ChannelControl.ins.isOfficial ? "400" : "800";
            } else if (off == 9) {
                item.labOff.text = "『九折』";
                item.labCnt.text = channel.ChannelControl.ins.isOfficial ? "600" : "1200";
            }
            this.initCnt--;
        }

        async show() {
            clientCore.LoadingManager.showSmall();
            await this.refreshOffInfo();
            clientCore.UIManager.setMoneyIds([HalloweenShopModel.instance.coinid , 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.Logger.sendLog('2021年11月5日活动', '【付费】搞怪糖果商城', '打开万圣特卖面板');
        }

        private setUI() {
            this.imgGot.visible = clientCore.SuitsInfo.getSuitInfo(this.suitId).allGet;
            this.labTime.visible = this.checkSell() > 0;
            this.btnBuy.visible = this.checkSell() <= 0 && !this.imgGot.visible;
            this.time_di.visible = this.checkSell() > 0;
            let price = this.price;
            if (this.curOff == 0) {
                this.labCur.text = price.toString();
            } else {
                this.labCur.text = (price * this.curOff / 10).toString();
            }
            if (this.curOff > 0) this.labCnt.text = this.curOffCount.toString();
            else this.labCnt.text = "不限量";
            this.imgOff.skin = `halloweenShop/SinglePanicBuyPanel/dang_qian${this.curOff}_zhe.png`;
            this.listOffInfo.refresh();
        }

        /**检查开卖时间 */
        private checkSell(): number {
            let endT: number = util.TimeUtil.formatTimeStrToSec("2021/10/29 20:10:00");
            return endT - clientCore.ServerManager.curServerTime;
        }

        /**拉取购买记录 */
        private getBuyInfo() {
            return net.sendAndWait(new pb.cs_season_appoint_buy_history()).then((msg: pb.sc_season_appoint_buy_history) => {
                this.buyInfo = msg?.buyHistory ?? [];
                this.listBuyInfo.array = this.buyInfo;
                this.listBuyInfo.startIndex = this.buyInfo.length - 4;
                this.listBuyInfo.tweenTo(this.buyInfo.length - 4);
                this.addEventListeners();
            })
        }
        /**购买*/
        private buySuit() {
            let cost = parseInt(this.labCur.text);
            let have = clientCore.ItemsInfo.getItemNum(HalloweenShopModel.instance.coinid);
            if (have < cost) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(HalloweenShopModel.instance.coinid)}不足,是否前往补充?`, { callBack: { funArr: [HalloweenShopModel.instance.coinNotEnough], caller: this } });
                return;
            }
            let off: number = this.curOff; //打开的时候 需要缓存一下折扣值 以防打开的时候折扣发生变化... 有争议
            alert.showSmall(`是否花费${cost}${clientCore.ItemsInfo.getItemName(HalloweenShopModel.instance.coinid)}购买预言之书套装?`, {
                callBack: {
                    caller: this, funArr: [async () => {
                        if (this.waiting) return;
                        this.waiting = true;
                        let res = await this.sureBuy(off);
                        if (res) {
                            HalloweenShopModel.instance.coinCost(cost);
                            alert.showReward(res.item);
                            this.imgGot.visible = true;
                            this.btnBuy.visible = false;
                        }
                        this.waiting = false;
                    }]
                }
            })
        }

        private sureBuy(off: number) {
            return net.sendAndWait(new pb.cs_season_appoint_buy({ discount: off })).then((msg: pb.sc_season_appoint_buy) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return null;
            });
        }

        /**刷新购买信息和剩余数量 */
        private refreshBuyInfo(info: pb.sc_season_appoint_notify) {
            let data = info.buyHistory;
            if (this.buyInfo.indexOf(data) >= 0) return;
            this.buyInfo.push(data);
            this.listBuyInfo.updateArray(this.buyInfo);
            if (this.listBuyInfo.startIndex == this.buyInfo.length - 5) {
                this.listBuyInfo.tweenTo(this.listBuyInfo.length - 4);
            }
            if (data.discount > this.curOff && this.curOff > 0) {
                this.refreshOffInfo();
                this.countTime = 5;
            } else {
                this.curOffCount--;
                this.labCnt.text = this.curOffCount.toString();
            }
        }

        /**每五秒刷新折扣信息 */
        private async refreshOffInfo() {
            return net.sendAndWait(new pb.cs_season_appoint_panel()).then((msg: pb.sc_season_appoint_panel) => {
                if (msg.oneDiscount > 0) {
                    this.curOff = 1;
                    this.curOffCount = msg.oneDiscount;
                } else if (msg.threeDiscount > 0) {
                    this.curOff = 3;
                    this.curOffCount = msg.threeDiscount;
                } else if (msg.fiveDiscount > 0) {
                    this.curOff = 5;
                    this.curOffCount = msg.fiveDiscount;
                } else if (msg.sevenDiscount > 0) {
                    this.curOff = 7;
                    this.curOffCount = msg.sevenDiscount;
                } else if (msg.nineDiscount > 0) {
                    this.curOff = 9;
                    this.curOffCount = msg.nineDiscount;
                } else {
                    this.curOff = 0;
                }
                this.setUI();
            })
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }

        /**秒级刷新 */
        private onTime() {
            if (this.checkSell() > 0) {
                this.labTime.changeText(`${util.StringUtils.getDateStr2(this.checkSell(), '{hour}:{min}:{sec}')}`);
            } else {
                this.btnBuy.visible = !this.imgGot.visible;
                this.labTime.visible = false;
                this.time_di.visible = false;
                if (this.countTime > 0) {
                    this.countTime--;
                } else if (this.curOff > 0) {
                    this.refreshOffInfo();
                    this.countTime = 5;
                }
            }
        }

        addEventListeners() {
            Laya.timer.loop(1000, this, this.onTime);
            net.listen(pb.sc_season_appoint_notify, this, this.refreshBuyInfo);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.onTime);
            net.unListen(pb.sc_season_appoint_notify, this, this.refreshBuyInfo);
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
        }

    }
}