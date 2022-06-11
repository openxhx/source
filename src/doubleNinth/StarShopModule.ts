namespace doubleNinth {
    /**
     * 重阳节茱萸小店
     * doubleNinth.SartShopModule
     * 2021.10.15
     */
    export class SartShopModule extends ui.doubleNinth.StarShopModuleUI {
        private moneyId: number = 9900253;//代币id
        private ruleId: number = 1215;//规则
        private suitId: number[] = [2110516, 2110517];//套装ID
        private headId: number = 2500056;//头像框
        private drawId: number;
        private starGiftPanel: StarGiftPanel;
        private rewardPanel: RewardPanel;
        private _onePanel: OneRewardPanel;
        private skeleton: clientCore.Bone;
        private isAdult: boolean;

        init() {
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.rechargeEvent));
            this.addPreLoad(xls.load(xls.probability));
        }

        onPreloadOver() {
            this.ruleId = clientCore.LocalInfo.age >= 18 ? 1215 : 1216;
            clientCore.UIManager.setMoneyIds([this.moneyId]);
            clientCore.UIManager.showCoinBox();
            this.giftBoxInfo();
            this.headState();
            this.isAdult = clientCore.LocalInfo.age >= 18;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnGoHome, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.goShop);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGetHead);
            BC.addEvent(this, this.btnTodayGift, Laya.Event.CLICK, this, this.onTodayGift);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            for (let i = 0; i < 8; i++) {
                BC.addEvent(this, this['imgstore' + i], Laya.Event.CLICK, this, this.onGiftBox, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.starGiftPanel?.destroy();
            this.rewardPanel?.destroy();
            this._onePanel?.destroy();
            this.skeleton?.dispose();
            this.starGiftPanel = this.rewardPanel = this._onePanel = this.suitId = null;
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }

        /**规则说明 */
        private onRule(): void {
            alert.showRuleByID(this.ruleId);
        }

        /**跳转到小店 */
        private goShop(): void {
            this.destroy();
            clientCore.ModuleManager.open('doubleNinth.DoubleNinthModule');
        }

        /**头像领取状态 */
        private headState() {
            let hasSuit0 = clientCore.ItemsInfo.checkHaveItem(this.suitId[0]);
            let hasSuit1 = clientCore.ItemsInfo.checkHaveItem(this.suitId[1]);
            let hasHead = clientCore.UserHeadManager.instance.getOneInfoById(this.headId)?.have;
            if ((hasSuit0 && hasSuit1) && !hasHead) {
                this.ani1.play(0, true);
                this.light.visible = true;
                this.btnGet.disabled = false;
            }
            else if (hasHead) {
                this.onGetHeadFrame();
            }
            else {
                this.btnGet.disabled = true;
            }
        }

        private onGetHeadFrame() {
            this.btnGet.skin = "doubleNinth/yilingqu.png";
            this.btnGet.disabled = false;
            this.btnGet.mouseEnabled = false;
        }

        /**头像框领取 */
        private onGetHead() {
            this.onGetHeadFrame();
            net.sendAndWait(new pb.cs_chongyang_zhuyu_store_reward).then((Item: pb.sc_chongyang_zhuyu_store_reward) => {
                alert.showReward(Item.item);
                this.light.visible = false;
                this.ani1.stop();
                clientCore.UserHeadManager.instance.refreshAllHeadInfo();
            });
        }


        /**今日特惠 */
        private onTodayGift() {
            this.starGiftPanel = this.starGiftPanel || new StarGiftPanel();
            this.starGiftPanel.show();
        }

        /**奖励详情 */
        private onReward() {
            this.rewardPanel = this.rewardPanel || new RewardPanel();
            this.rewardPanel.show(this.drawId);
        }

        /**抽奖礼盒初始化 */
        private giftBoxInfo() {
            this.drawId = 1105;
            for (let i = 1102; i <= 1104; i++) {
                let cfg = _.filter(xls.get(xls.godTree).getValues(), (o) => { return o.module == i && o.type == 3 });
                let cloths = _.map(cfg, (o) => { return (clientCore.LocalInfo.sex == 1 ? o.item : o.itemMale).v1 });
                for (let j = 0; j < cloths.length; j++) {
                    if (!clientCore.ItemsInfo.checkHaveItem(cloths[j])) {
                        this.drawId = i;
                        return;
                    }
                }
            }
        }

        /**点击抽奖 */
        private onGiftBox(ids: number) {
            this.skeleton?.dispose();
            this.skeleton = clientCore.BoneMgr.ins.play(`res/animate/doubleNinth/openEffect.sk`, 0, false, this['imgstore' + ids]);
            this.skeleton.pos(77, 57);
            this.giftBoxInfo();
            let haveMoney = clientCore.ItemsInfo.getItemNum(this.moneyId);
            if (haveMoney < (this.isAdult ? 10 : 5)) {
                alert.showSmall("星星币不足！", {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            this.skeleton?.dispose();
                            this.skeleton = clientCore.BoneMgr.ins.play(`res/animate/doubleNinth/resetEffect.sk`, 0, false, this['imgstore' + ids]);
                            this.skeleton.pos(77, 57);
                        }]
                    }
                });
            } else {
                alert.showSmall(`是否花费${(this.isAdult ? 10 : 5)}${clientCore.ItemsInfo.getItemName(this.moneyId)}打开礼包?`, {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            this.skeleton?.dispose();
                            this.skeleton = clientCore.BoneMgr.ins.play(`res/animate/doubleNinth/resetEffect.sk`, 0, false, this['imgstore' + ids]);
                            this.skeleton.pos(77, 57);
                            this.mouseEnabled = false;
                            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: this.drawId, times: 1 })).then((data: pb.sc_common_activity_draw) => {
                                this.getOne(data.item[0]);
                                this.headState();
                            });
                        }]
                    }
                })
            }
        }

        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (!itemInfo) {
                this.mouseEnabled = true;
                return;
            }
            if (xls.get(xls.itemCloth).get(itemInfo.reward.id)?.suitId && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            }
            else {
                if (!this._onePanel) this._onePanel = new OneRewardPanel();
                clientCore.DialogMgr.ins.open(this._onePanel, false);
                this._onePanel.showReward(rwdInfo);
            }
            this.mouseEnabled = true;
        }
    }
}