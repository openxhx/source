namespace flowerMass {
    export class PieceBuyPanel extends ui.flowerMass.panel.PieceBuyPanelUI {

        private buyState: number;
        private timeStamp: number;
        private suitId: number = 2110650;
        private haveTimer: Boolean = false;
        private leftTime: number = 0;
        private suitCost:number = 360;
        private pieceCost:number = 96;
        private coin: number = 9900316;
        private gift:number[] = [145691 , 145702] ;

        constructor() {
            super();
            this.addEventListeners();
        }

        show(box:any) {
            this.addPreLoad(net.sendAndWait(new pb.cs_patch_buy_info({type:1})).then((msg: pb.sc_patch_buy_info) => {
                this.buyState = msg.buyBit == null ? 0 : msg.buyBit;
                this.timeStamp = msg.time == null ? 0 : msg.time;
                this.initPanel();
            }));
            clientCore.UIManager.setMoneyIds([this.coin , 0]);
            clientCore.UIManager.showCoinBox();
            this.suitShow.skin = `unpack/flowerMass/${this.suitId}_${clientCore.LocalInfo.sex}.png`
            this.blockBg.skin = `unpack/flowerMass/block${clientCore.LocalInfo.sex}.png`
            for (let i: number = 0; i < 3; i++) {
                this["blockbg" + i].skin = clientCore.LocalInfo.sex == 1 ? `flowerMass/PieceBuyPanel/blockfemale_${i}.png` : `flowerMass/PieceBuyPanel/blockmale_${i}.png`;
            }
            EventManager.event(CHANGE_TIME, "time_6_19");
            box.addChild(this);
            clientCore.Logger.sendLog('2022年5月6日活动', '【付费】小花仙集合啦', '打开碎片记忆-草莓兔兔面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        initPanel() {
            let now: number = clientCore.ServerManager.curServerTime;
            if (this.buyState > 0 || clientCore.ItemsInfo.checkHaveItem(this.suitId)) {
                this.buyBox.visible = false;
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

        addEventListeners(): void {
            BC.addEvent(this, this.buyBtn, Laya.Event.CLICK, this, this.onBuyClick);
            for (let i: number = 0; i < 3; i++) {
                BC.addEvent(this, this["openBtn" + i], Laya.Event.CLICK, this, this.onOpenClick, [i]);
            }
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTry , [0]);
            BC.addEvent(this, this.tryBtn1, Laya.Event.CLICK, this, this.onTry , [1]);
            BC.addEvent(this, this.helpBtn, Laya.Event.CLICK, this, this.onRule);
        }

        private onRule() {
            alert.showRuleByID(1210);
        }

        private onTry(i:number): void {
            if(i == 0){
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitId);
            }else{
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.gift[clientCore.LocalInfo.sex-1]);
            }
        }

        onOpenClick(i: number) {
            let have = clientCore.ItemsInfo.getItemNum(this.coin);
            alert.showSmall(`是否花费`+this.pieceCost +`${clientCore.ItemsInfo.getItemName(this.coin)}开启`+clientCore.ItemsInfo.getItemName(this.suitId)+`碎片?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < this.pieceCost) {
                            alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { FlowerMassModel.instance.openCoinGiftBuy() }], caller: this } });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: i + 1  , type:1})).then((msg: pb.sc_patch_buy_reward) => {
                                FlowerMassModel.instance.coinCost(this.pieceCost);
                                alert.showFWords("碎片开启成功~");
                                if (msg.item && msg.item.length > 0) {
                                    alert.showReward(msg.item);
                                }
                                net.sendAndWait(new pb.cs_patch_buy_info({type:1})).then((msg: pb.sc_patch_buy_info) => {
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
            alert.showSmall(`是否花费`+this.suitCost+`${clientCore.ItemsInfo.getItemName(this.coin)}购买`+ clientCore.ItemsInfo.getItemName(this.suitId)+`?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < this.suitCost) {
                            alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { FlowerMassModel.instance.openCoinGiftBuy() }], caller: this } });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: 4  , type:1})).then((msg: pb.sc_patch_buy_reward) => {
                                FlowerMassModel.instance.coinCost(this.suitCost);
                                alert.showReward(msg.item);
                                net.sendAndWait(new pb.cs_patch_buy_info({type:1})).then((msg: pb.sc_patch_buy_info) => {
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