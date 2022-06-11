namespace flowerSpring {
    enum TAB {
        MAIN,
        EXCHANGE,
    }
    /**
     * 花田春意主活动
     * flowerSpring.FlowerSpringModule
     */
    export class FlowerSpringModule extends ui.flowerSpring.FlowerSpringModuleUI {
        private _exchangePanel: FlowerExchangePanel;
        private _buyTimesArr: number[];
        private _buyHandler: Laya.Handler;
        private _bossTime: number;
        private _isFirstOpen: boolean;

        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.commonAward));
            this.showView(TAB.MAIN);
            this.addPreLoad(net.sendAndWait(new pb.cs_hua_tian_market_1st_get_info).then((data: pb.sc_hua_tian_market_1st_get_info) => {
                this._buyTimesArr = [];
                this._buyTimesArr[0] = data.exchangeATimes;
                this._buyTimesArr[1] = data.exchangeBTimes;
                this._bossTime = data.bossTimes;
            }))
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.FLOWER_SPRING_FIRST_OPEN]).then((data: pb.ICommonData[]) => {
                this._isFirstOpen = data[0].value == 0;
            }));
            this.imgSuit.skin = clientCore.LocalInfo.sex == 1 ? 'flowerSpring/女.png' : 'flowerSpring/男.png';
            this.list.hScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this._buyHandler = new Laya.Handler(this, this.showBuyPanel);
            clientCore.UIManager.setMoneyIds([9900023, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.sortList();
            this.updateBossTime();
            this.updateRed();
            if (this._isFirstOpen) {
                clientCore.AnimateMovieManager.showAnimateMovie('80030', this, () => {
                    clientCore.MedalManager.setMedal([{ id: MedalConst.FLOWER_SPRING_FIRST_OPEN, value: 1 }]);
                });
            }
            clientCore.Logger.sendLog('2020年4月23日活动', '【主活动】', '打开活动面板');
        }

        popupOver() {
            if (this._data) {
                this.goBoss();
            }
        }

        private sortList() {
            this.list.dataSource = _.sortBy(_.filter(xls.get(xls.commonAward).getValues(), o => o.type == 15), (o) => {
                let clothId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                return clientCore.LocalInfo.checkHaveCloth(clothId);
            });
            this.list.scrollTo(0);
        }

        private onDetail() {
            clientCore.Logger.sendLog('2020年4月3日活动', '【主活动】复活节的彩蛋', '点击活动说明按钮');
            alert.showRuleByID(1001);
            // let ruleArr = [
            //     '活动时间：{4月23日开服~4月29日23:59}',
            //     '收获桃花、交付订单、挑战活动BOSS、春之补给站可获得{“春之气息”}',
            //     '达到要求的{“春之气息”}数量，即可兑换相应的部件，不需要进行消耗',
            // ];
            // alert.showRulePanel(
            //     _.map(ruleArr, s => util.StringUtils.getColorText3(s, '#66472c', '#f25c58')),
            //     _.map(ruleArr, s => s.replace(/{/g, '').replace(/}/g, ''))
            // );
        }

        private updateRed() {
            let arr = _.filter(xls.get(xls.commonAward).getValues(), o => o.type == 15);
            let needRed = false;
            for (const data of arr) {
                let clothId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let have = clientCore.LocalInfo.checkHaveCloth(clothId);
                if (!have && clientCore.ItemsInfo.getItemLackNum({ itemID: data.num.v1, itemNum: data.num.v2 }) <= 0) {
                    needRed = true;
                    break;
                }
            }
            this.imgRed.visible = needRed;
        }

        private onRecall() {
            clientCore.Logger.sendLog('2020年4月23日活动', '【主活动】', '点击剧情回顾');
            clientCore.AnimateMovieManager.showAnimateMovie('80030', null, null);
        }

        private updateBossTime() {
            let config = xls.get(xls.globaltest).get(1).challengeTime;
            let isVip = clientCore.FlowerPetInfo.petType > 0;
            // let totalTime = isVip ? (config.v1 + config.v2) : config.v1;
            // this.txtTimes.text = `剩余挑战次数:${totalTime - this._bossTime}/${config.v1 + (isVip ? config.v2 : 0)}${isVip ? `(+${config.v2})` : '(+0)'}`
        }

        private onTry() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2100173);
        }

        private onListRender(cell: ui.flowerSpring.render.FlowerSpringExchangeRenderUI, idx: number) {
            let data = cell.dataSource as xls.commonAward;
            let clothId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(clothId);
            cell.txtNum.value = data.num.v2.toString();
            let have = clientCore.LocalInfo.checkHaveCloth(clothId);
            cell.btnGet.visible = !have;
            cell.imgGet.visible = have;
            cell.btnGet.disabled = clientCore.ItemsInfo.getItemLackNum({ itemID: data.num.v1, itemNum: data.num.v2 }) > 0;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = e.currentTarget['dataSource'] as xls.commonAward;
                if (e.target.name == 'imgIcon') {
                    let clothId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                    clientCore.ToolTip.showTips(e.target, { id: clothId });
                }
                else if (e.target.name == 'btnGet') {
                    net.sendAndWait(new pb.cs_hua_tian_market_1st_get_award({ awardIdx: data.id })).then((data: pb.sc_hua_tian_market_1st_get_award) => {
                        this.sortList();
                        alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                        this.updateRed();
                    })
                }
            }
        }

        private onGo(id: number) {
            switch (id) {
                case 0:
                    clientCore.ToolTip.gotoMod(15);
                    break;
                case 1:
                    clientCore.ToolTip.gotoMod(13);
                    break;
                case 2:
                    this._exchangePanel = this._exchangePanel || new FlowerExchangePanel();
                    this._exchangePanel.show(this._buyTimesArr, this._buyHandler, true)
                    break;
                default:
                    break;
            }
        }

        private showView(tab: TAB) {
            this.boxMain.visible = TAB.MAIN == tab;
            this.boxExchange.visible = TAB.EXCHANGE == tab;
            this.btnClose.visible = TAB.EXCHANGE == tab;
        }

        private _bossPanel: FlowerBossPanel;
        private async goBoss() {
            this._bossPanel = this._bossPanel || new FlowerBossPanel();
            this._bossPanel.sweepHanlder = new Laya.Handler(this, this.onSweep);
            this._bossPanel.show(this._bossTime, true);
        }

        private onSweep() {
            net.sendAndWait(new pb.cs_hua_tian_market_auto_atk_boss()).then((data: pb.sc_hua_tian_market_auto_atk_boss) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                this._bossTime += 1;
                this.updateBossTime();
                this._bossPanel?.show(this._bossTime, false);
            })
        }

        private onAdd() {

        }

        private onShop() {
            this.showView(TAB.EXCHANGE);
        }

        private _idx: number;
        private _buyId: number;
        private showBuyPanel(buyId: number, idx: number) {
            this._idx = idx;
            this._buyId = buyId;
            let nextBuyInfo = xls.get(xls.commonBuy).get(buyId);
            let coinId = nextBuyInfo.itemCost.v1;
            let needNum = nextBuyInfo.itemCost.v2;
            let buyItemId = nextBuyInfo.maleAward[0].v1;
            let buyItemNum = nextBuyInfo.maleAward[0].v2
            alert.showBuyTimesPanel({
                buyId: buyItemId,
                buyNum: buyItemNum,
                coinId: coinId,
                coinNum: needNum,
                maxTime: 4,
                nowTime: this._buyTimesArr[idx],
                sureHanlder: new Laya.Handler(this, this.sureBuy)
            });
        }

        private sureBuy() {
            let nextBuyInfo = xls.get(xls.commonBuy).get(this._buyId);
            if (this._buyTimesArr[this._idx] >= 4) {
                alert.showFWords('购买超出限制');
                return;
            }
            if (nextBuyInfo.itemCost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID)
                alert.useLeaf(nextBuyInfo.itemCost.v2, new Laya.Handler(this, this.reqExchange));
            else if (nextBuyInfo.itemCost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                if (clientCore.ItemsInfo.getItemLackNum({ itemID: clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, itemNum: nextBuyInfo.itemCost.v2 }) > 0)
                    alert.showSmall('灵豆不足，是否需要补充?', { callBack: { caller: this, funArr: [this.gotoMoneyShop] } });
                else
                    this.reqExchange();
            }
            else {
                if (clientCore.ItemsInfo.getItemLackNum({ itemID: nextBuyInfo.itemCost.v1, itemNum: nextBuyInfo.itemCost.v2 }) > 0) {
                    alert.showSmall(`${clientCore.ItemsInfo.getItemName(nextBuyInfo.itemCost.v1)}不足，是否需要补充?`, {
                        callBack: {
                            caller: this, funArr: [this.gotoProduce]
                        }
                    });
                }
                else {
                    this.reqExchange();
                }
            }
        }

        private gotoMoneyShop() {
            clientCore.ToolTip.gotoMod(50);
        }

        private gotoProduce() {
            clientCore.ToolTip.gotoMod(15);
        }

        private reqExchange() {
            net.sendAndWait(new pb.cs_hua_tian_market_1st_get_exchange({ exchangeId: this._buyId })).then((data: pb.sc_hua_tian_market_1st_get_exchange) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                this._buyTimesArr[this._idx]++;
                this._exchangePanel.show(this._buyTimesArr, this._buyHandler);
                this.sortList();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.showView, [TAB.MAIN]);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnRecall, Laya.Event.CLICK, this, this.onRecall);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnChanllage, Laya.Event.CLICK, this, this.goBoss);
            BC.addEvent(this, this.imgAdd, Laya.Event.CLICK, this, this.onAdd);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.onShop);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['imgGo_' + i], Laya.Event.CLICK, this, this.onGo, [i]);
            }
        }

        removeEventListeners() {
            clientCore.UIManager.releaseCoinBox();
            BC.removeEvent(this);
        }
    }
}