namespace springOverture {
    /**
     * 绝版复出--套装
     */
    export class RebackSuitPanel extends ui.springOverture.panel.RebackSuitPanelUI {
        private suitIds: xls.triple[];
        private ruleId: number = 1195;

        private coinId: number = 9900284;
        private offId: number = 9900285;
        constructor() {
            super();
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.suitRender);
            this.addEventListeners();
        }

        private async refreshUI() {
            this.suitIds = this.getSuits();
            await SpringOvertureModel.instance.getSuitLeftCnt();
            this.list.array = this.suitIds;
            this.list.selectedIndex = -1;
        }

        private getSuits() {
            let arr = _.cloneDeep(xls.get(xls.largeRechargeActivityFront).get(SpringOvertureModel.instance.activityId).comeBackBuying);
            let temp: xls.triple;
            let tag = true;
            for (let j = 0; tag === true; j++) {
                tag = false;
                for (let i = 0; i < arr.length - 1; i++) {
                    if (clientCore.ItemsInfo.getItemNum(arr[i].v1) > clientCore.ItemsInfo.getItemNum(arr[i + 1].v1)) {
                        temp = arr[i];
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            arr.unshift({ v1: 0, v2: 0, v3: 0 });
            arr.push({ v1: 0, v2: 0, v3: 0 });
            return arr;
        }

        private suitRender(item: ui.springOverture.render.RebackSuitUI) {
            if (item.dataSource.v1 == 0) {
                item.visible = false;
                return;
            }
            if (!this.suitIds) return;
            let data: xls.triple = item.dataSource;
            item.scaleX = item.scaleY = 1 - 0.4 * Math.abs(item.x - 345 - this.list.scrollBar.value) / 345;
            item.imgSuit.skin = pathConfig.getSuitImg(data.v1, clientCore.LocalInfo.sex);
            item.btnBuy.disabled = item.imgGot.visible = clientCore.SuitsInfo.getSuitInfo(data.v1).hasCnt > 0;
            item.labName.text = clientCore.SuitsInfo.getSuitInfo(data.v1).suitInfo.name;
            item.labIndex.text = (this.suitIds.indexOf(data)) + "/" + (this.suitIds.length - 2);
            item.labCnt.text = SpringOvertureModel.instance.leftCntMap.get(data.v1).toString();
            item.boxPrice.visible = data.v3 == 1;
            item.boxVipPrice.visible = data.v3 == 2;
            item.boxOffPrice.visible = data.v3 == 3;
            if (data.v3 == 1) {
                item.labPrice.text = "售价：" + xls.get(xls.eventExchange).get(data.v2).cost[0].v2;
            } else if (data.v3 == 2) {
                item.labPrice0.text = "原价：" + xls.get(xls.eventExchange).get(data.v2).cost[0].v2;
                item.labPrice1.text = "奇妙价：" + xls.get(xls.eventExchange).get(data.v2 + 1).cost[0].v2;
                item.labPrice3.text = "闪耀价：" + xls.get(xls.eventExchange).get(data.v2 + 2).cost[0].v2;
            } else {
                item.labOldPrice.text = "原价：" + xls.get(xls.eventExchange).get(data.v2).cost[0].v2;
                item.labOffPrice.text = "折扣价：" + xls.get(xls.eventExchange).get(data.v2 + 1).cost[0].v2;
                item.labOffCost.text = "折扣券：" + xls.get(xls.eventExchange).get(data.v2 + 1).cost[1].v2;
            }
            BC.addEvent(this, item.btnBuy, Laya.Event.CLICK, this, this.buyGoods, [data]);
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年2月25日活动', '【付费】春日序曲', '打开绝版复出面板');
            clientCore.UIManager.setMoneyIds([this.coinId, this.offId]);
            clientCore.UIManager.showCoinBox();
            EventManager.event(CHANGE_TIME, "");
            this.refreshUI();
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private buyGoods(data: xls.triple) {
            let configId;
            if (data.v3 == 1) {
                configId = data.v2;
            } else if (data.v3 == 2) {
                if (clientCore.FlowerPetInfo.petType == 3) {
                    configId = data.v2 + 2;
                } else if (clientCore.FlowerPetInfo.petType > 0) {
                    configId = data.v2 + 1;
                }
            } else {
                let offItem = xls.get(xls.eventExchange).get(data.v2 + 1).cost[1].v1;
                if (clientCore.ItemsInfo.getItemNum(offItem) > 0) {
                    configId = data.v2 + 1;
                } else {
                    configId = data.v2;
                }
            }
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { SpringOvertureModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 1, activityId: SpringOvertureModel.instance.activityId, idxs: [configId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            SpringOvertureModel.instance.coinCost(price);
                            this.list.refresh();
                        })
                    }]
                }
            })
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            this.btnLast.visible = scroll.value / scroll.max > 0.1;
            this.btnNext.visible = scroll.value / scroll.max < 0.9;
            this.list.selectedIndex++;
        }

        private btnScroll(flag: number) {
            let target = this.list.startIndex += flag;
            if (target < 0 || target >= this.list.array.length) return;
            this.list.scrollTo(target);
        }

        private openOther(i: number) {
            EventManager.event(CHANGE_PANEL, subpanel.rebackFaery1);
        }

        addEventListeners() {
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            // BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            //BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
            // BC.addEvent(this, this.btn0, Laya.Event.CLICK, this, this.openOther, [1]);
            // BC.addEvent(this, this.btn1, Laya.Event.CLICK, this, this.openOther, [2]);
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.btnScroll, [-1]);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.btnScroll, [1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.suitIds = null;
            this.removeEventListeners();
            super.destroy();
        }
    }
}