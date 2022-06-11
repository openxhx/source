namespace oceanicSong {
    const DISCOUNT_PRICE = [
        450,
        225,
        315,
        405,
        45
    ];

    const SUIT_ID = 2110402;

    /**
     * 归墟之恋   
     */
    export class LovePanel extends ui.oceanicSong.panel.LovePanelUI implements IPanel{
        private _currPrice: number;
        private _refreshTimes: number;
        private _rotating: boolean = false;

        ruleId: number = 1185;
        show(parent: Laya.Sprite): void{
            EventManager.event(EventType.UPDATE_TIME, '活动时间:6月18日~7月1日');
            clientCore.Logger.sendLog('2021年6月18日活动', '【付费】海洋之歌第二期', '打开归墟之恋面板');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            net.sendAndWait(new pb.cs_star_sakura).then((data: pb.sc_star_sakura) => {
                this._currPrice = data.num;
                this._refreshTimes = data.times;
                this.updateView();
                parent.addChild(this);
            })
        }
        hide(): void{
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void{
            this.removeEventListeners();
        }

        onAwake(): void{
            this.init();
        }

        init() {
            this.pos(150, 60);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgCloth.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.LocalInfo.sex == 1 ? 138408 : 138421);
            this.addEventListeners();
        }

        private updateView() {
            this.txtPrice.text = DISCOUNT_PRICE[0].toString();
            this.txtOriPrice.text = this._currPrice.toString();
            let discountIdx = DISCOUNT_PRICE.indexOf(this._currPrice);
            for (let i = 0; i < 5; i++) {
                this['img_' + i].visible = i == discountIdx;
            }
            this._refreshTimes == 0;
            this.imgFree.visible = this._refreshTimes == 0;
            this.boxTurnCost.visible = this.boxBuy.visible = this._refreshTimes > 0;
            this.imgGet.visible = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet;
            if (clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet) {
                this.btnTurn.disabled = true;
                this.boxBuy.visible = false;
            }
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
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID)
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
                    alert.showSmall('返回的价格错误!!');
                    return;
                }
                let cur = DISCOUNT_PRICE.indexOf(this._currPrice);
                this._currPrice = data.num;
                this._refreshTimes += 1;
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
                this['img_' + start].visible = false;
                start++;
                start = start % 5;
                this['img_' + start].visible = true;
                if (time == 800 && start == target) {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.updateView();
                    return;
                }
            }
        }

        private goMoney() {
            clientCore.ToolTip.gotoMod(50);
        }

        private onDetail() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [1100085, 1000117], condition: '归墟之恋背景秀+舞台'});
        }

        private onTips(): void{
            clientCore.ToolTip.showTips(this.imgTips,{id: clientCore.LocalInfo.sex == 1 ? 138408 : 138421});
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnBgShow, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.imgTips, Laya.Event.CLICK, this, this.onTips);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}