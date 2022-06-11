namespace wedding {
    export class WeddingFriendPanel extends ui.wedding.panel.WeddengFriendPanelUI {
        private _selectIds: util.HashMap<boolean>;
        private readonly MAX_INVITE: number;
        constructor() {
            super();
            this.drawCallOptimize = true;
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.MAX_INVITE = xls.get(xls.cpCommonDate).get(1).weddingInvite;
        }

        show() {
            this._selectIds = new util.HashMap();
            this.txtNum.text = `${this._selectIds.length}/${this.MAX_INVITE}`;
            clientCore.DialogMgr.ins.open(this);
            let list = clientCore.FriendManager.instance.friendList;
            let cpId = clientCore.CpManager.instance.cpID;
            this.list.dataSource = _.filter(list, o => o.friendUid != cpId).sort((b, a) => {
                let aLv = clientCore.LocalInfo.parseLvInfoByExp(a.userBaseInfo.exp).lv;
                let bLv = clientCore.LocalInfo.parseLvInfoByExp(b.userBaseInfo.exp).lv;
                if (a.friendShip != b.friendShip) {
                    return a.friendShip - b.friendShip
                }
                else if (aLv != bLv) {
                    return aLv - bLv;
                }
            })
            this.boxScroll.visible = this.list.length > 5;
            this.btnSend.disabled = true;
            this.onScroll();
        }

        private onListRender(cell: ui.wedding.render.WeddingFriendRenderUI, idx: number) {
            let data = cell.dataSource as pb.Ifriend_t;
            cell.txtNick.text = data.userBaseInfo.nick;
            cell.txtFname.text = data.userBaseInfo.familyName;
            cell.txtnum.text = data.friendShip.toString();
            cell.imgRole.skin = clientCore.ItemsInfo.getItemIconUrl(data.userBaseInfo.headImage);
            cell.txtLv.text = clientCore.LocalInfo.parseLvInfoByExp(data.userBaseInfo.exp).lv.toString();
            cell.imgSex.skin = data.userBaseInfo.sex == 1 ? 'cp/icon_woman.png' : 'cp/icon_man.png';
            let vipLv = clientCore.LocalInfo.parseVipInfoByExp(data.userBaseInfo.vipExp).lv;
            cell.boxLv.visible = vipLv > 0;
            if (vipLv > 0) {
                cell.txtVipLv.value = vipLv.toString();
            }
            cell.imgSelect.visible = this._selectIds.has(data.friendUid);
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScrollBar.y = (this.boxScroll.height - this.imgScrollBar.height) * scroll.value / scroll.max;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let uid = (this.list.getItem(idx) as pb.Ifriend_t).friendUid;
                if (this._selectIds.has(uid)) {
                    this._selectIds.remove(uid)
                }
                else {
                    if (this._selectIds.length < this.MAX_INVITE)
                        this._selectIds.add(uid, true);
                    else
                        alert.showFWords(`最多给${this.MAX_INVITE}个好友发送邀请函`);
                }
                this.btnSend.disabled = this._selectIds.length == 0;
                this.list.startIndex = this.list.startIndex;
                this.txtNum.text = `${this._selectIds.length}/${this.MAX_INVITE}`;
            }
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onSend() {
            alert.showSmall(`是否确认向选中的好友发送邀请函，只可进行一次群发`, {
                callBack: {
                    caller: this,
                    funArr: [
                        this.sendInvite
                    ]
                }
            })
        }

        private sendInvite() {
            net.sendAndWait(new pb.cs_send_cp_wedding_invitation({ userIds: this._selectIds.getKeys().map(s => parseInt(s)) })).then(() => {
                this.event(Laya.Event.COMPLETE);
                clientCore.CpManager.instance.selfWeddingInfo.invite = 1;
                clientCore.DialogMgr.ins.close(this);
                alert.showFWords('邀请函发送成功');
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onSend);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}