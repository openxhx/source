namespace fairyAnswer {
    /**
     * 中秋三仙女答题
     * fairyAnswer.FairyAnswerModule
     */
    export class FairyAnswerModule extends ui.fairyAnswer.FairyAnswerModuleUI {
        private _rightCnt: number = 0;
        private _fairy: number;
        private _curQuestion: number;
        private _minId: number;
        private _maxId: number;
        init(data) {
            this._fairy = data;
            this.imgFairy.skin = `fairyAnswer/fairy${data}.png`;
            this.imgRight.visible = this.imgCuo.visible = false;
            this.addPreLoad(net.sendAndWait(new pb.cs_three_fairy_gifts_info()).then((msg: pb.sc_three_fairy_gifts_info) => {
                this._rightCnt = msg.answerTime;
            }))
            this.addPreLoad(xls.load(xls.miniAnswer));
        }

        onPreloadOver() {
            if (this._fairy == 1) {
                this._minId = 156;
                this._maxId = 175;
            } else if (this._fairy == 2) {
                this._minId = 176;
                this._maxId = 195;
            } else if (this._fairy == 3) {
                this._minId = 196;
                this._maxId = 215;
            }
            this._curQuestion = this._minId + this._rightCnt;
            this.ShowQuestionInfo();
            this.labRightCnt.text = '' + this._rightCnt;
        }

        private answer(idx: number) {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_mini_answer({ activity: 190, id: this._curQuestion, chose: idx })).then((msg: pb.sc_mini_answer) => {
                if (msg.tf == 1) {
                    this._rightCnt++;
                    this.labRightCnt.text = "" + this._rightCnt;
                    this.imgRight.y = this['btnAnswer' + idx].y - 13;
                    this.imgRight.visible = true;
                    if (this._rightCnt >= 10) {
                        EventManager.event('FAIRY_ANSWER_OVER');
                        alert.showReward(msg.item, '', {
                            callBack: {
                                caller: this, funArr: [() => {
                                    this.mouseEnabled = true;
                                    this.destroy();
                                }]
                            }
                        })
                        return;
                    }
                } else {
                    this.imgCuo.y = this['btnAnswer' + idx].y;
                    this.imgCuo.visible = true;
                }
                this.ShowNextQuestion();
            }).catch(() => {
                EventManager.event('FAIRY_ANSWER_OVER');
                this.mouseEnabled = true;
                this.destroy();
            })
        }

        private async ShowNextQuestion() {
            await util.TimeUtil.awaitTime(2000);
            this.imgRight.visible = this.imgCuo.visible = false;
            this._curQuestion++;
            if (this._curQuestion > this._maxId) this._curQuestion = this._minId;
            this.ShowQuestionInfo();
            this.mouseEnabled = true;
        }

        private ShowQuestionInfo() {
            let config = xls.get(xls.miniAnswer).get(this._curQuestion);
            this.labQuestion.text = config.content;
            for (let i = 1; i <= 3; i++) {
                this['labAnswer' + i].text = config['answer_' + i];
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            for (let i = 1; i <= 3; i++) {
                BC.addEvent(this, this['btnAnswer' + i], Laya.Event.CLICK, this, this.answer, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}