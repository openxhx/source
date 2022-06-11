    /**
     * 2021.9.17
     * skyCloud.SkyCloudModule
     */
namespace skyCloud {
    export class SkyCloudModule extends ui.skyCloud.SkyCloudModuleUI {

        private buyState: number;
        private timeStamp: number;
        private suitId: number = 2100333;
        private haveTimer: Boolean = false;
        private leftTime: number = 0;

        init() {
            this.addPreLoad(net.sendAndWait(new pb.cs_patch_buy_info()).then((msg: pb.sc_patch_buy_info) => {
                this.buyState = msg.buyBit == null ? 0 : msg.buyBit;
                this.timeStamp = msg.time == null ? 0 : msg.time;
            }));
        }
        onPreloadOver() {
            this.initPanel();
            this.suitShow.skin = `unpack/skyCloud/icon_${clientCore.LocalInfo.sex}.png`
            this.blockBg.skin = `unpack/skyCloud/block${clientCore.LocalInfo.sex}.png`
            for (let i: number = 0; i < 3; i++) {
                this["blockbg" + i].skin = clientCore.LocalInfo.sex == 1 ? `skyCloud/blockfemale_${i}.png` : `skyCloud/blockmale_${i}.png`;
            }
            clientCore.Logger.sendLog('2021年9月17日活动', '【付费】凛空星云', '打开凛空星云面板');
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
            if (this.leftTime>0 && !this.haveTimer) {
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
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.helpBtn, Laya.Event.CLICK, this, this.onRule);
        }

        private onRule() {
            alert.showRuleByID(1210);
        }

        private onTry(): void {
            alert.showCloth(this.suitId);
        }

        onOpenClick(i: number) {
            let have = clientCore.ItemsInfo.getItemNum(9900003);
            alert.showSmall(`是否花费88灵豆开启凛空星云套装碎片?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < 88) {
                            alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: i + 1 })).then((msg: pb.sc_patch_buy_reward) => {
                                alert.showFWords("碎片开启成功~");
                                if (msg.item && msg.item.length > 0) {
                                    alert.showReward(msg.item);
                                }
                                net.sendAndWait(new pb.cs_patch_buy_info()).then((msg: pb.sc_patch_buy_info) => {
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
            let have = clientCore.ItemsInfo.getItemNum(9900003);
            alert.showSmall(`是否花费369灵豆购买凛空星云套装?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (have < 369) {
                            alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        } else {
                            net.sendAndWait(new pb.cs_patch_buy_reward({ index: 4 })).then((msg: pb.sc_patch_buy_reward) => {
                                alert.showReward(msg.item);
                                net.sendAndWait(new pb.cs_patch_buy_info()).then((msg: pb.sc_patch_buy_info) => {
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