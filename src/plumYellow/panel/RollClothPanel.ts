namespace plumYellow {
    /**
     * 转盘抽衣服
     */
    export class RollClothPanel extends ui.plumYellow.panel.RollClothPanelUI {
        /** 抽奖功能ID*/
        private _poolId: number = 42;
        /** 抽奖使用的道具ID*/
        private _costItemId: number = 9900338;
        /**套装ID */
        private _suitId: number = 2110668;
        /**集齐奖励ID */
        private _giftId1: number[] = [1000196, 1100137];
        private _giftId2: number[] = [145748, 145750, 1200042];
        /**帮助说明id */
        private _ruleId: number = 1189;

        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _cost: xls.rouletteDrawCost[];

        /**当前折扣 */
        private curDiscount: number;
        /**抽奖次数 */
        private curTimes: number;

        constructor() {
            super();
            this._disposed = false;
            this.imgSuit.skin = `res/rechargeCloth/${this._suitId}_${clientCore.LocalInfo.sex}.png`;
            this.imgFaceReward.skin = clientCore.LocalInfo.sex == 1 ? "plumYellow/RollClothPanel/nv_mei_tong.png" : "plumYellow/RollClothPanel/nan_mei_tong.png";
            this.addEvents();
            //this.btnOther.visible = false;
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年6月2日活动', '【付费】梅子黄时', '打开以夏为期-破茧成蝶面板');
            this.setShowInfo(0);
            box.addChild(this);
            EventManager.event(CHANGE_TIME, "time_2_16");
            PlumYellowModel.instance.checkCoinRecyle(1);

        }

        private async setShowInfo(idx: number) {
            clientCore.LoadingManager.showSmall();
            await net.sendAndWait(new pb.cs_get_common_turntable_info({ id: this._poolId })).then((msg: pb.sc_get_common_turntable_info) => {
                this.curDiscount = msg.discount;
                this.curTimes = msg.cnt;
            });
            this.initView();
            clientCore.UIManager.setMoneyIds([this._costItemId, 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.LoadingManager.hideSmall(true);
        }

        /**
         * 初始化界面
         */
        private initView(): void {
            this.imgNext.visible = false;
            //格子初始化
            this._array = _.filter(xls.get(xls.rouletteDraw).getValues(), (element: xls.rouletteDraw) => { return element.type == PlumYellowModel.instance.activityId && element.period == this._poolId; });
            this._cost = _.filter(xls.get(xls.rouletteDrawCost).getValues(), (element: xls.rouletteDrawCost) => { return element.type == PlumYellowModel.instance.activityId && element.period == this._poolId });
            _.forEach(this._array, (element: xls.rouletteDraw, index: number) => {
                this.updateGrid(element, index);
                let item: Laya.Sprite = this.boxItem.getChildAt(index) as Laya.Sprite;
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                BC.addEvent(this, item, Laya.Event.CLICK, this, () => { clientCore.ToolTip.showTips(item, { id: reward.v1 }) });
            });
            //面板初始化
            this.updateView();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        destroy(): void {
            this.removeEvents();
            Laya.Tween.clearAll(this);
            if (this._array) this._array.length = 0;
            this._array = null;
            this._disposed = true;
            super.destroy();
        }

        private addEvents(): void {
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry, [2]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTry, [3]);
            BC.addEvent(this, this.btnRoll, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.boxFace, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.buyBtn, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.reward1, Laya.Event.CLICK, this, this.onGift);
            //BC.addEvent(this, this.reward2, Laya.Event.CLICK, this, this.onGift);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            //BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.changePanel);
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        private changePanel() {

        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this._ruleId);
        }

        private onTry(i: number): void {
            if (i == 0) {
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._suitId);
            } else if (i == 1) {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._giftId1, condition: '' });
            } else if (i == 2) {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', [this._giftId2[0] + clientCore.LocalInfo.sex - 1, this._giftId2[1] + clientCore.LocalInfo.sex - 1]);
            } else {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._giftId2[2], condition: '' });
            }
        }
        /**打开礼包购买面板 */
        private openBuy(): void {
            alert.showEventBuy([1, 2]);
        }

        /**界面更新 */
        private updateView(): void {
            this.btnRoll.disabled = this.curTimes == this._array.length;
            this.updateCurrent();
            this.updatePrice();
            this.updateRewrd();
            this.updateGift();
        }

        /**更新当前折扣信息 */
        private updateCurrent(): void {
            this.boxCur.visible = this.checkDiscount();
            if (this.boxCur.visible) {
                this.imgCur.skin = `plumYellow/RollClothPanel/${this.curDiscount / 10}.png`;
            }
        }

        /** 检查是否折扣*/
        private checkDiscount(): boolean {
            return this.curDiscount > 0 && this.curDiscount < 100;
        }

        /**更新当前价格信息 */
        private updatePrice(): void {
            let cfg: xls.rouletteDrawCost = this.getCostCfg();
            let price: number = cfg.cost.v2;
            this.labBasePrice.changeText(price.toString());
            this.labPrice.changeText(this.checkDiscount() ? Math.floor(price * this.curDiscount / 100) + '' : price + '');
        }

        /**获取当前价格配置 */
        private getCostCfg(): xls.rouletteDrawCost {
            let times: number = Math.min(this.curTimes, this._cost.length - 1);
            return this._cost[times];
        }

        /**更新奖池奖励状态 */
        private updateGrid(cfg: xls.rouletteDraw, index: number): void {
            let item: ui.plumYellow.render.RollClothItemUI = this.boxItem.getChildAt(index) as ui.plumYellow.render.RollClothItemUI;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            item.imgSelect.visible = false;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        /**更新收集奖励状态 */
        private updateRewrd(): void {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this._suitId);
            this.boxFace.visible = !suitInfo.allGet;
            if (!suitInfo.allGet) {
                this.labProgress.changeText(`${suitInfo.hasCnt}/${suitInfo.clothes.length - 3}`);
                this.boxFace.mouseEnabled = suitInfo.hasCnt >= suitInfo.clothes.length - 3;
            }
        }

        //#region 抽奖效果
        private set select(value: number) {
            let len: number = this.boxItem.numChildren;
            let select: number = Math.round(value);
            if (select == this._select) return;
            let item: ui.plumYellow.render.RollClothItemUI;
            if (this._select != -1) {
                item = this.boxItem.getChildAt(this._select % len) as ui.plumYellow.render.RollClothItemUI;
                item.imgSelect.visible = false;
            }
            this._select = select;
            item = this.boxItem.getChildAt(this._select % len) as ui.plumYellow.render.RollClothItemUI;
            item.imgSelect.visible = true;
        }
        private get select() {
            return this._select;
        }
        private playRotateAni(target: number): Promise<void> {
            this.select = 0;
            return new Promise((suc: Function) => {
                Laya.Tween.to(this, { select: target }, 3500, Laya.Ease.cubicInOut, new Laya.Handler(this, () => { suc(); }));
            })
        }
        //#endregion

        /**展示当前折扣 */
        private playDiscountAni(discount: number) {
            this.imgNext.skin = `plumYellow/RollClothPanel/next_${discount / 10}.png`;
            // return new Promise((suc: Function) => {
            //     this.ani1.play(0, false);
            //     this.ani1.once(Laya.Event.COMPLETE, this, suc);
            // })
        }

        /**点击抽奖 */
        private async onDraw(): Promise<void> {
            let cost: number = parseInt(this.labPrice.text);
            let have = clientCore.ItemsInfo.getItemNum(this._costItemId);
            if (cost > have) {
                this.openBuy();
                return;
            }
            this.btnRoll.disabled = true;
            let msg: pb.sc_common_turntable_draw = await this.draw();
            PlumYellowModel.instance.coinCost(cost);
            let cfg: xls.rouletteDraw = _.find(this._array, (element: xls.rouletteDraw) => {
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                return reward.v1 == msg.items[0].id;
            });
            let index: number = cfg.id - this._array[0].id;
            this.curDiscount = msg.discount;
            if (++this.curTimes < this._array.length) {
                await this.playRotateAni(this.boxItem.numChildren * 5 + index);
                if (this.checkDiscount()) {
                    this.playDiscountAni(msg.discount);
                }
            }
            if (this._disposed) return;
            this.updateView();
            this.updateGrid(cfg, index);
            alert.showReward(msg.items);
        }

        /**请求抽奖结果 */
        private draw(): Promise<pb.sc_common_turntable_draw> {
            return net.sendAndWait(new pb.cs_common_turntable_draw({ id: this._poolId })).then((msg: pb.sc_common_turntable_draw) => {
                return Promise.resolve(msg);
            });
        }

        /**请求收集奖励，美瞳 */
        private onReward(): void {
            this.boxFace.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_common_turntable_reward({ id: this._poolId })).then((msg: pb.sc_get_common_turntable_reward) => {
                alert.showReward(msg.items);
                this.updateRewrd();
            });
        }

        /** 更新集齐奖励状态，注意每期奖励类型不同，判定方式会有不同*/
        private updateGift(): void {
            let hasBg: boolean = clientCore.ItemsInfo.checkHaveItem(this._giftId1[0]);
            //let hasBg: boolean = clientCore.UserHeadManager.instance.getOneInfoById(this._giftId1).have;
            let canGet = !hasBg && this.curTimes >= this._array.length;
            if (canGet) {
                this.ani1.play(0, true);
            } else if (this.ani1.isPlaying) {
                this.ani1.stop();
                this.reward1.scale(1, 1);
                //this.reward2.scale(1, 1);
            }
            // this.imgHas.visible = hasBg;
            this.reward1.mouseEnabled = canGet;
            //this.reward2.mouseEnabled = canGet;
        }

        /** 点击领取背景秀*/
        private onGift() {
            this.reward1.mouseEnabled = false;
            //this.reward2.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_common_turntable_extra_reward({ id: this._poolId })).then(async (msg: pb.sc_get_common_turntable_extra_reward) => {
                alert.showReward(msg.items);
                await clientCore.UserHeadManager.instance.refreshAllHeadInfo();
                this.updateGift();
            });
        }
    }
}