namespace mentor {
    export class MentorApplyPanel extends ui.mentor.panel.MentorApplyPanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            if (clientCore.MentorManager.identity == clientCore.MENTOR_IDENTITY.NONE) {
                this.imgTitle.skin = clientCore.MentorConst.checkCanStudentByLv() ? 'mentor/applyTitle.png' : 'mentor/applyTitle1.png';
            }
            else {
                this.imgTitle.skin = clientCore.MentorManager.identity == clientCore.MENTOR_IDENTITY.TEACHER ? 'mentor/applyTitle.png' : 'mentor/applyTitle1.png'
            }
            this.updateList();
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private updateList() {
            if (this.list) {
                this.list.dataSource = clientCore.MentorManager.history.getApplyList();
                this.list.scrollTo(0);
            }
        }

        private _reqing: boolean = false;
        /**刷新一下学生的人物信息(有个flg防止同时多次刷新) */
        private reqStudentUserInfo() {
            if (this._reqing)
                return;
            this._reqing = true;
            let studenIds = _.map(clientCore.MentorManager.history.getApplyList(), o => o.otherId);
            clientCore.UserInfoDataBase.reqUserInfo(studenIds).then(() => {
                this._reqing = false;
                //列表刷新下
                this.list.startIndex = this.list.startIndex;
            })
        }

        private onListRender(cell: ui.mentor.render.MentorApplyRenderUI, idx: number) {
            let data = cell.dataSource as pb.ITeacher;
            if (clientCore.UserInfoDataBase.checkHaveUId(data.otherId)) {
                let userInfo = clientCore.UserInfoDataBase.getUserInfo(data.otherId);
                cell.txtNick.text = userInfo.nick;
                cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(userInfo.headImage);
                cell.txtLv.text = clientCore.LocalInfo.parseLvInfoByExp(userInfo.exp).lv.toString();
            }
            else {
                Laya.timer.callLater(this, this.reqStudentUserInfo);
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = e.currentTarget['dataSource'] as pb.ITeacher;
                //不同意，刷新列表
                if (e.target.name == 'btnDel') {
                    clientCore.MentorManager.history.replyApply(data.otherId, false).then(() => {
                        this.updateList();
                    })
                }
                //同意了，关闭面板上层面板刷新UI
                else if (e.target.name == 'btnOk') {
                    clientCore.MentorManager.history.replyApply(data.otherId, true).then(() => {
                        this.onClose();
                    })
                }
                else if (e.target.name == 'imgHead') {
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open("selfInfo.SelfInfoModule", { uid: data.otherId }, { openWhenClose: 'mentor.MentorTeacherModule' });
                }
            }
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScrollBar.y = this.imgScrollBg.y + (this.imgScrollBg.height - this.imgScrollBar.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}