namespace bigCharge {
    const DISCOUNT_PRICE = [
        450,
        225,
        315,
        405,
        45
    ];

    const DISCOUNT_STRING = [
        'yuan_jie',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];

    const SUIT_ID = 2100322;
    const GIFT_ID = 2500052;//4004646/4004658
    /**
     * 白幽灵
     */
    export class RollOffPanel extends ui.bigCharge.panel.RollOffPanelUI {

        private _rotating: boolean = false;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.addEventListeners();
        }

        show() {
            clientCore.UIManager.setMoneyIds([BigChargeModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年8月27日活动', '【付费】夏日终曲第九期', '打开幸运转盘面板');
            this.updateView();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updateView() {
            this.labCost.text = BigChargeModel.instance.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(BigChargeModel.instance.currPrice);
            for (let i = 0; i < 5; i++) {
                this['di_' + i].skin = i == discountIdx ? 'bigCharge/RollOffPanel/fen_di.png' : 'bigCharge/RollOffPanel/huang_di.png';
                this['zhe_' + i].skin = i == discountIdx ? `bigCharge/RollOffPanel/${DISCOUNT_STRING[i]}1.png` : `bigCharge/RollOffPanel/${DISCOUNT_STRING[i]}0.png`;
            }
            this.imgFirst.visible = BigChargeModel.instance.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = BigChargeModel.instance.refreshTimes > 0;
            this.btnTurn.disabled = this.imgGot.visible = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet;
            this.boxBuy.visible = !this.imgGot.visible;
        }

        private onBuy() {
            if (this._rotating)
                return;
            if (this.imgGot.visible) {
                this.boxBuy.visible = false;
                return;
            }
            let coin = BigChargeModel.instance.coinid;
            let beanNum = clientCore.ItemsInfo.getItemNum(coin);
            if (beanNum < BigChargeModel.instance.currPrice) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [BigChargeModel.instance.coinNotEnough], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${BigChargeModel.instance.currPrice}${clientCore.ItemsInfo.getItemName(coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes()).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                BigChargeModel.instance.coinCost(BigChargeModel.instance.currPrice);
                this.updateView();
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID)
        }

        private onBg() {
            // clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: BG_ID, condition: '购买{蝶魇}套装赠送' })
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (BigChargeModel.instance.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let coin = BigChargeModel.instance.coinid;
                let beanNum = clientCore.ItemsInfo.getItemNum(coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [BigChargeModel.instance.coinNotEnough], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura()).then((data: pb.sc_refresh_star_sakura) => {
                let toId = DISCOUNT_PRICE.indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(BigChargeModel.instance.currPrice);
                BigChargeModel.instance.currPrice = data.num;
                if(BigChargeModel.instance.refreshTimes > 0) BigChargeModel.instance.coinCost(10);
                BigChargeModel.instance.refreshTimes += 1;
                this.btnTurn.disabled = true;
                this.showTurnAni(cur, toId, 200);
                // Laya.Tween.to(this.btnTurn, { rotation: angle }, angle / 360 * 300, Laya.Ease.cubicInOut, new Laya.Handler(this, () => {
                //     this._rotating = false;
                //     this.btnTurn.disabled = false;
                //     this.updateView();
                // }));
            })
        }

        private async showTurnAni(start: number, target: number, time: number) {
            while (true) {
                await util.TimeUtil.awaitTime(time);
                if (time >= 600 && (Math.abs(target - start) <= 3 || target + 5 - start <= 3)) {
                    time = 800;
                } else {
                    time += 40;
                }
                this['di_' + start].skin = 'bigCharge/RollOffPanel/huang_di.png';
                this['zhe_' + start].skin = `bigCharge/RollOffPanel/${DISCOUNT_STRING[start]}0.png`;
                start++;
                start = start % 5;
                this['di_' + start].skin = 'bigCharge/RollOffPanel/fen_di.png';
                this['zhe_' + start].skin = `bigCharge/RollOffPanel/${DISCOUNT_STRING[start]}1.png`;
                if (time == 800 && start == target) {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.updateView();
                    return;
                }
            }
        }

        private onDetail() {
            alert.showRuleByID(1081);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
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