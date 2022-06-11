namespace snowSeason {
    const DISCOUNT_PRICE = [
        600,
        300,
        420,
        540,
        60
    ];

    const DISCOUNT_STRING = [
        'yuan_jie',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];
    /**
     * 银光耀眼
     */
    export class DisCountDrawNewPanel extends ui.snowSeason.panel.DisCountDrawNewPanelUI {

        private _rotating: boolean = false;
        private _suitId: number = 2110568;
        private _giftIdArr: number[] = [1000171, 1100117];
        constructor() {
            super();
            this.imgSuit.skin = `unpack/snowSeason/${this._suitId}_${clientCore.LocalInfo.sex}.png`;
            this.rewardIcon.skin = `snowSeason/DisCountDrawPanel/rewardNew${clientCore.LocalInfo.sex}.png`;
            this.giftIcon.skin = `snowSeason/DisCountDrawPanel/rewardNew_${clientCore.LocalInfo.sex}.png`;
            this.nameTxt.text = clientCore.LocalInfo.sex == 1? "无望之欲•生死挚爱":"无望之欲•书卷花香";
            this.addEventListeners();
        }

        async show() {
            clientCore.UIManager.setMoneyIds([SnowSeasonModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2022年1月7日活动', '【付费】初雪的季节', '打开银光耀眼-无望之欲面板');
            await net.sendAndWait(new pb.cs_star_sakura({ activeId: SnowSeasonModel.instance.activityId, stage: 2 })).then((data: pb.sc_star_sakura) => {
                SnowSeasonModel.instance.currPrice = data.num;
                SnowSeasonModel.instance.refreshTimes = data.times;
            })
            this.updateView();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updateView() {
            this.labCost.text = SnowSeasonModel.instance.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(SnowSeasonModel.instance.currPrice);
            for (let i = 0; i < 5; i++) {
                this['zhe_' + i].skin = i == discountIdx ? `snowSeason/DisCountDrawPanel/${DISCOUNT_STRING[i]}1.png` : `snowSeason/DisCountDrawPanel/${DISCOUNT_STRING[i]}0.png`;
                this['di' + i].skin = i == discountIdx ? `snowSeason/DisCountDrawPanel/di1.png` : `snowSeason/DisCountDrawPanel/di0.png`;
            }
            this.imgFirst.visible = SnowSeasonModel.instance.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = SnowSeasonModel.instance.refreshTimes > 0;
            this.btnTurn.disabled = this.imgGot.visible = clientCore.ItemsInfo.getItemNum(this._giftIdArr[clientCore.LocalInfo.sex - 1]) > 0;
            this.boxBuy.visible = !this.imgGot.visible;
        }

        private onBuy() {
            if (this._rotating)
                return;
            if (this.imgGot.visible) {
                this.boxBuy.visible = false;
                return;
            }
            let coin = SnowSeasonModel.instance.coinid;
            let beanNum = clientCore.ItemsInfo.getItemNum(coin);
            if (beanNum < SnowSeasonModel.instance.currPrice) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [SnowSeasonModel.instance.coinNotEnough], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${SnowSeasonModel.instance.currPrice}${clientCore.ItemsInfo.getItemName(coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes({ activeId: SnowSeasonModel.instance.activityId, stage: 2 })).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                this.updateView();
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit(i:number) {
            if(i == 0){
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._suitId);
            }else{
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', clientCore.LocalInfo.sex == 1?138885:138898);
            }
        }

        /**预览背景秀 */
        private onTryGift() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._giftIdArr, condition: '', limit: '' });
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (SnowSeasonModel.instance.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let coin = SnowSeasonModel.instance.coinid;
                let beanNum = clientCore.ItemsInfo.getItemNum(coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [SnowSeasonModel.instance.coinNotEnough], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura({ activeId: SnowSeasonModel.instance.activityId, stage: 2 })).then((data: pb.sc_refresh_star_sakura) => {
                let toId = DISCOUNT_PRICE.indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(SnowSeasonModel.instance.currPrice);
                SnowSeasonModel.instance.currPrice = data.num;
                if (SnowSeasonModel.instance.refreshTimes > 0) SnowSeasonModel.instance.coinCost(10);
                SnowSeasonModel.instance.refreshTimes += 1;
                this.btnTurn.disabled = true;
                this.showTurnAni(cur, toId, 10);
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
                if (time >= 300 && (Math.abs(target - start) <= 3 || target + 5 - start <= 3)) {
                    time = 400;
                } else {
                    time += 10;
                }
                this['zhe_' + start].skin = `snowSeason/DisCountDrawPanel/${DISCOUNT_STRING[start]}0.png`;
                this['di' + start].skin = `snowSeason/DisCountDrawPanel/di0.png`;
                start++;
                start = start % 5;
                this['zhe_' + start].skin = `snowSeason/DisCountDrawPanel/${DISCOUNT_STRING[start]}1.png`;
                this['di' + start].skin = `snowSeason/DisCountDrawPanel/di1.png`;
                if (time == 400 && start == target) {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.updateView();
                    return;
                }
            }
        }

        private onDetail() {
            if(clientCore.LocalInfo.sex == 1){
                alert.showRuleByID(1048);
            }else{
                alert.showRuleByID(1185);
            }
            
        }

        private openOther() {
            EventManager.event('SnowSeason_SHOW_EVENT_PANEL', panelType.disCountDraw);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onSuit , [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onSuit , [1]) ;
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryGift);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
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