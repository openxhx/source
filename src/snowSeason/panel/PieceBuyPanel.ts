namespace snowSeason {
    export class PieceBuyPanel extends ui.snowSeason.panel.PieceBuyPanelUI {

        private buyState: number;
        private timeStamp: number;
        private suitId: number = 2110295;
        private haveTimer: Boolean = false;
        private leftTime: number = 0;
        private suitCost:number = 399;
        private pieceCost:number = 98;

        constructor() {
            super();
            this.addEventListeners();
        }

        show() {
            this.addPreLoad(net.sendAndWait(new pb.cs_patch_buy_info({type:2})).then((msg: pb.sc_patch_buy_info) => {
                this.buyState = msg.buyBit == null ? 0 : msg.buyBit;
                this.timeStamp = msg.time == null ? 0 : msg.time;
                this.initPanel();
            }));
            clientCore.UIManager.setMoneyIds([SnowSeasonModel.instance.coinid ]);
            clientCore.UIManager.showCoinBox();
            this.suitShow.skin = `unpack/snowSeason/icon_${clientCore.LocalInfo.sex}.png`
            this.blockBg.skin = `unpack/snowSeason/block${clientCore.LocalInfo.sex}.png`
            for (let i: number = 0; i < 3; i++) {
                this["blockbg" + i].skin = clientCore.LocalInfo.sex == 1 ? `snowSeason/PieceBuyPanel/blockfemale_${i}.png` : `snowSeason/PieceBuyPanel/blockmale_${i}.png`;
            }
            clientCore.Logger.sendLog('2021年12月17日活动', '【付费】初雪的季节', '打开碎琼乱玉-庭前雪面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        initPanel() {
            let now: number = clientCore.ServerManager.curServerTime;
            if (this.buyState > 0 || clientCore.ItemsInfo.checkHaveItem(this.suitId)) {
                this.buyBtn.visible = false;
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
            EventManager.event('SnowSeason_SHOW_EVENT_PANEL', panelType.pieceBuyNew);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.buyBtn, Laya.Event.CLICK, this, this.onBuyClick);
            for (let i: number = 0; i < 3; i++) {
                BC.addEvent(this, this["openBtn" + i], Laya.Event.CLICK, this, this.onOpenClick, [i]);
            }
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.helpBtn, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.otherBtn, Laya.Event.CLICK, this, this.openOther);
        }

        private onRule() {
            alert.showRuleByID(1210);
        }

        private onTry(): void {
            alert.showCloth(this.suitId);
        }

        onOpenClick(i: number) {
            let have = clientCore.ItemsInfo.getItemNum(SnowSeasonModel.instance.coinid);
            alert.showSmall(`是否花费`+this.pieceCost +`纷飞玉屑开启`+clientCore.ItemsInfo.getItemName(this.suitId)+`碎片?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < this.pieceCost) {
                            alert.showSmall(`所需纷飞玉屑不足,是否前往补充?`, {
                                callBack: {
                                    funArr: [SnowSeasonModel.instance.coinNotEnough],
                                    caller: this
                                }
                            });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: i + 1  , type:2})).then((msg: pb.sc_patch_buy_reward) => {
                                alert.showFWords("碎片开启成功~");
                                if (msg.item && msg.item.length > 0) {
                                    alert.showReward(msg.item);
                                }
                                net.sendAndWait(new pb.cs_patch_buy_info({type:2})).then((msg: pb.sc_patch_buy_info) => {
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
            let have = clientCore.ItemsInfo.getItemNum(SnowSeasonModel.instance.coinid);
            alert.showSmall(`是否花费`+this.suitCost+`纷飞玉屑购买`+ clientCore.ItemsInfo.getItemName(this.suitId)+`?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < this.suitCost) {
                            alert.showSmall(`所需纷飞玉屑不足,是否前往补充?`, {
                                callBack: {
                                    funArr: [SnowSeasonModel.instance.coinNotEnough],
                                    caller: this
                                }
                            });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: 4 , type:2})).then((msg: pb.sc_patch_buy_reward) => {
                                alert.showReward(msg.item);
                                net.sendAndWait(new pb.cs_patch_buy_info({type:2})).then((msg: pb.sc_patch_buy_info) => {
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