namespace springOverture {
    export class PieceBuyPanel extends ui.springOverture.panel.PieceBuyPanelUI {

        private buyState: number;
        private timeStamp: number;
        private suitId: number = 2110616;
        private haveTimer: Boolean = false;
        private leftTime: number = 0;
        private suitCost: number = 220;
        private pieceCost: number = 69;
        private coin: number = 9900284;

        constructor() {
            super();
            this.addEventListeners();
        }

        show(box: any) {
            this.addPreLoad(net.sendAndWait(new pb.cs_patch_buy_info({ type: 2 })).then((msg: pb.sc_patch_buy_info) => {
                this.buyState = msg.buyBit == null ? 0 : msg.buyBit;
                this.timeStamp = msg.time == null ? 0 : msg.time;
                this.initPanel();
            }));
            box.addChild(this);
            EventManager.event(CHANGE_TIME, "time_11_24");
            clientCore.UIManager.setMoneyIds([this.coin]);
            clientCore.UIManager.showCoinBox();
            this.suitDi.skin = this.suitShow.skin = `unpack/springOverture/${this.suitId}_${clientCore.LocalInfo.sex}.png`;
            clientCore.Logger.sendLog('2022年3月11日活动', '【付费】春日序曲', '打开冰雪消融-纯白丘比特面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        initPanel() {
            let now: number = clientCore.ServerManager.curServerTime;
            if (this.buyState > 0 || clientCore.ItemsInfo.checkHaveItem(this.suitId)) {
                this.buyBtn.visible = false;
                this.getTip.visible = false;
            }
            for (let i: number = 0; i < 3; i++) {
                this["block" + i].visible = util.getBit(this.buyState, i + 1) == 0 && !clientCore.ItemsInfo.checkHaveItem(this.suitId);
                this["labTime" + i].visible = util.getBit(this.buyState, i + 1) == 0 && !clientCore.ItemsInfo.checkHaveItem(this.suitId);
                if (this.timeStamp == 0 || now - this.timeStamp >= 24 * 60 * 60) {
                    this["openBtn" + i].disabled = false;
                } else {
                    this["openBtn" + i].disabled = true;
                    this.leftTime = 24 * 60 * 60 - (now - this.timeStamp);
                }
            }
            if (this.leftTime > 0 && !this.haveTimer) {
                Laya.timer.loop(1000, this, this.refreshTime);
            }
        }

        refreshTime() {
            this.leftTime--;
            for (let i: number = 0; i < 3; i++) {
                this["labTime" + i].text = `${util.StringUtils.getDateStr2(this.leftTime)}\n后可开启`;
            }
            if (this.leftTime <= 0) {
                for (let i: number = 0; i < 3; i++) {
                    this["openBtn" + i].disabled = false;
                    this["openBtn" + i].parent.disabled = false;
                    this["labTime" + i].text = `可开启`;
                }
                Laya.timer.clear(this, this.refreshTime);
                this.haveTimer = false;
            }
        }

        private openOther() {
            EventManager.event(CHANGE_PANEL, subpanel.pieceBuy1);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.buyBtn, Laya.Event.CLICK, this, this.onBuyClick);
            for (let i: number = 0; i < 3; i++) {
                BC.addEvent(this, this["openBtn" + i], Laya.Event.CLICK, this, this.onOpenClick, [i]);
            }
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.helpBtn, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
        }

        private onRule() {
            alert.showRuleByID(1210);
        }

        private onTry(): void {
            alert.showCloth(this.suitId);
        }

        onOpenClick(i: number) {
            let have = clientCore.ItemsInfo.getItemNum(this.coin);
            alert.showSmall(`是否花费` + this.pieceCost + clientCore.ItemsInfo.getItemName(this.coin) + `开启` + clientCore.ItemsInfo.getItemName(this.suitId) + `碎片?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < this.pieceCost) {
                            alert.showSmall(`所需` + clientCore.ItemsInfo.getItemName(this.coin) + `不足,是否前往补充?`, {
                                callBack: {
                                    funArr: [SpringOvertureModel.instance.openCoinGiftBuy],
                                    caller: SpringOvertureModel.instance
                                }
                            });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: i + 1, type: 2 })).then((msg: pb.sc_patch_buy_reward) => {
                                SpringOvertureModel.instance.coinCost(this.pieceCost);
                                alert.showFWords("碎片开启成功~");
                                if (msg.item && msg.item.length > 0) {
                                    alert.showReward(msg.item);
                                }
                                net.sendAndWait(new pb.cs_patch_buy_info({ type: 2 })).then((msg: pb.sc_patch_buy_info) => {
                                    this.buyState = msg.buyBit == null ? 0 : msg.buyBit;
                                    this.timeStamp = msg.time == null ? 0 : msg.time;
                                    this.initPanel();
                                })

                            })
                        }
                    }]
                }
            })
        }

        onBuyClick() {
            let have = clientCore.ItemsInfo.getItemNum(this.coin);
            alert.showSmall(`是否花费` + this.suitCost + clientCore.ItemsInfo.getItemName(this.coin) + `购买` + clientCore.ItemsInfo.getItemName(this.suitId) + `?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < this.suitCost) {
                            alert.showSmall(`所需` + clientCore.ItemsInfo.getItemName(this.coin) + `不足,是否前往补充?`, {
                                callBack: {
                                    funArr: [SpringOvertureModel.instance.openCoinGiftBuy],
                                    caller: this
                                }
                            });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: 4, type: 2 })).then((msg: pb.sc_patch_buy_reward) => {
                                SpringOvertureModel.instance.coinCost(this.suitCost);
                                alert.showReward(msg.item);
                                net.sendAndWait(new pb.cs_patch_buy_info({ type: 2 })).then((msg: pb.sc_patch_buy_info) => {
                                    this.buyState = msg.buyBit == null ? 0 : msg.buyBit;
                                    this.timeStamp = msg.time == null ? 0 : msg.time;
                                    this.initPanel();
                                })
                            })
                        }
                    }]
                }
            })
        }


        removeEventListeners(): void {
            BC.removeEvent(this);
            if (this.haveTimer) {
                Laya.timer.clear(this, this.refreshTime);
            }
        }

        destroy() {
            super.destroy();
        }
    }
}