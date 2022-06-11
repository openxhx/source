namespace halloweenShop {
    const DISCOUNT_PRICE = [
        420,
        210,
        294,
        378,
        42
    ];

    const DISCOUNT_STRING = [
        'yuan_jie',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];

    const SUIT_ID = 2110499;
    /**
     * 白幽灵
     */
    export class DisCountDrawNewPanel extends ui.halloweenShop.panel.DisCountDrawNewPanelUI {

        private _rotating: boolean = false;
        private giftId1:number = 1000103;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.icon0.skin = this.icon1.skin =  clientCore.ItemsInfo.getItemIconUrl(HalloweenShopModel.instance.coinid);
            this.addEventListeners();
        }

        async show() {
            clientCore.UIManager.setMoneyIds([HalloweenShopModel.instance.coinid , 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年11月5日活动', '【付费】搞怪糖果商城', '打开南瓜约定面板');
            await net.sendAndWait(new pb.cs_star_sakura({ activeId: 202  , stage :2})).then((data: pb.sc_star_sakura) => {
                HalloweenShopModel.instance.currPrice = data.num;
                HalloweenShopModel.instance.refreshTimes = data.times;
            })
            this.updateView();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updateView() {
            this.labCost.text = HalloweenShopModel.instance.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(HalloweenShopModel.instance.currPrice);
            for (let i = 0; i < 5; i++) {
                this['zhe_' + i].skin = i == discountIdx ? `halloweenShop/DisCountDrawNewPanel/${DISCOUNT_STRING[i]}1.png` : `halloweenShop/DisCountDrawNewPanel/${DISCOUNT_STRING[i]}0.png`;
            }
            this.arrowIcon.rotation = 72*discountIdx;
            this.imgFirst.visible = HalloweenShopModel.instance.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = HalloweenShopModel.instance.refreshTimes > 0;
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
            let coin = HalloweenShopModel.instance.coinid;
            let beanNum = clientCore.ItemsInfo.getItemNum(coin);
            if (beanNum < HalloweenShopModel.instance.currPrice) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [HalloweenShopModel.instance.coinNotEnough], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${HalloweenShopModel.instance.currPrice}${clientCore.ItemsInfo.getItemName(coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes({activeId:202 , stage :2})).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                HalloweenShopModel.instance.coinCost(HalloweenShopModel.instance.currPrice);
                this.updateView();
                // if(DISCOUNT_PRICE.indexOf(HalloweenShopModel.instance.currPrice) == 4){
                //     this.worldNotice();
                // }
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private worldNotice() {
            //跑马灯
            let str =  `${clientCore.LocalInfo.userInfo.nick}以【一折】价购买了虹潮汐套装，真是太幸运了！`;
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/101.png';
            info.width = 752;
            info.y = 23;
            info.value = str;
            info.sizeGrid = '0,189,0,378';
            alert.showWorlds(info);
        }

        private onSuit(i:number) {
            if(i==0){
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
            }else{
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', {id: [this.giftId1], condition: '', limit: ''});
            }
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (HalloweenShopModel.instance.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let coin = HalloweenShopModel.instance.coinid;
                let beanNum = clientCore.ItemsInfo.getItemNum(coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [HalloweenShopModel.instance.coinNotEnough], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura({activeId:202 , stage :2})).then((data: pb.sc_refresh_star_sakura) => {
                let toId = DISCOUNT_PRICE.indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(HalloweenShopModel.instance.currPrice);
                HalloweenShopModel.instance.currPrice = data.num;
                if(HalloweenShopModel.instance.refreshTimes > 0) HalloweenShopModel.instance.coinCost(10);
                HalloweenShopModel.instance.refreshTimes += 1;
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
                this['zhe_' + start].skin = `halloweenShop/DisCountDrawNewPanel/${DISCOUNT_STRING[start]}0.png`;
                start++;
                start = start % 5;
                this['zhe_' + start].skin = `halloweenShop/DisCountDrawNewPanel/${DISCOUNT_STRING[start]}1.png`;
                this.arrowIcon.rotation = 72*start;
                if (time == 400 && start == target) {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.updateView();
                    return;
                }
            }
        }

        private onDetail() {
            alert.showRuleByID(1048);
        }

        private changePanel(){
            EventManager.event('HalloweenShop_SHOW_EVENT_PANEL', panelType.disCountDraw);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuit , [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onSuit , [1]);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            //BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.changePanel);
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