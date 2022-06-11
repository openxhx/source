namespace roleCreate {
    export class EnterNamePanel extends ui.roleCreate.enterNamePanelUI {
        private _randomNickArr: string[] = [];

        constructor() {
            super();
            this.addEventListeners();
            this.init();
        }
        public init(): void {
            this.onRandomNameClick();
        }
        public addEventListeners() {
            BC.addEvent(this, this.btnRandomName, Laya.Event.CLICK, this, this.onRandomNameClick);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSureClick);
            BC.addEvent(this, this.txtNameInput, Laya.Event.BLUR, this, this.onBlur);
        }
        private onSureClick(e: Laya.Event) {
            //不能为空
            if (this.txtNameInput.text == "") {
                alert.showFWords("角色名不能为空哦^_^");
                return;
            }
            if (!util.StringUtils.testName(this.txtNameInput.text)) {
                alert.showFWords('名字中含有不合法字符！');
                this.txtNameInput.text = '';
                return
            }

            net.sendAndWait(new pb.cs_set_user_name({ uname: this.txtNameInput.text }))
                .then((data: pb.sc_set_user_name) => {
                    if (data.result == 0) {
                        clientCore.NativeMgr.instance.tracking('reg');
                        clientCore.LocalInfo.userInfo.nick = this.txtNameInput.text;
                        this.event("close_module");
                        EventManager.event("ENTER_NAME_SUCCESS");
                    }
                })
                .catch(() => {

                });
        }
        private onRandomNameClick(e: Laya.Event = null) {
            if (this._randomNickArr.length > 0) {
                this.txtNameInput.text = this._randomNickArr.shift().slice(0, 5);
                return;
            }
            net.sendAndWait(new pb.cs_get_recommend_nick())
                .then((data: pb.sc_get_recommend_nick) => {
                    this._randomNickArr = data.nicks;
                    this.txtNameInput.text = this._randomNickArr.shift().slice(0, 5);
                })
                .catch(() => {

                });
        }

        private onBlur(): void {
        }

        public destroy() {
            BC.removeEvent(this);
        }
    }
}