namespace mentor {
    export class MentorGraducatePanel extends ui.mentor.panel.MentorGraducatePanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            // this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            this.updateList();
            clientCore.Logger.sendLog('活动', '导师计划', '打开学生簿面板')
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private updateList() {
            if (this.list) {
                this.list.dataSource = clientCore.MentorManager.history.getGraduationList();
                this.list.scrollTo(0);
            }
        }

        private _reqing: boolean = false;
        /**刷新一下学生的人物信息(有个flg防止同时多次刷新) */
        private reqStudentUserInfo() {
            if (this._reqing)
                return;
            this._reqing = true;
            let studenIds = _.map(clientCore.MentorManager.history.getGraduationList(), o => o.otherId);
            clientCore.UserInfoDataBase.reqUserInfo(studenIds).then(() => {
                this._reqing = false;
                //列表刷新下
                this.list.startIndex = this.list.startIndex;
            })
        }

        private onListRender(cell: ui.mentor.render.MentorApplyRenderUI, idx: number) {
            let data = cell.dataSource as pb.ITeacher;
            cell.txtInfo.visible = true;
            cell.btnDel.visible = cell.btnOk.visible = false;
            if (clientCore.UserInfoDataBase.checkHaveUId(data.otherId)) {
                let userInfo = clientCore.UserInfoDataBase.getUserInfo(data.otherId);
                cell.txtNick.text = userInfo.nick;
                cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(userInfo.headImage);
                cell.txtLv.text = clientCore.LocalInfo.parseLvInfoByExp(userInfo.exp).lv.toString();
                let time = util.TimeUtil.formatSecToDate(data.gradTime);
                cell.txtInfo.text = `于${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日毕业`;
            }
            else {
                Laya.timer.callLater(this, this.reqStudentUserInfo);
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
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