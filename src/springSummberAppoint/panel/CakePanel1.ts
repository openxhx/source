namespace springSummberAppoint{
    /**
     * 春日甜饼-古老风华
     */
    export class CakePanel1 extends ui.springSummberAppoint.panel.CakePanel1UI implements IPanel{
        private suit1: number = 2110335;
        private suit2: number = 2110336;
        private bgshow: number = 1000100;
        private buyId1: number = 2564;
        private buyId2: number = 2567;
        private buyIdAll: number = 2570;
        ruleId: number = 1149;
        constructor(){
            super();
            this.pos(1, -32);
            this.addEvents();
            for (let i: number = 1; i < 3; i++) {
                this['nan_' + i].visible = clientCore.LocalInfo.sex == 2;
                this['nv_' + i].visible = clientCore.LocalInfo.sex == 1;
            }
            //界面更新
            let hasSuit1: boolean = clientCore.SuitsInfo.checkHaveSuits(this.suit1);
            let hasSuit2: boolean = clientCore.SuitsInfo.checkHaveSuits(this.suit2);
            let hasBgShow: boolean = clientCore.ItemsInfo.checkHaveItem(this.bgshow);
            this.btnBuy1.visible = this.boxPrice1.visible = !hasSuit1;
            this.btnBuy2.visible = this.boxPrice2.visible = !hasSuit2;
            this.btnBuyAll.visible = this.boxPriceAll.visible = !hasSuit1 && !hasSuit2;
            this.btnGet.visible = hasSuit1 && hasSuit2 && !hasBgShow;
            this.imgGet1.visible = hasSuit1;
            this.imgGet2.visible = hasSuit2;
            this.imgGet3.visible = hasBgShow;
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
            let oriIds: number[] = [2564, 2567, 2570];
            for (let i: number = 1; i <= 3; i++) {
                let base: number = oriIds[i-1];
                let cfgOri = xls.get(xls.eventExchange).get(base);
                let cfgLv1 = xls.get(xls.eventExchange).get(base + 1);
                let cfgLv3 = xls.get(xls.eventExchange).get(base + 2);
                this["labOri" + i].text = '' + cfgOri.cost[0].v2;
                this["labLv1" + i].text = '' + cfgLv1.cost[0].v2;
                this["labLv3" + i].text = '' + cfgLv3.cost[0].v2;
            }
        }

        show(sign: number,parent: Laya.Sprite): void {
            parent.addChild(this);
        }

        hide(): void {
            this.removeSelf();
        }

        dispose(): void {
            BC.removeEvent(this);
        }

        private addEvents(): void {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this['btnTry' + i], Laya.Event.CLICK, this, this.onTry, [i]);
            }
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.onBuy, [2]);
            BC.addEvent(this, this.btnBuyAll, Laya.Event.CLICK, this, this.onBuy, [3]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }

        private updateReward(): void {
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(this.bgshow);
            let hasSuit1: boolean = clientCore.SuitsInfo.checkHaveSuits(this.suit1);
            let hasSuit2: boolean = clientCore.SuitsInfo.checkHaveSuits(this.suit2);
            this.btnBuyAll.visible = this.boxPriceAll.visible = !hasSuit1 && !hasSuit2;
            this.btnGet.visible = hasSuit1 && hasSuit2 && !has;
        }

        private updateCloth(index: number): void {
            let has: boolean = clientCore.SuitsInfo.checkHaveSuits(this[`suit${index}`]);
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
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.bgshow, condition: '墨染风华背景秀' });
                    break;
                default:
                    break;
            }
        }

        /** 奖励领取*/
        private onGet(): void {
            this.btnGet.visible = false;
            net.sendAndWait(new pb.cs_season_appoint_panel_get_cloth({module: 1,term: 1})).then((msg: pb.sc_season_appoint_panel_get_cloth)=>{
                alert.showReward(msg.items);
            }).catch(()=>{
                this.btnGet.visible = true;
            });
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
                        net.sendAndWait(new pb.cs_common_exchange({ activityId: 141, exchangeId: target })).then((msg: pb.sc_common_exchange) => {
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