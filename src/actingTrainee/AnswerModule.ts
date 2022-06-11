namespace actingTrainee {
    /**
     * 2020.9.14
     * 演剧练习生-答题界面
     * actingTrainee.AnswerModule
     */
    export class AnswerModule extends ui.actingTrainee.AnswerModuleUI {
        private _answerTimes: number = 0;       //答题次数
        private _answerTime: number = 0;        //答题计时
        private _answerTimeMax: number = 60;    //答题时长

        private _subjectList: xls.miniAnswer[]; //题目数据
        private _answerList: any[] = null;      //答案数据

        private _model: ActingTraineeModel;
        private _control: ActingTraineeControl;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new ActingTraineeModel(), new ActingTraineeControl());
            this._control = clientCore.CManager.getControl(this.sign) as ActingTraineeControl;
            this._model = clientCore.CManager.getModel(this.sign) as ActingTraineeModel;

            this._answerList = [];

            this.addPreLoad(xls.load(xls.miniAnswer));
        }

        async onPreloadOver() {
            await this._control.getInfo();

            let subjectData = this._model.getSubjectList();
            this._subjectList = subjectData.data;

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;
            this.imgTitle.skin = "actingTrainee/biao_ti" + (subjectData.index + 1) + ".png";
            this.imgName1.skin = "actingTrainee/ming_zi_" + (subjectData.index + 1) + "_1.png";
            this.imgName2.skin = "actingTrainee/ming_zi_" + (subjectData.index + 1) + "_2.png";

            this.listAnswer.renderHandler = new Laya.Handler(this, this.onTaskRender);
            this.listAnswer.mouseHandler = new Laya.Handler(this, this.onTaskMouse);

            this.updateView();

            this._answerTime = this._answerTimeMax;
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
        }

        private updateView() {
            let info = this._subjectList[this._answerTimes];
            this.labContent.text = info.content;
            this.listAnswer.dataSource = [info.answer_1, info.answer_2, info.answer_3, info.answer_4];
            this.listAnswer.mouseEnabled = true;

            for (let i = 0; i < 4; i++) {
                let item: any = this.listAnswer.getCell(i);
                item.imgDui.visible = false;
                item.imgCuo.visible = false;
                item.imgBg.skin = "actingTrainee/wei_xuan_zhong_zhuang_tai.png";
                this.labTaici.text = "";
            }

            this.listAnswer.selectedIndex = -1;
        }

        private answerOver(): void {
            this.listAnswer.mouseEnabled = false;

            let questionIdList = [];
            let answerIdList = [];
            for (let i = 0; i < this._answerList.length; i++) {
                questionIdList.push(this._answerList[i].questionId);
                answerIdList.push(this._answerList[i].answerId);
            }

            this._control.answer(questionIdList, answerIdList, Laya.Handler.create(this, (msg: pb.sc_drama_actor_start_answer) => {
                this.close();
                alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
            }))
        }

        private onTimer() {
            this._answerTime--;
            this.labTime.text = util.StringUtils.getDateStr2(this._answerTime, '{min}:{sec}');
            if (this._answerTime <= 0) {
                this.answerOver();
                this._model.answerTimes++;
                this._model.updateBuyTimes();
            }
        }

        private onSelect(index: number): void {
            for (let i = 0; i < 4; i++) {
                this.listAnswer.getCell(i)["imgBg"].skin = i == index ? "actingTrainee/xuan_zhong_zhuang_tai.png" : "actingTrainee/wei_xuan_zhong_zhuang_tai.png";
            }
            this.listAnswer.selectedIndex = index;
            this.labTaici.text = this.listAnswer.dataSource[index];
        }

        private onTaskRender(cell: ui.actingTrainee.render.EmergencyRenderUI, idx: number) {
            cell.labContent.text = cell.dataSource;
        }

        private onTaskMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this.onSelect(idx);
                this.onSubmit(idx);
            }
        }

        private onSubmit(index: number): void {
            this.listAnswer.mouseEnabled = false;

            let info = this._subjectList[this._answerTimes];
            this._answerTimes++;
            this._answerList.push({ questionId: info.id, answerId: index + 1 });
            let item: any = this.listAnswer.getCell(index);
            if (index + 1 == info.rightAnswer) {
                item.imgDui.visible = true;
                let aniBtnDati: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/actingTrainee/juben_qipao.sk", 0, false, this.boxAni as Laya.Sprite);
                aniBtnDati.pos(40, 50);
            } else {
                item.imgCuo.visible = true;
                let aniBtnDati: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/actingTrainee/juben_qipao.sk", 1, false, this.boxAni as Laya.Sprite);
                aniBtnDati.pos(0, 50);
            }


            Laya.timer.once(1000, this, () => {
                if (this._answerTimes < this._model.subject_zu_num) {
                    this.updateView();
                } else {
                    this.answerOver();
                }
            });
        }

        close() {
            this.destroy();
            clientCore.ModuleManager.open("actingTrainee.ActingTraineeModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.answerOver);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._answerTimes = 0;
            this._subjectList = [];
            this._answerList = [];
            Laya.timer.clear(this, this.onTimer);
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}