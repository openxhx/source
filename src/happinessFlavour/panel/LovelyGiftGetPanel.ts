namespace happinessFlavour {
    /**
     * 2021.12.3
     * 可可爱爱小礼物
     * HappinessFlavour.LovelyGiftGetPanel
    */
    export class LovelyGiftGetPanel extends ui.happinessFlavour.panel.LovelyGiftGetPanelUI {
        private aniGift: clientCore.Bone;
        init() {
            this.updataUI();
            clientCore.UIManager.setMoneyIds([9900246, 9900247, 9900248]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {

        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.tips);
            BC.addEvent(this, this.labGo, Laya.Event.CLICK, this, this.onGo);

        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.aniGift?.dispose();
            this.aniGift = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();

        }

        private onClose() {
            this.destroy();
            clientCore.ModuleManager.open("happinessFlavour.HappinessFlavourModule", "1");
        }

        private onRule() {
            alert.showRuleByID(1222);
        }

        private onGet() {
            if (clientCore.ItemsInfo.getItemNum(9900273) > 0) {
                this.mouseEnabled = false;
                this.btnGift.visible = false;
                this.aniGift = clientCore.BoneMgr.ins.play(`res/animate/happinessFlavour/bag.sk`, 0, false, this.imgGift);
                this.aniGift.pos(62, 68);
                net.sendAndWait(new pb.cs_lovely_little_gift_open()).then((data: pb.sc_lovely_little_gift_open) => {
                    this.aniGift.once(Laya.Event.COMPLETE, this, () => {
                        this.aniGift?.dispose();
                        this.mouseEnabled = true;
                        this.btnGift.visible = true;
                        alert.showReward(data.item);
                        this.updataUI();
                    });

                });
            } else {
                alert.showSmall("是否要前往花仙乐园获得口袋？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.destroy();
                            clientCore.ModuleManager.open("playground.PlaygroundModule");
                        }]
                    }
                });
            }
        }

        private updataUI() {
            let num = clientCore.ItemsInfo.getItemNum(9900273);
            this.labnum.text = `当前拥有：${num}`;
            this.btnGet.skin = num > 0 ? "happinessFlavour/btn_caikai.png" : "happinessFlavour/btn_getkoudai.png";
        }

        private tips() {
            clientCore.ToolTip.showTips(this.btnGift, { id: 9900273 });
        }

        private onGo() {
            this.destroy();
            clientCore.ModuleManager.open("friends.FriendMainModule");
        }

    }
}
