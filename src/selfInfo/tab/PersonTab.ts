namespace selfInfo {
    export class PersonTab implements IselfInfoTabModule {
        public tab: number;
        private _mainUI: ui.selfInfo.tab.personTabUI;
        private _model: SelfInfoModel;
        private _valueUI: ValuePanel;
        private _userBaseInfo: pb.IUserBase;
        private _changeName: ChangeNamePanel;
        constructor(ui: ui.selfInfo.tab.personTabUI, sign: number) {
            this._mainUI = ui;
            this._model = clientCore.CManager.getModel(sign) as SelfInfoModel;
            this._userBaseInfo = this._model.userBaseInfo;
            this.initTab();
            this.addEventListeners();
        }

        initTab() {
            this._mainUI.txtNick.text = this._userBaseInfo.nick;
            this._mainUI.txtLv.text = clientCore.LocalInfo.parseLvInfoByExp(this._userBaseInfo.exp).lv.toString();
            this._mainUI.txtId.text = this._userBaseInfo.userid.toString();
            this._mainUI.txtAchievimentNum.text = this._userBaseInfo.achievement.toString();
            let expInfo = clientCore.LocalInfo.parseLvInfoByExp(this._userBaseInfo.exp);
            Laya.timer.frameLoop(1, this, this.onFrame);
            this._mainUI.txtExp.text = "" + expInfo.currExp + "/" + (expInfo.nextLvNeed + expInfo.currExp);
            this._mainUI.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._userBaseInfo.headImage);;
            this._mainUI.imgFrame.skin = clientCore.ItemsInfo.getItemIconUrl(this._userBaseInfo.headFrame);

            this._mainUI.list.itemRender = ValueRender;
            this._mainUI.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this._mainUI.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
            this._mainUI.txtFamilyName.text = this._userBaseInfo.familyName != "" ? this._userBaseInfo.familyName : '还没有加入家族';

            this._mainUI.btnHomeHot.visible = false;
            // this._mainUI.btnHomeHot.visible = this._userBaseInfo.userid == clientCore.LocalInfo.uid;
            this._mainUI.btnAchievement.visible = this._userBaseInfo.userid == clientCore.LocalInfo.uid;
            this._mainUI.btnVisit.visible = this._userBaseInfo.userid != clientCore.LocalInfo.uid;

            this._mainUI.txPraise.changeText(this._userBaseInfo.likes+'');
            this._mainUI.txtServerInfo.text = "当前所在服务器：" + clientCore.GlobalConfig.serverShowName;
            this._mainUI.txtServerInfo.visible = this._userBaseInfo.userid == clientCore.LocalInfo.uid;

            this.updateTitle();
            this._mainUI.btnReport.visible = this._userBaseInfo.userid != clientCore.LocalInfo.uid;
            this._mainUI.imgTitle.visible = this._userBaseInfo.userid == clientCore.LocalInfo.uid;
            this._mainUI.imgChangeNick.visible = this._userBaseInfo.userid == clientCore.LocalInfo.uid;
        }

        private onFrame() {
            let expInfo = clientCore.LocalInfo.parseLvInfoByExp(this._userBaseInfo.exp);
            this._mainUI.imgProMask.x = (expInfo.expPercent - 1) * this._mainUI.imgPro.width;
        }

        // private updateTitle(): void {
        //     let titleId: number = clientCore.TitleManager.ins.titleId;
        //     let data: xls.title = xls.get(xls.title).get(titleId);
        //     this._mainUI.txTitle.changeText(data ? data.titleName : "暂无称号");
        //     this.updateTitleRed();
        // }
        private updateTitle(): void {

            if (this._userBaseInfo.userid == clientCore.LocalInfo.uid) {
                this._userBaseInfo.isHideTitle = clientCore.LocalInfo.showTitle ? 0 : 1;
            }

            if (this._userBaseInfo.isHideTitle != 0) {
                this._mainUI.titleRed.visible = false;
                this._mainUI.txTitle.changeText('暂无称号');
                return;
            }

            let titleId: number, data: xls.title;
            if (this._userBaseInfo.userid != clientCore.LocalInfo.uid) {
                this._mainUI.titleRed.visible = false;
                titleId = this._userBaseInfo.title;
                if (titleId) {
                    data = xls.get(xls.title).get(titleId);
                    if (data && (data.limitTime == 0 || clientCore.ServerManager.curServerTime < this._userBaseInfo.titleEndTime)) {
                        this._mainUI.txTitle.changeText(data.titleName);
                        return;
                    }
                }
                this._mainUI.txTitle.changeText('暂无称号');
            } else {
                titleId = clientCore.TitleManager.ins.titleId;
                data = xls.get(xls.title).get(titleId);
                this._mainUI.txTitle.changeText(data ? data.titleName : "暂无称号");
                this.updateTitleRed();
            }
        }

        private updateTitleRed(): void {
            this._mainUI.titleRed.visible = clientCore.LocalInfo.showTitle && clientCore.TitleManager.ins.checkAllRed();
        }

        private onOpenHead() {
            if (this._userBaseInfo.userid != clientCore.LocalInfo.uid) {
                return;
            }
            clientCore.ModuleManager.closeModuleByName('selfInfo');
            clientCore.ModuleManager.open('chooseHead.ChooseHeadModule');
        }

        addEventListeners() {
            BC.addEvent(this, this._mainUI.imgTitle, Laya.Event.CLICK, this, this.onTitle);
            BC.addEvent(this, this._mainUI.imgChangeNick, Laya.Event.CLICK, this, this.onChangeNick);
            BC.addEvent(this, this._mainUI, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this._mainUI.btnAchievement, Laya.Event.CLICK, this, this.showAchieviment);
            BC.addEvent(this, Laya.stage, Laya.Event.CLICK, this, this.onStageClick);
            BC.addEvent(this, this._mainUI.imgHead, Laya.Event.CLICK, this, this.onOpenHead);
            BC.addEvent(this, this._mainUI.btnHomeHot, Laya.Event.CLICK, this, this.onHomeHotClick);
            BC.addEvent(this, this._mainUI.btnVisit, Laya.Event.CLICK, this, this.onVisitClick);
            BC.addEvent(this, this._mainUI.btnVisit, Laya.Event.CLICK, this, this.onVisitClick);
            BC.addEvent(this, EventManager, globalEvent.CHANGE_USER_NICK, this, this.onNick);
            BC.addEvent(this, EventManager, globalEvent.TITLE_CHANGE, this, this.updateTitle);
            BC.addEvent(this, this._mainUI.btnReport, Laya.Event.CLICK, this, this.onReportClick);
            BC.addEvent(this, EventManager, "title_red_change", this, this.updateTitleRed);
            BC.addEvent(this, EventManager, "title_visible", this, this.updateTitle);
        }
        onReportClick(e: Laya.Event) {
            clientCore.ModuleManager.open("report.ReportModule", { id: this._userBaseInfo.userid, content: "" });
        }
        onClick(e: Laya.Event) {
            if (this._mainUI.txtNick.editable) {
                if (e.target != this._mainUI.txtNick && e.target != this._mainUI.imgChangeNick) {
                    this.reset();
                }
            }
        }

        private onStageClick(e: Laya.Event) {
            if (!(e.target instanceof ValueRender))
                if (this._valueUI && this._valueUI.parent) {
                    this._valueUI.removeSelf();
                }
        }

        private onTitle(): void {
            clientCore.ModuleManager.open("title.TitleModule");
        }

        private onVisitClick() {
            clientCore.ModuleManager.closeModuleByName('selfInfo');
            clientCore.MapManager.enterHome(this._userBaseInfo.userid);
        }

        private onHomeHotClick() {
            return;
            clientCore.ModuleManager.closeModuleByName('selfInfo');
            clientCore.ModuleManager.open("friendHomeMsg.FriendHomeMsgModule");
        }

        private showAchieviment() {
            clientCore.ModuleManager.closeModuleByName('selfInfo');
            clientCore.ModuleManager.open('collection.CollectionModule')
        }

        private onNick(): void {
            this._userBaseInfo.nick = clientCore.LocalInfo.userInfo.nick;
            this._mainUI.txtNick.changeText(this._userBaseInfo.nick);
        }

        onChangeNick() {
            this._changeName = this._changeName || new ChangeNamePanel();
            this._changeName.show();
            // if (this._userBaseInfo.userid != clientCore.LocalInfo.uid) {
            //     return;
            // }
            // if (this._mainUI.txtNick.text == "" && this._mainUI.txtNick.editable) {
            //     alert.showFWords("角色名不能为空哦^_^");
            //     return;
            // }
            // this._mainUI.txtNick.editable = !this._mainUI.txtNick.editable;
            // this._mainUI.txtNick.focus = this._mainUI.txtNick.editable;
            // if (!this._mainUI.txtNick.editable) {
            //     net.sendAndWait(new pb.cs_set_user_name({ uname: this._mainUI.txtNick.text })).then(() => {
            //         clientCore.LocalInfo.userInfo.nick = this._mainUI.txtNick.text;
            //         clientCore.PeopleManager.getInstance().player.updateName(this._mainUI.txtNick.text);
            //         alert.showFWords('改名成功！');
            //         EventManager.event(globalEvent.CHANGE_USER_NICK);
            //     }).catch(e => {
            //         this.reset();
            //     });
            // }
            // else {
            //     alert.showFWords('输入想要修改的名字吧');
            // }
        }

        private listRender(item: ValueRender, index: number): void {
            item.setInfo(item.dataSource, this._userBaseInfo);
        }

        private listMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            this._valueUI = this._valueUI || new ValuePanel();
            this._valueUI.show(this._mainUI.list.getItem(index) as string, this._mainUI.list.getCell(index)['pointInfo']);
            this._valueUI.pos(this._mainUI.mouseX, this._mainUI.mouseY);
            this._mainUI.addChild(this._valueUI);
        }

        private reset() {
            this._mainUI.txtNick.text = clientCore.LocalInfo.userInfo.nick;
            this._mainUI.txtNick.editable = false;
            this._mainUI.txtNick.focus = false;
        }

        show<T>(param?: T) {
            this._mainUI.visible = true;
            this._mainUI.list.array = ['love', 'wisdom', 'beauty'];
            typeof param == "number" && param == 1 && this.onChangeNick();
        }

        hide() {
            this._mainUI.visible = false;
        }

        destroy() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onFrame)
            this._valueUI?.destroy();
            this._valueUI = null;
            this._changeName = null;
        }
    }
}