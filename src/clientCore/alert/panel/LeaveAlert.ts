


namespace alert {
    /**
     * 被踢出家族的提示
     */
    export class LeaveAlert extends ui.alert.LeaveAlertUI {
        private _time: number;
        private _desc: string;
        public sideClose: boolean = false;

        constructor() {
            super();

            this.htmlTx.style.align = "center";
            this.htmlTx.style.valign = "middle";
            this.htmlTx.style.width = 414;
            this.htmlTx.style.height = 89;
            this.htmlTx.style.fontSize = 24;
            this.htmlTx.style.leading = 5;
            this.htmlTx.style.wordWrap = true;
        }

        public show(msg: pb.sc_family_member_notify): void {
            clientCore.DialogMgr.ins.open(this);
            this._time = 8;
            let posts: string[] = ["", "族长", "副族长", "长老", "精英", "族员"];
            this._desc = `你已被${posts[msg.optPost]}${msg.optNick}移出了家族`;
            if (!clientCore.MapInfo.isSelfFamily) {
                this.htmlTx.innerHTML = util.StringUtils.getColorText(this._desc, "#805329");
            } else {
                this.htmlTx.innerHTML = util.StringUtils.getColorText2([this._desc + "，将在", "#805329", this._time + "", "#d75ea8", "秒后自动退出家族地图", "#805329"]);
                Laya.timer.loop(1000, this, this.onTime);
            }
        }

        public hide(): void {
            Laya.timer.clear(this, this.onTime);
            clientCore.DialogMgr.ins.close(this);
        }

        private onTime(): void {
            if (this._time-- <= 0) {
                this.onSure();
                return;
            }
            this.htmlTx.innerHTML = util.StringUtils.getColorText2([this._desc + "，将在", "#805329", this._time + "", "#d75ea8", "秒后自动退出家族地图", "#805329"]);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onSure(): void {
            this.hide();
            clientCore.FamilyMgr.ins.leaveFamily();
        }
    }
}