namespace springLoveSong {
    export class SpringSubmitImagePanel extends ui.springLoveSong.panel.SubmitImageUI {
        private _selfPerson: clientCore.Person;
        private _oppoPersonMale: clientCore.Person;
        private _oppoPersonFemale: clientCore.Person;
        private _cpId: number;
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.init();
        }

        init() {
            let model = clientCore.CManager.getModel(this._sign) as SpringLoveSongModel;
            this.bg.skin = model.tempBg == 1 ? "unpack/springLoveSong/pu_tong.png" : "unpack/springLoveSong/qi_miao.png";
            this._selfPerson = new clientCore.Person(clientCore.LocalInfo.sex);
            this._selfPerson.scale(PERSON_SCLAE, PERSON_SCLAE);
            this._selfPerson.upByIdArr(clientCore.LocalInfo.wearingClothIdArr);
            this.imgSelf.addChild(this._selfPerson);
            this.labName2.text = clientCore.LocalInfo.userInfo.nick;
            this._cpId = clientCore.CpManager.instance.cpID;
            let list = clientCore.FriendManager.instance.friendList;
            this.listFriend.vScrollBarSkin = null;
            this.listFriend.selectEnable = true;
            this.listFriend.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listFriend.selectHandler = new Laya.Handler(this, this.onListSelect);
            if (this._cpId) {
                let cp = _.remove(list, o => o.friendUid == this._cpId);
                list.unshift(cp[0])
            }
            if (model.friendUid) {
                let oppo = _.remove(list, o => o.friendUid == model.friendUid);
                if (oppo.length)
                    list.unshift(oppo[0])
            }
            this.listFriend.dataSource = list;
            this.listFriend.selectedIndex = model.friendUid ? 0 : -1;
            if (model.friendUid == 0 && this._cpId != 0) {
                this.listFriend.selectedIndex = 0;
                this.onListSelect(0);
            }
            this.boxFriends.visible = this.btnBack.visible = this.btnSubmit2.visible = false;
        }

        private onListRender(cell: ui.springLoveSong.render.SpringLoveSongRenderUI, idx: number) {
            let data = cell.dataSource as pb.Ifriend_t;
            cell.txtNick.text = data.userBaseInfo.nick;
            cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(data.userBaseInfo.headImage);
            cell.imgGou.alpha = idx == this.listFriend.selectedIndex ? 1 : 0;
        }

        private onListSelect(idx: number) {
            if (idx == -1) return;
            let person = this.getOppoPerson();
            let userInfo = (this.listFriend.selectedItem as pb.Ifriend_t).userBaseInfo;
            person.downAllCloth();
            person.replaceByIdArr(userInfo.curClothes);
            this.openFriendList();
            this.labName1.text = userInfo.nick;
        }

        private getOppoPerson() {
            let person: clientCore.Person;
            let sex: number = (this.listFriend.selectedItem as pb.Ifriend_t).userBaseInfo.sex;
            if (sex == 1) {
                if (!this._oppoPersonFemale) {
                    this._oppoPersonFemale = new clientCore.Person(sex);
                    this.imgOther.addChild(this._oppoPersonFemale);
                }
                if (this._oppoPersonMale)
                    this._oppoPersonMale.visible = false;
                person = this._oppoPersonFemale;
            }
            else {
                if (!this._oppoPersonMale) {
                    this._oppoPersonMale = new clientCore.Person(sex);
                    this.imgOther.addChild(this._oppoPersonMale);
                }
                if (this._oppoPersonFemale)
                    this._oppoPersonFemale.visible = false;
                person = this._oppoPersonMale;
            }
            person.visible = true;
            person.scale(-PERSON_SCLAE, PERSON_SCLAE);
            return person;
        }

        /**选择好友 */
        private openFriendList() {
            this.imgTip.scaleX = this.imgTip.scaleX * -1;
            this.boxFriends.visible = !this.boxFriends.visible;
        }

        /**更换形象 */
        private changeSelf() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('clothChange.ClothChangeModule');
        }

        /**提交 */
        private submit() {
            if (this.boxFriends.visible || this.listFriend.selectedIndex == -1) {
                alert.showFWords("请先完成设置");
                return;
            }
            this.btnBack.visible = this.btnSubmit2.visible = true;
            this.btnSubmit.visible = this.btnChange.visible = this.btnChoose.visible = this.imgTip.visible = false;
        }

        /**确认提交 */
        private sureSubmit() {
            let control = clientCore.CManager.getControl(this._sign) as SpringLoveSongControl;
            let model = clientCore.CManager.getModel(this._sign) as SpringLoveSongModel;
            let userInfo = (this.listFriend.selectedItem as pb.Ifriend_t).userBaseInfo;
            control.goShow(userInfo.userid, 1, model.tempBg, userInfo.curClothes);
            model.changeFlag = 0;
            model.friendUid = userInfo.userid;
            model.friendClothesList = userInfo.curClothes;
            model.curBg = model.tempBg;
            model.userClothesList = clientCore.LocalInfo.wearingClothIdArr;
            EventManager.event("UPDATA_SELF_PHOTO");
            clientCore.DialogMgr.ins.close(this);
            alert.showFWords('提交成功，请前往美丽湖东观赏大家的照片吧~');

        }

        /**返回修改 */
        private back() {
            this.btnBack.visible = this.btnSubmit2.visible = false;
            this.btnSubmit.visible = this.btnChange.visible = this.btnChoose.visible = this.imgTip.visible = true;
        }

        /**关闭 */
        private closePanel() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closePanel);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.back);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.changeSelf);
            BC.addEvent(this, this.btnChoose, Laya.Event.CLICK, this, this.openFriendList);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submit);
            BC.addEvent(this, this.btnSubmit2, Laya.Event.CLICK, this, this.sureSubmit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._selfPerson?.destroy();
            this._oppoPersonMale?.destroy();
            this._oppoPersonFemale?.destroy();
            super.destroy();
        }
    }
}