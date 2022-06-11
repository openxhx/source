namespace springOverture {
    const DISCOUNT_PRICE = [
        490,
        245,
        343,
        441,
        49
    ];

    const DISCOUNT_STRING = [
        'yuan_jie',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];
    /**
     * 碧玉妆成-彼岸浮灯
     */
    export class DisCountDrawPanel extends ui.springOverture.panel.DisCountDrawPanelUI {

        private _rotating: boolean = false;
        private _suitId: number = 2110299;
        private _giftId: number = 3500118;
        private currPrice: number = 0;
        private refreshTimes: number = 0;
        private coin: number = 9900284;

        constructor() {
            super();
            this.imgSuit.skin = `unpack/springOverture/${this._suitId}_${clientCore.LocalInfo.sex}.png`;
            this.addEventListeners();
        }

        async show(box: any) {
            clientCore.UIManager.setMoneyIds([this.coin]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2022年3月18日活动', '【付费】春日序曲', '打开碧玉妆成-缤纷童年面板');
            await net.sendAndWait(new pb.cs_star_sakura({ activeId: SpringOvertureModel.instance.activityId, stage: 10 })).then((data: pb.sc_star_sakura) => {
                this.currPrice = data.num;
                this.refreshTimes = data.times;
            })
            this.updateView();
            EventManager.event(CHANGE_TIME, "time_18_31");
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updateView() {
            this.labCost.text = this.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(this.currPrice);
            for (let i = 0; i < 5; i++) {
                this['zhe_' + i].skin = i == discountIdx ? `springOverture/DisCountDrawPanel/${DISCOUNT_STRING[i]}1.png` : `springOverture/DisCountDrawPanel/${DISCOUNT_STRING[i]}0.png`;
                this['di' + i].skin = i == discountIdx ? `springOverture/DisCountDrawPanel/di1.png` : `springOverture/DisCountDrawPanel/di0.png`;
            }
            this.imgFirst.visible = this.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = this.refreshTimes > 0;
            this.btnTurn.disabled = this.btnTurn1.disabled = this.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(this._giftId);
            this.boxBuy.visible = !this.imgGot.visible;
        }

        private onBuy() {
            if (this._rotating)
                return;
            if (this.imgGot.visible) {
                this.boxBuy.visible = false;
                return;
            }
            let beanNum = clientCore.ItemsInfo.getItemNum(this.coin);
            if (beanNum < this.currPrice) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { SpringOvertureModel.instance.openCoinGiftBuy() }], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${this.currPrice}${clientCore.ItemsInfo.getItemName(this.coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes({ activeId: SpringOvertureModel.instance.activityId, stage: 10 })).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                SpringOvertureModel.instance.coinCost(this.currPrice);
                this.updateView();
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit(i: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._suitId);
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (this.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let beanNum = clientCore.ItemsInfo.getItemNum(this.coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { SpringOvertureModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(this.coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura({ activeId: SpringOvertureModel.instance.activityId, stage: 10 })).then((data: pb.sc_refresh_star_sakura) => {
                let toId = DISCOUNT_PRICE.indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(this.currPrice);
                this.currPrice = data.num;
                if (this.refreshTimes > 0) SpringOvertureModel.instance.coinCost(10);
                this.refreshTimes += 1;
                this.btnTurn.disabled = true;
                this.btnTurn1.disabled = true;
                //this.showTurnAni(cur, toId, 10);
                this.btnTurn.rotation = this.btnTurn.rotation % 360;
                let angle = toId * 72 + _.random(5, 8, false) * 360;
                Laya.Tween.to(this.btnTurn, { rotation: angle }, angle / 360 * 300, Laya.Ease.cubicInOut, new Laya.Handler(this, () => {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.btnTurn1.disabled = false;
                    this.updateView();
                }));
            })
        }

        private async showTurnAni(start: number, target: number, time: number) {
            while (true) {
                await util.TimeUtil.awaitTime(time);
                if (time >= 300 && (Math.abs(target - start) <= 3 || target + 5 - start <= 3)) {
                    time = 400;
                } else {
                    time += 10;
                }
                this['zhe_' + start].skin = `springOverture/DisCountDrawPanel/${DISCOUNT_STRING[start]}0.png`;
                this['di' + start].skin = `springOverture/DisCountDrawPanel/di0.png`;
                start++;
                start = start % 5;
                this['zhe_' + start].skin = `springOverture/DisCountDrawPanel/${DISCOUNT_STRING[start]}1.png`;
                this['di' + start].skin = `springOverture/DisCountDrawPanel/di1.png`;
                if (time == 400 && start == target) {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.btnTurn1.disabled = false;
                    this.updateView();
                    return;
                }
            }
        }

        private onDetail() {
            alert.showRuleByID(1185);
        }

        private openOther() {
            // EventManager.event(CHANGE_PANEL, subpanel.disCountDraw1);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnTurn1, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}