namespace waterMelody {
    /**
     * 水调歌头模板
     * 2021/9/3\
     * waterMelody.WaterMelodyModule
     */
    export class WaterMelodyModule extends ui.waterMelody.WaterMelodyModuleUI {
        /** 抽奖功能ID*/
        private _poolId: number = 16;
        /** 抽奖使用的道具ID*/
        private _costItemId: number = 9900224;
        /**活动id */
        public activityId: number = 186;
        /**套装ID */
        private _suitId: number = 2110478;
        /**集齐奖励ID */
        private _giftId: number[] = [135677, 135678];
        /**帮助说明id */
        private _ruleId: number = 1150;

        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _cost: xls.rouletteDrawCost[];

        /**当前折扣 */
        private curDiscount: number;
        /**抽奖次数 */
        private curTimes: number;

        init() {
            this.addPreLoad(xls.load(xls.rouletteDraw));
            this.addPreLoad(xls.load(xls.rouletteDrawCost));
            this.addPreLoad(xls.load(xls.rouletteDrawReward));
            this.addPreLoad(xls.load(xls.rechargeEvent));
        }

        onPreloadOver() {
            this.imgSuit1.visible = this.imgEye1.visible = this.btnGet1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = this.imgEye2.visible = this.btnGet2.visible = clientCore.LocalInfo.sex == 2;
            this.setShowInfo();
            clientCore.Logger.sendLog('2021年9月3日活动', '【付费】0903付费', '打开水调歌头面板');
        }

        popupOver() {
            clientCore.MedalManager.getMedal([MedalConst.WATER_MELODY_OPEN]).then((msg: pb.ICommonData[]) => {
                if (msg[0].value == 0) {
                    clientCore.MedalManager.setMedal([{ id: MedalConst.WATER_MELODY_OPEN, value: 1 }]);
                    alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的小木锤以及魔法扑克按照1：1的比例转换为树枝，快去参加活动吧~');
                }
            })
        }

        private async setShowInfo() {
            clientCore.LoadingManager.showSmall();
            await net.sendAndWait(new pb.cs_get_common_turntable_info({ id: this._poolId })).then((msg: pb.sc_get_common_turntable_info) => {
                this.curDiscount = msg.discount;
                this.curTimes = msg.cnt;
            });
            this.initView();
            clientCore.UIManager.setMoneyIds([this._costItemId]);
            clientCore.UIManager.showCoinBox();
            clientCore.LoadingManager.hideSmall(true);
        }

        /**
         * 初始化界面
         */
        private initView(): void {
            this.imgNextOff.visible = false;
            //格子初始化
            this._array = _.filter(xls.get(xls.rouletteDraw).getValues(), (element: xls.rouletteDraw) => { return element.type == this.activityId && element.period == this._poolId; });
            this._cost = _.filter(xls.get(xls.rouletteDrawCost).getValues(), (element: xls.rouletteDrawCost) => { return element.type == this.activityId && element.period == this._poolId });
            _.forEach(this._array, (element: xls.rouletteDraw, index: number) => {
                this.updateGrid(element, index);
                let item: Laya.Sprite = this.boxItem.getChildAt(index) as Laya.Sprite;
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                BC.addEvent(this, item, Laya.Event.CLICK, this, () => { clientCore.ToolTip.showTips(item, { id: reward.v1 }) });
            });
            //面板初始化
            this.updateView();
        }

        destroy(): void {
            clientCore.UIManager.releaseCoinBox();
            Laya.Tween.clearAll(this);
            if (this._array) this._array.length = 0;
            this._array = null;
            this._disposed = true;
            super.destroy();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.boxEye, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.btnGet1, Laya.Event.CLICK, this, this.onGift);
            BC.addEvent(this, this.btnGet2, Laya.Event.CLICK, this, this.onGift);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this._ruleId);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._suitId);

        }
        /**打开礼包购买面板 */
        private openBuy(): void {
            alert.showEventBuy([5, 6]);
        }

        /**界面更新 */
        private updateView(): void {
            this.btnStart.disabled = this.curTimes == this._array.length;
            this.updateCurrent();
            this.updatePrice();
            this.updateRewrd();
            this.updateGift();
        }

        /**更新当前折扣信息 */
        private updateCurrent(): void {
            this.boxCurrent.visible = this.checkDiscount();
            if (this.boxCurrent.visible) {
                this.imgCurOff.skin = `waterMelody/${this.curDiscount / 10}.png`;
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
            this.labCostOld.changeText(price + '');
            this.labCost.changeText(this.checkDiscount() ? Math.floor(price * this.curDiscount / 100) + '' : price + '');
        }

        /**获取当前价格配置 */
        private getCostCfg(): xls.rouletteDrawCost {
            let times: number = Math.min(this.curTimes, this._cost.length - 1);
            return this._cost[times];
        }

        /**更新奖池奖励状态 */
        private updateGrid(cfg: xls.rouletteDraw, index: number): void {
            let item: ui.waterMelody.render.WaterMelodyItemUI = this.boxItem.getChildAt(index) as ui.waterMelody.render.WaterMelodyItemUI;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            item.imgSel.visible = false;
            item.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        /**更新收集奖励状态 */
        private updateRewrd(): void {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this._suitId);
            this.boxEye.visible = !suitInfo.allGet;
            if (!suitInfo.allGet) {
                this.labProgress.changeText(`${suitInfo.hasCnt}/${suitInfo.clothes.length - 3}`);
                this.boxEye.mouseEnabled = suitInfo.hasCnt >= suitInfo.clothes.length - 3;
            }
        }
        //#region 抽奖效果
        private set select(value: number) {
            let len: number = this.boxItem.numChildren;
            let select: number = Math.round(value);
            if (select == this._select) return;
            let item: ui.waterMelody.render.WaterMelodyItemUI;
            if (this._select != -1) {
                item = this.boxItem.getChildAt(this._select % len) as ui.waterMelody.render.WaterMelodyItemUI;
                item.imgSel.visible = false;
            }
            this._select = select;
            item = this.boxItem.getChildAt(this._select % len) as ui.waterMelody.render.WaterMelodyItemUI;
            item.imgSel.visible = true;
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
            this.imgNextOff.skin = `waterMelody/xia_hui${discount / 10}_zhe.png`;
        }


        /**点击抽奖 */
        private async onDraw(): Promise<void> {
            let cost: number = parseInt(this.labCost.text);
            let have = clientCore.ItemsInfo.getItemNum(this._costItemId);
            if (cost > have) {
                this.openBuy();
                return;
            }
            this.btnStart.disabled = true;
            let msg: pb.sc_common_turntable_draw = await this.draw();
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
            this.boxEye.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_common_turntable_reward({ id: this._poolId })).then((msg: pb.sc_get_common_turntable_reward) => {
                alert.showReward(msg.items);
                this.updateRewrd();
            });
        }

        /** 更新集齐奖励状态，注意每期奖励类型不同，判定方式会有不同*/
        private updateGift(): void {
            if (this.btnGet1.visible) {
                var hasBg: boolean = clientCore.ItemsInfo.checkHaveItem(this._giftId[0]);
            }
            else {
                var hasBg: boolean = clientCore.ItemsInfo.checkHaveItem(this._giftId[1]);
            }

            let canGet = !hasBg && this.curTimes >= this._array.length;
            if (canGet) {
                this.ani1.play(0, true);
            } else if (this.ani1.isPlaying) {
                this.ani1.stop();
                this.btnGet1.scale(1, 1);
                this.btnGet2.scale(1, 1);
            }
            this.imgHas.visible = hasBg;
            this.btnGet1.mouseEnabled = canGet;
            this.btnGet2.mouseEnabled = canGet;
        }

        /** 点击领取背景秀*/
        private onGift() {
            this.btnGet1.mouseEnabled = false;
            this.btnGet2.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_common_turntable_extra_reward({ id: this._poolId })).then((msg: pb.sc_get_common_turntable_extra_reward) => {
                alert.showReward(msg.items);
                this.updateGift();
            });
        }

    }
}