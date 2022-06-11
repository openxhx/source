namespace whiteNightTheory {
    /**
     * 白夜理论
     * whiteNightTheory.WhiteNightTheoryModule
     * \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0806\【主活动】白夜理论20210806_Inory.docx
     */
    export class WhiteNightTheoryModule extends ui.whiteNightTheory.WhiteNightTheoryModuleUI {
        private _model: WhiteNightTheoryModel;
        private _control: WhiteNightTheoryControl;
        private _dataList: Array<IItemRenderVo>;

        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new WhiteNightTheoryModel(), new WhiteNightTheoryControl());
            this._model = clientCore.CManager.getModel(this.sign) as WhiteNightTheoryModel;
            this._control = clientCore.CManager.getControl(this.sign) as WhiteNightTheoryControl;
            this.addPreLoad(Promise.all([]));
        }

        initOver(): void {
            this.initPho();
            this.init2List();
            this.init2ListData();
            this.reset2Money();
            this.reset2Buuble();
        }

        private initPho(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/whiteNightTheory/pho_${sex}.png`;
        }

        private init2List(): void {
            this.lsItems.hScrollBarSkin = "";
            this.lsItems.vScrollBarSkin = "";
            this.lsItems.scrollBar.touchScrollEnable = false;
            this.lsItems.scrollBar.mouseWheelEnable = false;
            this.lsItems.itemRender = TheoryRender;
            this.lsItems.renderHandler = new Laya.Handler(this, this.onRender);
        }

        private init2ListData(): void {
            this._dataList = [];
            for (let i: number = 0, j: number = this._model.ITEM_TOTAL; i < j; i++) {
                this._dataList.push({
                    ...this._model.ITEM_DATA_LIST[i],
                    isFinished: this._model.isFinishedItem(i),
                    isFlag: false
                });
            }
            this._dataList.splice(this._model.FLAG_ITEM_INDEX, 0, {
                index: 0,
                itemId: null,
                moneyNum: null,
                isFinished: this._model.isFinishedAll(),
                isFlag: true
            });
            this.lsItems.array = this._dataList;
        }

        private reset2Money(): void {
            this.labMoney.text = `${clientCore.MoneyManager.getNumById(this._model.MONEY_ID)}`;
        }

        private reset2Buuble(): void {
            if (this._model.isFinishedAll()) {
                this.labBubble.text = `你已经拥有成为一名侦探的基本素质了。`;
            } else {
                this.labBubble.text = `记住，侦探的目的是寻找 真相，而不是主持正义。`;
            }
        }

        private resetListData(index: number): void {
            const finished: boolean = this._model.isFinishedItem(index);
            this._dataList.splice(this._model.FLAG_ITEM_INDEX, 1);
            this._dataList[index].isFinished = finished;
            this._dataList.splice(this._model.FLAG_ITEM_INDEX, 0, {
                index: 0,
                itemId: null,
                moneyNum: null,
                isFinished: this._model.isFinishedAll(),
                isFlag: true
            });
            this.lsItems.array = this._dataList;
        }

        popupOver(): void {
            clientCore.UIManager.setMoneyIds([this._model.MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.firstRedPointer();
            clientCore.Logger.sendLog('2021年8月6日活动', '【主活动】白夜理论', '打开主活动面板');
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onShowSuit);
            BC.addEvent(this, this.btnCollect, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, EventManager, WhiteNightTheoryEventType.CLICK_STUDY, this, this.onStudy);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        //修业
        private onStudy(): void {
            clientCore.Logger.sendLog('2021年8月6日活动', '【主活动】白夜理论', '点击领取按钮');
            const data: IItemVo = this._model.getNextDoingItem();
            this._control.getReward(data.index).then(msg => {
                alert.showReward(msg.item);
                this.reset2Money();
                this.reset2Buuble();
                this.resetListData(data.index);//重新刷新列表
                this.reset2RedPointer(true);
            });
        }

        //收集
        private onClickHandler(e: Laya.Event): void {
            this.destroy();
            clientCore.ModuleManager.open("playground.PlaygroundModule");
            clientCore.Logger.sendLog('2021年8月6日活动', '【主活动】白夜理论', '点击收集按钮');
        }


        private onShowRule(): void {
            alert.showRuleByID(this._model.RULE_ID);
            clientCore.Logger.sendLog('2021年8月6日活动', '【主活动】白夜理论', '点击活动规则按钮');
        }

        private onShowSuit(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.SUIT_ID);
        }

        //渲染
        private onRender(item: TheoryRender, index: number): void {
            const data: IItemRenderVo = this._dataList[index];
            item.initModel(this._model);
            item.updateUI(data);
        }

        //一生一次的红点
        private firstRedPointer(): void {
            clientCore.MedalManager.getMedal([MedalConst.WHITENIGHT_THEORY_REDPOINT]).then(msg => {
                if (msg[0].value == 0) {
                    util.RedPoint.reqRedPointRefresh(this._model.RED_POINTER_ID);
                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.PLOT_ID, null, null);//配表动画
                    clientCore.MedalManager.setMedal([{id: MedalConst.WHITENIGHT_THEORY_REDPOINT, value: 1}]);
                } else {
                    this.reset2RedPointer(false);
                }
            });
        }

        //刷红点
        private reset2RedPointer(isChanged: boolean): void {
            if (isChanged) {
                util.RedPoint.reqRedPointRefresh(this._model.RED_POINTER_ID);
                return;
            }
            if (this._model.isFinishedAll()) return;
            const target: IItemVo = this._model.getNextDoingItem();
            if (clientCore.MoneyManager.getNumById(this._model.MONEY_ID) >= target.moneyNum) {
                util.RedPoint.reqRedPointRefresh(this._model.RED_POINTER_ID);
            }
        }

        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            for (let i: number = 0, j: number = this.lsItems.cells.length; i < j; i++) {
                (<TheoryRender><any>this.lsItems.cells[i]).clear();
            }
            this.lsItems.renderHandler = null;
            this._dataList = null;
            super.destroy();
        }
    }
}