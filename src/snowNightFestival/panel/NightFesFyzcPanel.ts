namespace snowNightFestival {
    export class NightFesFyzcPanel extends ui.snowNightFestival.panel.NightFesFyzcPanelUI {
        private _suitId: number = 2100255;
        private _stageId: number = 1100032;
        private _bgShowId: number = 1000057;

        private _rotating: boolean = false;

        private _imgNum: number = 15;
        private _imgRotation: number = 10;
        private _currImgIndex: number = -1;
        private _discountNum: number = 0;

        private _alreadyDrawTimes: number = 0;
        private _nextDiscount: number = 0;
        private _drawCost: number = 0;

        private _onGetList: Array<number>;
        private _unGetList: Array<number>;
        private _surplusIndexList: Array<number>;
        private _itemList: Array<SnowNightFestivalRender>;

        private _control: SnowNightFestivalControl;
        private _model: SnowNightFestivalModel;

        private _curPool: number;
        private curPage: number;
        private panelName: { name: string, open: number }[];

        constructor(sign: number) {
            super();
            this._control = clientCore.CManager.getControl(sign) as SnowNightFestivalControl;
            this._model = clientCore.CManager.getModel(sign) as SnowNightFestivalModel;
            this._itemList = [];
            this.panelName = [{ name: "yflk", open: 0 }, { name: "xjgj", open: 1 }];
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.list.array = this.panelName;
            this.box2.visible = this.boxSuit1.visible = false;
            this.imgMale1.visible = this.suitMale.visible = this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.imgFemale1.visible = this.suitFemale.visible = this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.tabMouse(1);
            this.addEventListeners();
        }

        init() {
            for (let i = 0; i < this._itemList.length; i++) {
                this._itemList[i].destroy();
                BC.removeEvent(this, this._itemList[i].panel, Laya.Event.CLICK, this, this.onCheckAward);
            }
            this._itemList = [];
            for (let i = 0; i < this._imgNum; i++) {
                let des = this.curPage == 1 ? "item" : "item";
                this._itemList.push(new SnowNightFestivalRender(this[des + i]));
                BC.addEvent(this, this._itemList[i].panel, Laya.Event.CLICK, this, this.onCheckAward, [this._itemList[i]]);
            }
            let rouletteDraws = xls.get(xls.rouletteDraw).getValues().filter((o) => { return o.period == this.curPage });
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
            this.imgPriceIcon.skin = this.imgPriceIcon1.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.LEAF_MONEY_ID);
        }

        /**页签 */
        private tabRender(item: ui.snowNightFestival.render.PageTagItem1UI) {
            let data: { name: string, open: number } = item.dataSource;
            item.di_1.visible = data.open == 1;
            item.img_name.skin = `snowNightFestival/tag_${data.name}_${data.open}.png`;
            switch (data.name) {
                case "yflk":
                    item.red.visible = util.RedPoint.checkShow([21305]);
                    break;
                case "xjgj":
                    item.red.visible = util.RedPoint.checkShow([21308]);
                    break;
                default:
                    item.red.visible = false;
            }
        }

        private tabMouse(idx: number) {
            if (idx < 0) return;
            if (idx == this.curPage - 1) return;
            if (this._model.disPanelChange) {
                this.list.selectedIndex = -1;
                return;
            }
            if (this.curPage > 0) {
                // this["box" + this.curPage].visible = false;
                this["boxSuit" + this.curPage].visible = false;
                this.panelName[this.curPage - 1].open = 0;
            }
            this.panelName[idx].open = 1;
            this.list.refresh();
            this.curPage = idx + 1;
            // this["box" + this.curPage].visible = true;
            this["boxSuit" + this.curPage].visible = true;
            if (idx == 0) this.setOneUI();
            else if (idx == 1) this.setTwoUI();
            this.init();
            this.getInfo();
            this.list.selectedIndex = -1;
        }

        private setOneUI() {
            this._curPool = 1;
            this.lab.text = "远方来客背景秀";
            this.labName.text = "远方来客套装";
            this.labStage.text = "远方来客舞台";
            this.imgFemale1.skin = "snowNightFestival/nu_mei_tong.png";
            this.imgMale1.skin = "snowNightFestival/nan_mei_tong.png";
            this._suitId = 2100255;
            this._stageId = 1100032;
            this._bgShowId = 1000057;
        }

        private setTwoUI() {
            this._curPool = 2;
            this.lab.text = "西极庚金背景秀";
            this.labName.text = "西极庚金套装";
            this.labStage.text = "西极庚金舞台";
            this.imgFemale1.skin = "snowNightFestival/eye_xjgj_1.png";
            this.imgMale1.skin = "snowNightFestival/eye_xjgj_2.png";
            this._suitId = 2100236;
            this._stageId = 1100026;
            this._bgShowId = 1000046;
        }

        private get giftId() {
            let female = [4100853, 4100739];
            let male = [4100856, 4100742];
            return clientCore.LocalInfo.sex == 1 ? female[this.curPage - 1] : male[this.curPage - 1];
        }

        public onShow() {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.tabMouse(1);
        }

        private async getInfo() {
            let msg = await this._control.fyzcInfo(this.curPage);
            this._alreadyDrawTimes = msg.cnt;
            this._nextDiscount = msg.discount;
            this.imgNextOff.visible = false;
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
            this.btnEye.visible = true;
            this.txtCnt.text = this._alreadyDrawTimes + "/" + this._imgNum;
            this.imgReceived.visible = false;
            if (this._alreadyDrawTimes < this._imgNum) {
                this.btnEye.disabled = true;
                this.btnRed.onRedChange(false);
                this.txtEye.text = "集齐奖励";
            } else if (clientCore.ItemsInfo.checkHaveItem(this.giftId)) {
                this.btnEye.visible = false;
                this.imgReceived.visible = true;
            } else {
                this.btnEye.disabled = false;
                this.btnRed.onRedChange(true);
                this.txtEye.text = "领取奖励";
            }

            for (let i = 0; i < this._onGetList.length; i++) {
                this._itemList[this._onGetList[i]].isReceive(true);
            }

            if (this._alreadyDrawTimes > this._imgNum - 1) {
                this.boxDraw.visible = false;
            } else {
                this.boxDraw.visible = true;
                let rouletteDrawCosts = xls.get(xls.rouletteDrawCost).getValues();
                let rouletteDrawCost = rouletteDrawCosts[this._alreadyDrawTimes];
                this._drawCost = rouletteDrawCost.cost.v2;

                if (this._alreadyDrawTimes == 0 || this._nextDiscount == 100) {
                    this._discountNum = this._drawCost;
                    this.boxPrice.visible = false;
                    this.boxOff.visible = false;
                } else {
                    this._discountNum = this._drawCost * this._nextDiscount / 100;

                    this.imgCurOff.skin = "snowNightFestival/" + (this._nextDiscount / 10) + ".png";

                    this.labPrice1.text = "" + this._drawCost;
                    this.boxPrice.visible = true;
                    this.boxOff.visible = true;
                }
                this.labPrice.text = "" + this._discountNum;
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

        private onDetail() {
            alert.showRuleByID(1118);
        }

        private onTry(): void {
            let suits = [2100255, 2100236];
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._suitId);
        }

        private onDraw() {
            if (this._rotating || this._unGetList.length == 0)
                return;
            let beanNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            if (beanNum < this._discountNum) {
                alert.AlertLeafEnough.showAlert(this._discountNum - beanNum);
            }
            else {
                alert.showSmall('确定要花费' + this._discountNum + '个神叶进行祈祷吗？', { callBack: { caller: this, funArr: [this.startTurn] } });
            }
        }

        private onPreviewWutai() {
            /**
             * 4100853\4100854\4100855\女
             * 4100856\4100857\4100858\男
            */
            let femaleReward = xls.get(xls.rouletteDrawReward).get(this.curPage).awardFemale;
            let maleReward = xls.get(xls.rouletteDrawReward).get(this.curPage).awardMale;
            let rwd = clientCore.LocalInfo.sex == 1 ? femaleReward : maleReward;
            clientCore.ModuleManager.open('panelCommon.RewardShowModule', { reward: clientCore.GoodsInfo.createArray(rwd) });
        }

        private onGetWutai() {
            this.addPreLoad(net.sendAndWait(new pb.cs_get_common_turntable_reward({ id: this.curPage })).then(async (data: pb.sc_get_common_turntable_reward) => {
                alert.showReward(data.items);
                this.btnEye.visible = false;
                this.imgReceived.visible = true;
                await util.RedPoint.reqRedPointRefresh(21305);
                await util.RedPoint.reqRedPointRefresh(21308);
                this.list.refresh();
                EventManager.event("NIGHTFES_REFRESH_TAB");
            }));
        }

        private onCheckAward(item: SnowNightFestivalRender): void {
            clientCore.ToolTip.showTips(item.panel, { id: item.awards[0].v1 });
        }

        private startTurn() {
            Laya.Tween.clearAll(this);
            Laya.Tween.clearAll(this.imgNextOff);
            this._rotating = true;
            this._model.disPanelChange = true;
            net.sendAndWait(new pb.cs_common_turntable_draw({ id: this.curPage })).then((data: pb.sc_common_turntable_draw) => {
                this._nextDiscount = data.discount;
                this._alreadyDrawTimes += 1;
                let index = this.getItemIndexById(data.items[0].id);
                this._onGetList.push(index);
                if (this._unGetList.length <= 1) {
                    this._rotating = false;
                    this.onShowSelectImg(index);
                    this._itemList[index].isReceive(true);
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                    this.btnRoll.disabled = true;
                    this.updateView();
                    this._model.disPanelChange = false;
                } else {
                    let value = this._unGetList.indexOf(index) + _.random(4, 5, false) * this._unGetList.length + 0.5;
                    value = value * this._imgRotation;
                    let timeNum = this._unGetList.length * 300;

                    this.value = this.getNextUnGetIndex() * this._imgRotation;

                    // this.aniDraw.resume();
                    // this.aniDraw.visible = true;
                    this.btnRoll.disabled = true;

                    if (data.discount < 100) {
                        this.imgNextOff.y = 50;
                        this.imgNextOff.skin = "snowNightFestival/xia_hui" + (this._nextDiscount / 10) + "_zhe.png";
                        this.imgNextOff.visible = true;
                        Laya.Tween.to(this.imgNextOff, { y: 0 }, 800, null, Laya.Handler.create(this, () => {
                            this.imgNextOff.visible = false;
                        }));
                    }
                    Laya.Tween.to(this, {
                        value: value,
                        update: new Laya.Handler(this, this.updateSelectImg)
                    }, timeNum, Laya.Ease.cubicInOut,
                        new Laya.Handler(this, () => {
                            this._rotating = false;
                            this._model.disPanelChange = false;
                            this.onShowSelectImg(index);
                            this._itemList[index].isReceive(true);
                            this.imgNextOff.visible = false;
                            this.btnRoll.disabled = false;
                            this.updateView();
                            alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                        }), 100)
                }
            }).catch(() => {
                this._model.disPanelChange = false;
            });
        }

        private updateSelectImg(): void {
            let index = Math.floor(this.value / this._imgRotation) % this._unGetList.length;
            index = this._unGetList[index];
            if (index != this._currImgIndex) {
                // if (index <= 4) {
                //     this.aniDraw.scaleX = 1;
                //     this.aniDraw.rotation = 0;
                // } else if (index <= 7) {
                //     this.aniDraw.scaleX = 1;
                //     this.aniDraw.rotation = 90;
                // } else if (index <= 11) {
                //     this.aniDraw.scaleX = -1;
                //     this.aniDraw.rotation = 0;
                // } else {
                //     this.aniDraw.scaleX = 1;
                //     this.aniDraw.rotation = -90;
                // }
                // this.aniDraw.x = this._itemList[index].panel.x;
                // this.aniDraw.y = this._itemList[index].panel.y;
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

        public hide() {
            clientCore.UIManager.releaseCoinBox();
            this.visible = false;
        }

        /**预览背景秀 */
        private tryBgshow() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._bgShowId, condition: '', limit: '' });
        }

        /**预览舞台 */
        private tryStage() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._stageId, condition: '', limit: '' });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnTryStage, Laya.Event.CLICK, this, this.tryStage);
            BC.addEvent(this, this.btnTryBg, Laya.Event.CLICK, this, this.tryBgshow);
            BC.addEvent(this, this.btnRoll, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.boxGift, Laya.Event.CLICK, this, this.onPreviewWutai);
            BC.addEvent(this, this.btnEye, Laya.Event.CLICK, this, this.onGetWutai);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            Laya.Tween.clearAll(this.imgNextOff);
            Laya.Tween.clearAll(this);
            for (let i = 0; i < this._itemList.length; i++) {
                this._itemList[i].destroy();
            }
            this._itemList = [];
            this.removeEventListeners();
            super.destroy();
        }
    }
}