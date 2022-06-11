namespace flowerMass {
    const DISCOUNT_PRICE = [
        480,
        240,
        336,
        432,
        48
    ];

    const DISCOUNT_STRING = [
        'yuan_jia',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];
    /**
     * 碧玉妆成-彼岸浮灯
     */
    export class DisCountDrawPanel1 extends ui.flowerMass.panel.DisCountDrawPanel1UI {

        private _rotating: boolean = false;
        private _suitId: number = 2100355;
        private _giftId: number[] = [1000183,1100128];
        private currPrice: number = 0;
        private refreshTimes: number = 0;
        private coin: number = 9900316;

        constructor() {
            super();
            this.imgSuit.skin = `unpack/flowerMass/${this._suitId}_${clientCore.LocalInfo.sex}.png`;
            this.addEventListeners();
            //this.btnOther.visible = false;
        }

        async show(box: any) {
            clientCore.UIManager.setMoneyIds([this.coin , 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2022年4月22日活动', '【付费】小花仙集合啦', '进入周年转盘-衔芳雅集面板');
            await net.sendAndWait(new pb.cs_star_sakura({ activeId: FlowerMassModel.instance.activityId, stage: 3 })).then((data: pb.sc_star_sakura) => {
                this.currPrice = data.num;
                this.refreshTimes = data.times;
            })
            this.updateView();
            EventManager.event(CHANGE_TIME, "time_22_5");
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updateView() {
            this.labCost.text = this.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(this.currPrice);
            this.imgFirst.visible = this.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = this.refreshTimes > 0;
            this.btnTurn.disabled = this.btnTurn1.disabled = this.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(this._giftId[0]);
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
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { FlowerMassModel.instance.openCoinGiftBuy() }], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${this.currPrice}${clientCore.ItemsInfo.getItemName(this.coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes({ activeId: FlowerMassModel.instance.activityId, stage: 3 })).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                FlowerMassModel.instance.coinCost(this.currPrice);
                this.updateView();
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit(i: number) {
            if (i == 0) {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._suitId);

            } else {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._giftId, condition: '' });
            }
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
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { FlowerMassModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(this.coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura({ activeId: FlowerMassModel.instance.activityId, stage: 3 })).then((data: pb.sc_refresh_star_sakura) => {
                let toId = DISCOUNT_PRICE.indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(this.currPrice);
                this.currPrice = data.num;
                if (this.refreshTimes > 0) FlowerMassModel.instance.coinCost(10);
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
            alert.showRuleByID(1221);
        }

        private openOther() {
            EventManager.event(CHANGE_PANEL, subpanel.discountDraw);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onSuit , [0]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onSuit , [1]);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnTurn1, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
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