namespace equinoxFlower {
    const DISCOUNT_PRICE = [
        520,
        260,
        364,
        468,
        52
    ];

    const SUIT_ID = 2100295;
    const STAGE_ID = 1100064;

    /**
     * 彼岸花
     * equinoxFlower.EquinoxFlowerModule
     */
    export class EquinoxFlowerModule extends ui.equinoxFlower.EquinoxFlowerModuleUI {
        private _currPrice: number;
        private _refreshTimes: number;
        private _rotating: boolean = false;
        
        init(d: any) {
            this.addPreLoad(net.sendAndWait(new pb.cs_star_sakura).then((data: pb.sc_star_sakura) => {
                this._currPrice = data.num;
                this._refreshTimes = data.times;
            }));
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.updateView();
            clientCore.Logger.sendLog('2021年4月2日活动','【付费】彼岸花','打开活动面板');
        }

        private updateView() {
            this.txtPrice.value = DISCOUNT_PRICE[0].toString();
            this.txtOriPrice.text = '：'+this._currPrice;
            let discountIdx = DISCOUNT_PRICE.indexOf(this._currPrice);
            for (let i = 0; i < 5; i++) {
                this['img_' + i].visible = i == discountIdx;
            }
            this.boxTurnPrice.visible = this._refreshTimes != 0;
            this.txtFree.visible = this._refreshTimes == 0;
            this.btnTurn.rotation = 72 * DISCOUNT_PRICE.indexOf(this._currPrice);
            this.boxBuy.visible = this._refreshTimes > 0;
            this.imgGet.visible = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet;
            if (clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet) {
                this.btnTurn.disabled = true;
                this.boxBuy.visible = false;
            }
            this.updateStageBtn();
        }

        private onBuy() {
            if (this._rotating)
                return;
            if (clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet) {
                return;
            }
            let beanNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (beanNum < this._currPrice) {
                alert.showSmall('灵豆不足，是否补充', { callBack: { caller: this, funArr: [this.goMoney] } })
            }
            else {
                alert.showSmall(`确定要花费${this._currPrice}个灵豆来购买吗？`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes()).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                this.updateView();
            }).catch(()=>{
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private getStage(): void{
            if(clientCore.ItemsInfo.checkHaveItem(STAGE_ID))return;
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes()).then((data:pb.sc_star_sakura_buy_clothes)=>{
                alert.showReward(data.items);
                this.updateStageBtn();
            });
        }

        private updateStageBtn(): void{
            this.btnStage.visible = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet && !clientCore.ItemsInfo.checkHaveItem(STAGE_ID);
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
        }

        private onBg() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: STAGE_ID });
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (this._refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let beanNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
                if (beanNum < 10) {
                    alert.showSmall('灵豆不足，是否补充', { callBack: { caller: this, funArr: [this.goMoney] } })
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
                    alert.showSmall('返回的价格错误!!')
                }
                let angle = toId * 72 + _.random(5, 8, false) * 360;
                this._currPrice = data.num;
                this._refreshTimes += 1;
                this.boxTurn.visible = false;
                Laya.Tween.to(this.btnTurn, { rotation: angle }, angle / 360 * 300, Laya.Ease.cubicInOut, new Laya.Handler(this, () => {
                    this._rotating = false;
                    this.boxTurn.visible = true;
                    this.updateView();
                }));
            })
        }

        private goMoney() {
            clientCore.ToolTip.gotoMod(50);
        }

        private onDetail() {
            alert.showRuleByID(1048)
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnBg, Laya.Event.CLICK, this, this.onBg);
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnStage, Laya.Event.CLICK, this, this.getStage);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}