namespace spacetimeDetective {
    /**
     * 答题面板
     */
    export class AnswerQuestionPanel extends ui.spacetimeDetective.panel.AnswerQuestionPanelUI {
        private _model: SpacetimeDetectiveModel;
        private _control: SpacetimeDetectiveControl;
        private _cfg: xls.miniAnswer;
        private _outT: NodeJS.Timeout;
        constructor(sign: number) {
            super();
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as SpacetimeDetectiveModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpacetimeDetectiveControl;
        }

        initOver(): void {
            this.lsTabs.vScrollBarSkin = "";
            this.lsTabs.renderHandler = new Laya.Handler(this, this.onRender);
            this.lsTabs.selectHandler = new Laya.Handler(this, this.onSelectList);
            this.lsTabs.selectEnable = true;
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [false]);
            BC.addEvent(this, this.btnOK, Laya.Event.CLICK, this, this.onClickHandler);
            this.resetQuestion();
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private resetQuestion(arr: Array<IQuestionVo> = null): void {
            this._cfg = xls.get(xls.miniAnswer).get(this._model.getQuestionId());
            this.labQuestion.text = `Q:${this._cfg.content}`;
            if (arr == null) {
                arr = [
                    { answer: 1, select: false, showResult: null },
                    { answer: 2, select: false, showResult: null },
                ];
            }
            if (this.lsTabs.selectedIndex >= 0) {
                this.lsTabs.selectedIndex = -1;
                this.lsTabs.selectedItem = null;
            }
            this.lsTabs.array = arr;
        }

        private onClickHandler(e: Laya.Event): void {
            let list: IQuestionVo[] = this.lsTabs.array;
            let cell: IQuestionVo;
            let isOk: boolean = false;
            this.btnOK.mouseEnabled = false;
            this.lsTabs.selectEnable = false;
            let hasClick: boolean = false;
            for (let i: number = 0; i < list.length; i++) {
                cell = list[i];
                if (cell.select == true) {
                    if (this._cfg.rightAnswer == cell.answer) {
                        cell.showResult = true;
                        isOk = true;
                    } else {
                        cell.showResult = false;
                    }
                    hasClick = true;
                }
            }
            if (!hasClick) {
                alert.showFWords("请选择一个正确答案!");
                this.btnOK.mouseEnabled = true;
                this.lsTabs.selectEnable = true;
                return;
            }
            this.lsTabs.array = list;
            if (isOk) {
                this._control.getAnswerReward(1, 1).then(msg => {
                    alert.showReward(msg.item, null, {
                        callBack: {
                            funArr: [
                                this.onSucc
                            ], caller: this
                        }
                    });
                });
            } else {
                this._control.getAnswerReward(1, 2).then(msg => {
                    this._outT = setTimeout(() => {
                        this.clearT();
                        this.btnOK.mouseEnabled = true;
                        this.lsTabs.selectEnable = true;
                        this.resetQuestion();//答错题目
                    }, 1000);
                });
            }
        }
        //答对题目
        private onSucc: () => void = () => {
            this.onClose(true);
        };

        private clearT(): void {
            if (this._outT) {
                clearTimeout(this._outT);
                this._outT = null;
            }
        }

        private onRender(item: ui.spacetimeDetective.item.QuestionRenderUI, index: number): void {
            const data: IQuestionVo = item.dataSource;
            item.labTab.text = `${index == 0 ? "A" : "B"}.` + this._cfg[`answer_${data.answer}`];
            if (data.select) {
                item.clipSelect.index = 1;
            } else {
                item.clipSelect.index = 0;
            }
            if (data.showResult == null) {
                item.imgResult.visible = false;
            } else {
                item.imgResult.visible = true;
                if (data.showResult) {
                    item.imgResult.skin = `spacetimeDetective/result_1.png`;
                } else {
                    item.imgResult.skin = `spacetimeDetective/result_0.png`;
                }
            }
        }

        private onSelectList(index: number): void {
            let list: IQuestionVo[] = this.lsTabs.array;
            for (let i: number = 0; i < list.length; i++) {
                if (i == index) {
                    list[i].select = true;
                } else {
                    list[i].select = false;
                }
            }
            this.lsTabs.array = list;
        }

        private onClose(isSucc: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            if (isSucc) {
                this._model.QUESTION_IDs.length = 0;
            }
            EventManager.event(SpacetimeDetectiveEventType.CLOSE_AnswerQuestionPanel, isSucc);
        }

        destroy(): void {
            this.clearT();
            this._model = this._control = null;
            this.lsTabs.renderHandler = null;
            this.lsTabs.selectHandler = null;
            this._cfg = null;
            super.destroy();
        }
    }
}