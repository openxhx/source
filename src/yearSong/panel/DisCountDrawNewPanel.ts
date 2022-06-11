namespace yearSong {
    const DISCOUNT_PRICE = [
        550,
        275,
        385,
        495,
        55
    ];

    const DISCOUNT_STRING = [
        'yuan_jie',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];
    /**
     * 白幽灵
     */
    export class DisCountDrawNewPanel extends ui.yearSong.panel.DisCountDrawNewPanelUI {

        private _rotating: boolean = false;
        private _suitId: number = 2110470;
        private _giftId: number = 1000160;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            //this.giftIcon.skin = clientCore.LocalInfo.sex == 1 ? `yearSong/DisCountDrawPanel/gift_nv.png`:`yearSong/DisCountDrawPanel/gift_nan.png`;
            this.icon0.skin = this.icon1.skin = clientCore.ItemsInfo.getItemIconUrl(YearSongModel.instance.coinid);
            this.addEventListeners();
        }

        async show() {
            clientCore.UIManager.setMoneyIds([YearSongModel.instance.coinid, 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年11月19日活动', '【付费】岁月如歌', '打开珠落玉盘-恋爱契约面板');
            await net.sendAndWait(new pb.cs_star_sakura({ activeId: 197, stage: 4 })).then((data: pb.sc_star_sakura) => {
                YearSongModel.instance.currPrice = data.num;
                YearSongModel.instance.refreshTimes = data.times;
            })
            this.updateView();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updateView() {
            this.labCost.text = YearSongModel.instance.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(YearSongModel.instance.currPrice);
            for (let i = 0; i < 5; i++) {
                this['zhe_' + i].skin = i == discountIdx ? `yearSong/DisCountDrawPanel/${DISCOUNT_STRING[i]}1.png` : `yearSong/DisCountDrawPanel/${DISCOUNT_STRING[i]}0.png`;
            }
            this.arrowIcon.rotation = 72 * discountIdx;
            this.imgFirst.visible = YearSongModel.instance.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = YearSongModel.instance.refreshTimes > 0;
            this.btnTurn.disabled = this.imgGot.visible = clientCore.SuitsInfo.getSuitInfo(this._suitId).allGet;
            this.boxBuy.visible = !this.imgGot.visible;
        }

        private onBuy() {
            if (this._rotating)
                return;
            if (this.imgGot.visible) {
                this.boxBuy.visible = false;
                return;
            }
            let coin = YearSongModel.instance.coinid;
            let beanNum = clientCore.ItemsInfo.getItemNum(coin);
            if (beanNum < YearSongModel.instance.currPrice) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [YearSongModel.instance.coinNotEnough], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${YearSongModel.instance.currPrice}${clientCore.ItemsInfo.getItemName(coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes({ activeId: 197, stage: 4 })).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                YearSongModel.instance.coinCost(YearSongModel.instance.currPrice);
                this.updateView();
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit(i: number) {
            if (i == 1) {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._suitId)
            } else {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._giftId], condition: '', limit: '' });
            }
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (YearSongModel.instance.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let coin = YearSongModel.instance.coinid;
                let beanNum = clientCore.ItemsInfo.getItemNum(coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [YearSongModel.instance.coinNotEnough], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura({ activeId: 197, stage: 4 })).then((data: pb.sc_refresh_star_sakura) => {
                let toId = DISCOUNT_PRICE.indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(YearSongModel.instance.currPrice);
                YearSongModel.instance.currPrice = data.num;
                if (YearSongModel.instance.refreshTimes > 0) YearSongModel.instance.coinCost(10);
                YearSongModel.instance.refreshTimes += 1;
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
                this['zhe_' + start].skin = `yearSong/DisCountDrawPanel/${DISCOUNT_STRING[start]}0.png`;
                start++;
                start = start % 5;
                this['zhe_' + start].skin = `yearSong/DisCountDrawPanel/${DISCOUNT_STRING[start]}1.png`;
                this.arrowIcon.rotation = 72 * start;
                if (time == 400 && start == target) {
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

        /**打开复出直购 */
        private openOther() {
            EventManager.event('YearSong_SHOW_EVENT_PANEL', panelType.disCountDraw);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuit, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onSuit, [2]);
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