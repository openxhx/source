namespace oneInk {
    const DISCOUNT_PRICE = [
        470,
        235,
        329,
        423,
        47
    ];

    const DISCOUNT_STRING = [
        'yuan_jie',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];

    const SUIT_ID = 2110501;
    const coinid = 9900003;
    /**
     * 白幽灵
     */
    export class OneInkModule extends ui.oneInk.OneInkModuleUI {

        private _rotating: boolean = false;
        private currPrice: number;
        /**转轮次数 */
        public refreshTimes: number;

        init() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            clientCore.Logger.sendLog('2021年9月24日活动', '【付费】把酒问月-转盘', '打开把酒问月-转盘面板');
        }

        async onPreloadOver() {
            await net.sendAndWait(new pb.cs_star_sakura).then((data: pb.sc_star_sakura) => {
                this.currPrice = data.num;
                this.refreshTimes = data.times;
                this.updateView();
            });
        }

        private updateView() {
            this.labCost.text = this.currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(this.currPrice);
            for (let i = 0; i < 5; i++) {
                this['di_' + i].skin = i == discountIdx ? 'oneInk/fen_di.png' : 'oneInk/huang_di.png';
                this['zhe_' + i].skin = i == discountIdx ? `oneInk/${DISCOUNT_STRING[i]}1.png` : `oneInk/${DISCOUNT_STRING[i]}0.png`;
            }
            this.imgFirst.visible = this.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = this.refreshTimes > 0;
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
            let coin = coinid;
            let beanNum = clientCore.ItemsInfo.getItemNum(coin);
            if (beanNum < this.currPrice) {
                alert.showSmall(`所需灵豆不足,是否前往补充?`, { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${this.currPrice}灵豆购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes()).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                this.updateView();
                if(DISCOUNT_PRICE.indexOf(this.currPrice) == 4){
                    this.worldNotice();
                }
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private worldNotice() {
            //跑马灯
            let str =  `${clientCore.LocalInfo.userInfo.nick}以【一折】价购买了一帘入墨套装，真是太幸运了！`;
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/101.png';
            info.width = 752;
            info.y = 23;
            info.value = str;
            info.sizeGrid = '0,189,0,378';
            alert.showWorlds(info);
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID)
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (this.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let coin = coinid;
                let beanNum = clientCore.ItemsInfo.getItemNum(coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需灵豆不足,是否前往补充?`, { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个灵豆来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
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
                let cur = DISCOUNT_PRICE.indexOf(this.currPrice);
                this.currPrice = data.num;
                this.refreshTimes += 1;
                this.btnTurn.disabled = true;
                this.showTurnAni(cur, toId, 200);
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
                this['di_' + start].skin = 'oneInk/huang_di.png';
                this['zhe_' + start].skin = `oneInk/${DISCOUNT_STRING[start]}0.png`;
                start++;
                start = start % 5;
                this['di_' + start].skin = 'oneInk/fen_di.png';
                this['zhe_' + start].skin = `oneInk/${DISCOUNT_STRING[start]}1.png`;
                if (time == 800 && start == target) {
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

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}