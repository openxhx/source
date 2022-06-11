namespace collection {
    import CollectManager = clientCore.CollectManager;
    export class CoEventRecordPanel implements ICollectionPanel {
        ui: ui.collection.panel.WeekRecordPanelUI;
        private _showIdx: number;
        private _txtArr: string[];
        constructor() {
            this.ui = new ui.collection.panel.WeekRecordPanelUI();
            this.addEvent();
            this.ui.imgBg.scrollRect = new Laya.Rectangle(this.ui.box.x, this.ui.box.y, this.ui.box.width, this.ui.box.height);
            this.ui.btnNext.visible = false;

            for (let i = 0; i < 3; i++) {
                let txt = this.ui['txt_' + i] as Laya.HTMLDivElement;
                txt.style.fontSize = 24;
                txt.style.wordWrap = false;
            }
        }

        waitLoad() {
            return Promise.resolve();
        }

        async show(data: any) {
            this._showIdx = 0;
            this.ui.imgBg.scrollRect.y = 0;
            this.ui.btnNext.visible = true;
            this._txtArr = [];
            let showData: pb.IReportInfo[];
            if (data) {
                //按月份获取记录
            }
            else {
                //无参数 就是周报
                showData = CollectManager.instance.getWeekRecord();
            }
            showData = [];
            for (let i = 0; i < 9; i++) {
                showData.push({ id: i + 1, data: "{}" });
            }

            for (const o of showData) {
                let xlsStr = xls.get(xls.collectWeekly).get(o.id).weeklyContent;
                let replaceObj = JSON.parse(o.data);
                let strArr = xlsStr.split('#');
                let finalStr = '';
                for (const s of strArr) {
                    if (replaceObj.hasOwnProperty(s))
                        finalStr += util.StringUtils.getColorText(s, '#fffa7b');
                    else
                        finalStr += util.StringUtils.getColorText(s, '#ffffff');
                }
                this._txtArr.push(finalStr);
            }
            //开始动画
            this.startAni();
        }

        private startAni() {
            Laya.Tween.to(this.ui.imgBg.scrollRect, { y: this.ui.imgBg.height * this._showIdx / 9 }, 400);
            for (let i = this._showIdx; i < this._txtArr.length && i < (this._showIdx + 3); i++) {
                this.ui['txt_' + i % 3].innerHTML = this._txtArr[i];
            }
            this._showIdx += 3;
            this.ui.ani1.play(0, false);
            this.ui.btnNext.visible = this._showIdx <= 6;

        }

        private onNext() {
            if (this._showIdx != 5) {
                this.startAni();
            }
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.btnNext, Laya.Event.CLICK, this, this.onNext);
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        private onClose() {
            // EventManager.event(EV_CHAGE_PANEL, PANEL.EVENT);
        }

        destory() {
            this.removeEvent();
        }
    }
}