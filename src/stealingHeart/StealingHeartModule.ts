namespace stealingHeart {

        /**
         * 偷心大作战
         * stealingHeart.StealingHeartModule
        */
        export class StealingHeartModule extends ui.stealingHeart.StealingHeartModuleUI {
                private readonly SUITID: number = 2100226;
                private readonly WUTAIID: number = 1100021;
                private readonly BEIJINGXIUID: number = 1000038;

                private _rotating: boolean = false;

                private _imgNum: number = 14;
                private _imgRotation: number = 10;
                private _currImgIndex: number = -1;
                private _discountNum: number = 0;

                private _alreadyDrawTimes: number = 0;
                private _nextDiscount: number = 0;
                private _drawCost: number = 0;

                private _onGetList: Array<number>;
                private _unGetList: Array<number>;
                private _surplusIndexList: Array<number>;
                private _itemList: Array<StealingHeartRender>;

                private _rewardPanel: RewardPanel;

                init() {
                        this.addPreLoad(net.sendAndWait(new pb.cs_stealing_heart_battle_get_info).then((data: pb.sc_stealing_heart_battle_get_info) => {
                                this._alreadyDrawTimes = data.alreadyDrawTimes;
                                this._nextDiscount = data.nextDiscount;
                        }));

                        this.addPreLoad(xls.load(xls.rouletteDraw));
                        this.addPreLoad(xls.load(xls.rouletteDrawCost));

                        clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
                        clientCore.UIManager.showCoinBox();

                        this._itemList = [];
                        for (let i = 0; i < this._imgNum; i++) {
                                this._itemList.push(new StealingHeartRender(this["item" + i]));
                        }
                }

                initOver() {
                        let rouletteDraws = xls.get(xls.rouletteDraw).getValues();
                        let rouletteDrawCosts = xls.get(xls.rouletteDrawCost).getValues();

                        this.imgRole.skin = clientCore.LocalInfo.sex == 1 ? 'stealingHeart/nv.png' : 'stealingHeart/nan.png';

                        this._onGetList = [];
                        for (let i = 0; i < rouletteDraws.length; i++) {
                                if (clientCore.LocalInfo.sex == 1) {
                                        this._itemList[i].init({ awards: rouletteDraws[i].femaleAward });
                                } else {
                                        this._itemList[i].init({ awards: rouletteDraws[i].maleAward });
                                }
                                if (this._itemList[i].isHasAward()) {
                                        this._onGetList.push(i);
                                }
                        }
                        this.imgPriceIcon.skin = this.imgDiscountIcon.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.LEAF_MONEY_ID);
                        this.updateView();
                        this.onShowSelectImg(this._unGetList[this.getNextUnGetIndex()]);
                }

                private updateView() {
                        this._unGetList = [];
                        for (let i = 0; i < this._imgNum; i++) {
                                if (this._onGetList.indexOf(i) < 0) {
                                        this._unGetList.push(i);
                                }
                        }

                        this.aniDraw.paused();
                        this.aniDraw.visible = false;
                        this.txtWutai.text = this._alreadyDrawTimes + "/" + this._imgNum;

                        if (this._alreadyDrawTimes < this._imgNum) {
                                this.imgWutai.visible = true;
                                this.btnWutai.visible = false;
                        } else if (clientCore.ItemsInfo.getItemNum(this.WUTAIID) > 0) {
                                this.imgWutai.visible = false;
                                this.btnWutai.visible = false;
                        } else {
                                this.imgWutai.visible = false;
                                this.btnWutai.visible = true;
                        }

                        for (let i = 0; i < this._onGetList.length; i++) {
                                this._itemList[this._onGetList[i]].isReceive(true);
                        }

                        if (this._alreadyDrawTimes > this._imgNum - 1) {
                                this.imgLove.visible = true;
                                this.boxDraw.visible = false;
                        } else {
                                let rouletteDrawCosts = xls.get(xls.rouletteDrawCost).getValues();
                                let rouletteDrawCost = rouletteDrawCosts[this._alreadyDrawTimes];
                                this._drawCost = rouletteDrawCost.cost.v2;

                                if (this._alreadyDrawTimes == 0 || this._nextDiscount == 100) {
                                        this._discountNum = this._drawCost;

                                        this.boxPrice.visible = false;
                                        this.boxDiscount.visible = false;
                                } else {
                                        this._discountNum = this._drawCost * this._nextDiscount / 100;

                                        this.imgDiscount.skin = "stealingHeart/" + (this._nextDiscount / 10) + ".png";

                                        this.txtPrice.text = "：" + this._drawCost;
                                        this.boxPrice.visible = true;
                                        this.boxDiscount.visible = true;
                                }
                                this.txtDiscount.text = "：" + this._discountNum;
                                this.imgLove.visible = false;
                        }
                }

                private onShowSelectImg(index: number): void {
                        let oldItem = this._itemList[this._currImgIndex];
                        if (oldItem) {
                                oldItem.isSelect(false);
                        }
                        this._currImgIndex = index;
                        let newItem = this._itemList[this._currImgIndex];
                        if (newItem) {
                                newItem.isSelect(true);
                        }
                }

                private onListMouse(item: any, data: any) {
                        clientCore.ToolTip.showTips(item, { id: data.reward.v1 });
                }

                private onDetail() {
                        alert.showRuleByID(1052);
                }

                private onTry(): void {
                        clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUITID);
                }

                private onDraw() {
                        if (this._rotating || this._unGetList.length == 0)
                                return;
                        let beanNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
                        if (beanNum < this._discountNum) {
                                alert.AlertLeafEnough.showAlert(this._discountNum - beanNum);
                        }
                        else {
                                alert.showSmall('确定要花费' + this._discountNum + '个神叶进行抽奖吗？', { callBack: { caller: this, funArr: [this.startTurn] } });
                        }
                }

                private onPreviewWutai() {
                        alert.showPreviewModule([this.WUTAIID, this.BEIJINGXIUID]);
                }

                private onGetWutai() {
                        this.addPreLoad(net.sendAndWait(new pb.cs_stealing_heart_battle_get_extra_reward).then((data: pb.sc_stealing_heart_battle_get_extra_reward) => {
                                alert.showReward(clientCore.GoodsInfo.createArray([{ v1: this.WUTAIID, v2: 1 }, { v1: this.BEIJINGXIUID, v2: 1 }]));
                                this.btnWutai.visible = false;
                        }));
                }

                private onCheckAward(item: StealingHeartRender): void {
                        this._rewardPanel = this._rewardPanel || new RewardPanel();
                        this._rewardPanel.setInfo(item.awards);
                        clientCore.DialogMgr.ins.open(this._rewardPanel);
                }

                private startTurn() {
                        Laya.Tween.clearAll(this);
                        Laya.Tween.clearAll(this.imgNextDiscount);
                        this._rotating = true;

                        this.addPreLoad(net.sendAndWait(new pb.cs_stealing_heart_battle_draw).then((data: pb.sc_stealing_heart_battle_draw) => {
                                this._nextDiscount = data.nextDiscount;
                                this._alreadyDrawTimes += 1;

                                let index = this.getItemIndexById(data.itms[0].id);
                                this._onGetList.push(index);

                                if (this._unGetList.length <= 1) {
                                        this._rotating = false;
                                        this.onShowSelectImg(index);
                                        this._itemList[index].isReceive(true);
                                        alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                                        this.btnDraw.disabled = true;
                                        this.updateView();
                                } else {
                                        let value = this._unGetList.indexOf(index) + _.random(4, 5, false) * this._unGetList.length + 0.5;
                                        value = value * this._imgRotation;
                                        let timeNum = this._unGetList.length * 300;

                                        this.value = this.getNextUnGetIndex() * this._imgRotation;

                                        this.aniDraw.resume();
                                        this.aniDraw.visible = true;
                                        this.btnDraw.disabled = true;

                                        if (data.nextDiscount < 100) {
                                                this.imgNextDiscount.y = 50;
                                                this.imgNextDiscount.skin = "stealingHeart/xia_hui" + (this._nextDiscount / 10) + "_zhe.png";
                                                this.imgNextDiscount.visible = true;
                                                Laya.Tween.to(this.imgNextDiscount, { y: 12 }, 1000);
                                        }
                                        Laya.Tween.to(this, {
                                                value: value,
                                                update: new Laya.Handler(this, this.updateSelectImg)
                                        }, timeNum, Laya.Ease.cubicInOut,
                                                new Laya.Handler(this, () => {
                                                        this._rotating = false;
                                                        this.onShowSelectImg(index);
                                                        this._itemList[index].isReceive(true);
                                                        this.imgNextDiscount.visible = false;
                                                        this.btnDraw.disabled = false;
                                                        this.updateView();
                                                        alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                                                }), 100)
                                }
                        }));
                }

                private updateSelectImg(): void {
                        let index = Math.floor(this.value / this._imgRotation) % this._unGetList.length;
                        index = this._unGetList[index];
                        if (index != this._currImgIndex) {
                                if (index <= 4) {
                                        this.aniDraw.scaleX = 1;
                                        this.aniDraw.rotation = 0;
                                } else if (index <= 7) {
                                        this.aniDraw.scaleX = 1;
                                        this.aniDraw.rotation = 90;
                                } else if (index <= 11) {
                                        this.aniDraw.scaleX = -1;
                                        this.aniDraw.rotation = 0;
                                } else {
                                        this.aniDraw.scaleX = 1;
                                        this.aniDraw.rotation = -90;
                                }
                                this.aniDraw.x = this._itemList[index].panel.x;
                                this.aniDraw.y = this._itemList[index].panel.y;
                                this.onShowSelectImg(index);
                        }
                }

                private _value: number = 0;
                private get value(): number {
                        return this._value;
                }

                private set value(value: number) {
                        this._value = value;
                }

                private getItemIndexById(id: number): number {
                        for (let i = 0; i < this._itemList.length; i++) {
                                if (this._itemList[i].hasAward(id)) {
                                        return i;
                                }
                        }
                        return -1;
                }

                private getNextUnGetIndex(): number {
                        for (let i = 0; i < this._unGetList.length; i++) {
                                if (this._unGetList[i] > this._currImgIndex) {
                                        return i;
                                }
                        }
                        return 0;
                }

                addEventListeners() {
                        BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.destroy);
                        BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
                        BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
                        BC.addEvent(this, this.btnDraw, Laya.Event.CLICK, this, this.onDraw);
                        BC.addEvent(this, this.boxWutai, Laya.Event.CLICK, this, this.onPreviewWutai);
                        BC.addEvent(this, this.btnWutai, Laya.Event.CLICK, this, this.onGetWutai);

                        for (let i = 0; i < this._itemList.length; i++) {
                                BC.addEvent(this, this._itemList[i].panel, Laya.Event.CLICK, this, this.onCheckAward, [this._itemList[i]]);
                        }
                }

                removeEventListeners() {
                        super.removeEventListeners();
                        BC.removeEvent(this);
                }

                destroy(): void {
                        Laya.Tween.clearAll(this.imgNextDiscount);
                        Laya.Tween.clearAll(this);

                        for (let i = 0; i < this._itemList.length; i++) {
                                this._itemList[i].destroy();
                        }
                        this._itemList = [];
                        this._rewardPanel?.destroy();

                        clientCore.UIManager.releaseCoinBox();
                        super.destroy();
                }
        }
}