namespace schoolTime {
    export class QuizPanel extends ui.schoolTime.panel.QuizPanelUI {
        private _sign: number;
        private allQuestion: xls.miniAnswer[];
        private curQuestion: xls.miniAnswer;
        private curAnswer: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        popupOver() {
            this.allQuestion = _.filter(xls.get(xls.miniAnswer).getValues(), (o) => { return o.activityId == 161 });
            this.setQuestion();
        }

        private setQuestion() {
            let model = clientCore.CManager.getModel(this._sign) as SchoolTimeModel;
            this.labCur.text = "今日考题:" + (model.quizCnt + 1) + "/5";
            let idx = Math.floor(Math.random() * this.allQuestion.length);
            this.curQuestion = this.allQuestion.splice(idx, 1)[0];
            this.labQuestion.text = "Q:" + this.curQuestion.content;
            this.labAnswer1.text = "A." + this.curQuestion.answer_1;
            this.labAnswer2.text = "B." + this.curQuestion.answer_2;
            this.imgDui.visible = this.imgCuo.visible = false;
            this.setAnswer(1);
            this.btnAnswer.disabled = false;
        }

        private setAnswer(idx: number) {
            this.curAnswer = idx;
            this.labAnswer1.color = idx == 1 ? '#ff676f' : '#ffffff';
            this.labAnswer2.color = idx == 2 ? '#ff676f' : '#ffffff';
            this.diAnswer.y = this["labAnswer" + idx].y - 12;
        }

        private submitAnswer() {
            this.btnAnswer.disabled = true;
            let isRight = this.curAnswer == this.curQuestion.rightAnswer ? 1 : 0;
            if (this.curAnswer == this.curQuestion.rightAnswer) {
                this.imgDui.visible = true;
                this.imgDui.y = this["labAnswer" + this.curAnswer].y - 50;
            } else {
                this.imgCuo.visible = true;
                this.imgCuo.y = this["labAnswer" + this.curAnswer].y - 20;
            }
            net.sendAndWait(new pb.cs_finish_school_times_answer({ flag: isRight })).then(async (msg: pb.sc_finish_school_times_answer) => {
                if(msg.item.length <= 0){
                    alert.showFWords('该学分已满！');
                    return;
                }
                alert.showReward(msg.item);
                let model = clientCore.CManager.getModel(this._sign) as SchoolTimeModel;
                model.allCoin += msg.item[0].cnt;
                EventManager.event('SCHOOL_TIME_SET_COIN', msg.item[0].id - 9900186);
                model.quizCnt = msg.answernum;
                await util.TimeUtil.awaitTime(1500);
                if (model.quizCnt >= 5) {
                    this.close();
                } else {
                    this.setQuestion();
                }
            });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.labAnswer1, Laya.Event.CLICK, this, this.setAnswer, [1]);
            BC.addEvent(this, this.labAnswer2, Laya.Event.CLICK, this, this.setAnswer, [2]);
            BC.addEvent(this, this.btnAnswer, Laya.Event.CLICK, this, this.submitAnswer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}