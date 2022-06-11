namespace happinessFlavour {
    /**
     * 2021.12.24
     * 圣诞祝福
     * happinessFlavour.CrismasPanel
    */
    export class CrismasPanel extends ui.happinessFlavour.panel.ChristmasPanelUI {
        private eventInfo: pb.sc_christmas_greetings_info;
        private ani: clientCore.Bone;
        constructor(data: pb.sc_christmas_greetings_info) {
            super();
            this.eventInfo = data;
            this.imgSuit.skin = `happinessFlavour/ChristmasPanel/suit${clientCore.LocalInfo.sex}.png`;
            this.ani = clientCore.BoneMgr.ins.play("res/animate/chrismasInteract/mainmenu.sk", 0, true, this.bg);
        }

        show() {
            clientCore.Logger.sendLog('2021年12月24日活动', '【活动】圣诞祝福', '打开主活动面板');
            this.addEventListeners();
            this.labAll.text = `全服福气值：${this.eventInfo.allNum}/50000`;
            this.imgGotAll.visible = this.eventInfo.flag == 1;
            this.labCost1.text = "  50";
            this.labCost2.text = " 2000";
            this.checkSuit();
            this.setDrawCost();
            clientCore.UIManager.setMoneyIds([9900281, 9900001]);
            clientCore.UIManager.showCoinBox();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        //检查套装
        private checkSuit() {
            this.btnGetGift.visible = !clientCore.ItemsInfo.checkHaveItem(2110559);
            this.imgSuitGot.visible = !this.btnGetGift.visible;
        }

        //帮助说明
        private onRule() {
            alert.showRuleByID(1225);
        }

        //前往国家花园寻找礼盒
        private goGarden() {
            clientCore.Logger.sendLog('2021年12月24日活动', '【活动】圣诞祝福', '点击前往找礼盒');
            clientCore.ModuleManager.closeAllOpenModule();
            if (clientCore.MapInfo.mapID != 12) {
                clientCore.MapManager.enterWorldMap(12);
            }
        }

        //领取全服奖励
        private getAllReward() {
            if (this.eventInfo.flag == 1) {
                alert.showFWords("奖励已领取~");
                this.showAllTip();
                return;
            }
            if (this.eventInfo.allNum < 50000) {
                alert.showFWords("未达到领取条件~");
                this.showAllTip();
                return;
            }
            this.eventInfo.flag = 1;
            net.sendAndWait(new pb.cs_christmas_greetings_reward()).then((msg: pb.sc_christmas_greetings_reward) => {
                alert.showReward(msg.item);
                this.imgGotAll.visible = true;
                util.RedPoint.reqRedPointRefresh(29315);
            }).catch(() => {
                this.eventInfo.flag = 0;
            })
        }

        //全服奖励tip
        private showAllTip() {
            let reward: xls.pair[] = clientCore.LocalInfo.sex == 1 ? [{ v1: 150153, v2: 1 }, { v1: 127066, v2: 1 }, { v1: 132430, v2: 1 }, { v1: 121580, v2: 1 }, { v1: 9900281, v2: 50 }] : [{ v1: 150154, v2: 1 }, { v1: 127075, v2: 1 }, { v1: 132443, v2: 1 }, { v1: 121590, v2: 1 }, { v1: 9900281, v2: 50 }];
            clientCore.ToolTip.showContentTips(this.btnAllGift, 0, reward);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private canDraw: boolean;
        private callClick() {
            if (!this.canDraw) {
                alert.showFWords("所需代币不足~");
                return;
            }
            if (this._loading) return; //等待中
            clientCore.Logger.sendLog('2021年12月24日活动', '【活动】圣诞祝福', '点击拆开礼物');
            alert.showSmall(`确定消耗相应代币拆开礼物？`, {
                callBack: {
                    funArr: [() => {
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 1106, times: 1 })).then((data: pb.sc_common_activity_draw) => {
                            clientCore.ModuleManager.open("drawReward.DrawRewardShowModule", data.item);
                            this.setDrawCost();
                            util.RedPoint.reqRedPointRefreshArr([29314,29316]);
                            this._loading = false;
                        }).catch(() => {
                            this._loading = false;
                        })
                    }], caller: this
                }
            });
        }

        private setDrawCost() {
            let have1 = clientCore.ItemsInfo.getItemNum(9900281);
            let have2 = clientCore.ItemsInfo.getItemNum(9900001) > 2000 ? 2000 : clientCore.ItemsInfo.getItemNum(9900001);
            this.canDraw = have1 >= 50 && have2 >= 2000;
            this.checkSuit();
        }
        //#endregion

        //打开圣诞风尚
        private openCrismasShow() {
            clientCore.Logger.sendLog('2021年12月24日活动', '【活动】圣诞祝福', '点击圣诞风尚奖');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("christmasShow.ChristmasShowModule");
        }

        //隐藏tips
        private hideTips(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                if (!this.tipGift.hitTestPoint(e.stageX, e.stageY)) {
                    this.tipGift.visible = false;
                }
            }
        }

        private showSuitTip(e: Laya.Event) {
            e.stopPropagation();
            this.tipGift.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goGarden);
            BC.addEvent(this, this.btnAllGift, Laya.Event.CLICK, this, this.getAllReward);
            BC.addEvent(this, this.btnGetGift, Laya.Event.CLICK, this, this.callClick);
            BC.addEvent(this, this.btnFashion, Laya.Event.CLICK, this, this.openCrismasShow);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.hideTips);
            BC.addEvent(this, this.imgGift, Laya.Event.CLICK, this, this.showSuitTip);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.setDrawCost);
        }

        removeEventListeners() {
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.setDrawCost);
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this.eventInfo = null;
            this.ani?.dispose();
            this.removeEventListeners();
            super.destroy();
        }
    }

}