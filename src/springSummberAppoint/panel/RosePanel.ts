namespace springSummberAppoint {
    const DISCOUNT_PRICE = [
        520,
        260,
        364,
        468,
        52
    ];

    const SUIT_ID = 2110353;
    const BG_SHOW_ID = 1000104;

    /**
     * 玫瑰玩偶
     */
    export class RosePanel extends ui.springSummberAppoint.panel.RosePanelUI implements IPanel {
        private _currPrice: number;
        private _refreshTimes: number;
        private _rotating: boolean = false;

        ruleId: number;

        show(sign:number,parent: Laya.Sprite): void{
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
        }
        hide(): void{
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void{
            this.removeEventListeners();
        }

        onAwake(): void{
            this.pos(227,-32);
            this.addEventListeners();
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(net.sendAndWait(new pb.cs_lucky_lover_info).then((data: pb.sc_star_sakura) => {
                this._currPrice = data.num;
                this._refreshTimes = data.times;
                this.updateView();
            }));
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
            net.sendAndWait(new pb.cs_buy_lucky_lover_clothes()).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                this.updateView();
            }).catch(()=>{
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private getStage(): void{
            if(clientCore.ItemsInfo.checkHaveItem(BG_SHOW_ID))return;
            net.sendAndWait(new pb.cs_season_appoint_panel_get_cloth({module: 3,term: 2})).then((data:pb.sc_season_appoint_panel_get_cloth)=>{
                alert.showReward(data.items);
                this.updateStageBtn();
            });
        }

        private updateStageBtn(): void{
            this.btnStage.visible = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet && !clientCore.ItemsInfo.checkHaveItem(BG_SHOW_ID);
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
        }

        private onBg() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: BG_SHOW_ID });
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
            net.sendAndWait(new pb.cs_refresh_lucky_lover_discount()).then((data: pb.sc_refresh_star_sakura) => {
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

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnBg, Laya.Event.CLICK, this, this.onBg);
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnStage, Laya.Event.CLICK, this, this.getStage);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}