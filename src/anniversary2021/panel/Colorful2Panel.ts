namespace anniversary2021 {
    /**
     * 缤纷色彩 黎明来访
     */
    export class Colorful2Panel extends ui.anniversary2021.panel.Colorful2PanelUI implements IPanel {
        private suit1: number = 2110323;
        private suit2: number = 2110324;
        private stage1: number = 1100066;
        private stage2: number = 1100067;
        private rideId: number = 1200014;
        private buyId1: number = 2541;
        private buyId2: number = 2544;
        private buyIdAll: number = 2547;
        ruleId: number = 1145;
        init(): void {
            this.pos(-180, 37);
            this.addEvents();
            for (let i: number = 1; i < 3; i++) {
                this['nan_' + i].visible = clientCore.LocalInfo.sex == 2;
                this['nv_' + i].visible = clientCore.LocalInfo.sex == 1;
            }
            //界面更新
            let hasSuit1 = clientCore.ItemsInfo.checkHaveItem(this.stage1);
            let hasSuit2 = clientCore.ItemsInfo.checkHaveItem(this.stage2);
            let hasRide = clientCore.ItemsInfo.checkHaveItem(this.rideId);
            this.btnBuy1.visible = this.boxPrice1.visible = !hasSuit1;
            this.btnBuy2.visible = this.boxPrice2.visible = !hasSuit2;
            this.btnBuyAll.visible = this.boxPriceAll.visible = !hasSuit1 && !hasSuit2;
            this.btnGet.visible = hasSuit1 && hasSuit2 && !hasRide;
            this.imgGet1.visible = hasSuit1;
            this.imgGet2.visible = hasSuit2;
            this.imgGet3.visible = hasRide;
            //价格
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.buyId1 += 2;
                this.buyId2 += 2;
                this.buyIdAll += 2;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.buyId1 += 1;
                this.buyId2 += 1;
                this.buyIdAll += 1;
            }
            for (let i: number = 1; i <= 3; i++) {
                let oriId: number[] = [2541, 2544, 2547];
                let cfgOri = xls.get(xls.eventExchange).get(oriId[i - 1]);
                let cfgLv1 = xls.get(xls.eventExchange).get(oriId[i - 1] + 1);
                let cfgLv3 = xls.get(xls.eventExchange).get(oriId[i - 1] + 2);
                this["labOri" + i].text = '' + cfgOri.cost[0].v2;
                this["labLv1" + i].text = '' + cfgLv1.cost[0].v2;
                this["labLv3" + i].text = '' + cfgLv3.cost[0].v2;
            }
        }

        show(parent: Laya.Sprite): void {
            clientCore.Logger.sendLog('2021年3月26日活动', '【付费】小花仙周年庆典', '打开黎明来访面板');
            EventManager.event("ANNIVERSARY2021_SHOW_TIME", "活动时间：3月26~4月8日");
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
        }

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        dispose(): void {
            BC.removeEvent(this);
        }

        private addEvents(): void {
            for (let i: number = 1; i <= 5; i++) {
                BC.addEvent(this, this['btnTry' + i], Laya.Event.CLICK, this, this.onTry, [i]);
            }
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.onBuy, [2]);
            BC.addEvent(this, this.btnBuyAll, Laya.Event.CLICK, this, this.onBuy, [3]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }

        private updateReward(): void {
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(this.rideId);
            this.btnBuyAll.visible = this.boxPriceAll.visible = !(clientCore.ItemsInfo.checkHaveItem(this.stage1) || clientCore.ItemsInfo.checkHaveItem(this.stage2));
            this.btnGet.visible = clientCore.ItemsInfo.checkHaveItem(this.stage1) && clientCore.ItemsInfo.checkHaveItem(this.stage2) && !has;
        }

        private updateCloth(index: number): void {
            let has: boolean = clientCore.ItemsInfo.checkHaveItem([this.stage1, this.stage2][index - 1]);
            this['boxPrice' + index].visible = !has;
            this['btnBuy' + index].visible = !has;
            this['imgGet' + index].visible = has;
        }

        private onTry(index: number): void {
            switch (index) {
                case 1:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit1);
                    break;
                case 2:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit2);
                    break;
                case 3:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.stage1, condition: '' });
                    break;
                case 4:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.stage2, condition: '' });
                    break;
                case 5:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.rideId, condition: '集齐黎明来访两件套装' });
                    break;
                default:
                    break;
            }
        }

        /** 奖励领取*/
        private onGet(): void {
            this.btnGet.visible = false;
            net.sendAndWait(new pb.cs_anniversary_two_stage_get_cloth()).then((msg: pb.sc_anniversary_two_stage_get_cloth) => {
                alert.showReward(msg.items);
            }).catch(() => {
                this.btnGet.visible = true;
            })
        }

        private onBuy(index: number): void {
            let target: number;
            switch (index) {
                case 1:
                    target = this.buyId1;
                    break;
                case 2:
                    target = this.buyId2;
                    break;
                case 3:
                    target = this.buyIdAll;
                    break;
            }
            let price: number = xls.get(xls.eventExchange).get(target).cost[0].v2;
            alert.showSmall(`是否确认花费灵豆x${price}购买？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_common_exchange({ activityId: 133, exchangeId: target })).then((msg: pb.sc_common_exchange) => {
                            alert.showReward(msg.item);
                            if (index == 3) {
                                this.updateCloth(1);
                                this.updateCloth(2);
                            } else {
                                this.updateCloth(index);
                            }
                            this.updateReward();
                        })
                    }]
                }
            })
        }
    }
}