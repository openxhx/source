namespace schoolTeachersDay {
    export class EmergencyPanel extends ui.schoolTeachersDay.panel.EmergencyPanelUI {
        private _subjectData: xls.miniAnswer;

        private _rewardItems: any[];

        private _onCloseFun: Function;

        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any) {
            this._subjectData = data.subject;
            this._onCloseFun = data.onCloseFun;
            this._rewardItems = [];
        }

        initOver() {
            let model = clientCore.CManager.getModel(this._sign) as SchoolTeachersDayModel;

            this.listAnswer.renderHandler = new Laya.Handler(this, this.onTaskRender);
            this.listAnswer.mouseHandler = new Laya.Handler(this, this.onTaskMouse);
            this.listAnswer.dataSource = [this._subjectData.answer_1, this._subjectData.answer_2];
            this.listAnswer.selectedIndex = 0;

            this.labContent.text = this._subjectData.content;
            this.labNumber.text = '本日第（' + (model.answerTimes + 1) + '/' + model.answerNumMax + '）题';

            this.listAnswer.mouseEnabled = true;
            this.btnSubmit.disabled = false;

            for (let i = 0; i < 2; i++) {
                let item: any = this.listAnswer.getCell(i);
                item.imgCuo.visible = false;
                item.imgDui.visible = false;
            }

            this.onSelect(this.listAnswer.selectedIndex);
        }

        private onSelect(index: number): void {
            for (let i = 0; i < 2; i++) {
                if (i == index) {
                    this.listAnswer.getCell(i)["imgBg"].skin = "schoolTeachersDay/xuan_zhong_zhuang_tai.png";
                } else {
                    this.listAnswer.getCell(i)["imgBg"].skin = "schoolTeachersDay/wei_xuan_zhong_zhuang_tai.png";
                }
            }
            this.listAnswer.selectedIndex = index;
        }

        private onTaskRender(cell: ui.schoolTeachersDay.render.EmergencyRenderUI, idx: number) {
            cell.labContent.text = cell.dataSource;
            cell.imgDui.visible = false;
            cell.imgCuo.visible = false;
        }

        private onTaskMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this.onSelect(idx);
            }
        }

        private onSubmit(): void {
            this.listAnswer.mouseEnabled = false;
            this.btnSubmit.disabled = true;

            let control = clientCore.CManager.getControl(this._sign) as SchoolTeachersDayControl;
            control.answer(this.listAnswer.selectedIndex + 1, Laya.Handler.create(this, (msg: pb.sc_teachers_day_answer) => {
                let model = clientCore.CManager.getModel(this._sign) as SchoolTeachersDayModel;
                model.answerTimes++;

                for (let i = 0; i < 2; i++) {
                    let item: any = this.listAnswer.getCell(i);
                    if (i + 1 == this._subjectData.rightAnswer) {
                        item.imgDui.visible = true;
                    } else {
                        item.imgCuo.visible = true;
                    }
                }

                Laya.timer.once(500, this, () => {
                    this._rewardItems = msg.items;
                    if (this._rewardItems.length > 0) {
                        this._onCloseFun({ rewardItems: this._rewardItems });
                    }
                });
            }));
        }

        close() {
            if (this._rewardItems.length > 0) {
                this._onCloseFun({ rewardItems: this._rewardItems });
            }
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._subjectData = null;
            this._rewardItems = [];
            this._onCloseFun = null;
            super.destroy();
        }
    }
}