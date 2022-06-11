namespace cp {
    export class CpSendListPanel extends ui.cp.panel.SendListPanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            let list = clientCore.FriendManager.instance.friendList;
            let limitFriendShip = xls.get(xls.cpCommonDate).get(1).limit
            list = _.filter(list, o => o.friendShip >= limitFriendShip);
            list = list.sort((b, a) => {
                let aLv = clientCore.LocalInfo.parseLvInfoByExp(a.userBaseInfo.exp).lv;
                let bLv = clientCore.LocalInfo.parseLvInfoByExp(b.userBaseInfo.exp).lv;
                if (a.friendShip != b.friendShip) {
                    return a.friendShip - b.friendShip
                }
                else if (aLv != bLv) {
                    return aLv - bLv;
                }
            })
            this.list.dataSource = list;
            this.boxScroll.visible = this.list.length > 5;
            this.txtNo.visible = list.length == 0;
        }

        private onListRender(cell: ui.cp.render.SendRenderUI, idx: number) {
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
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx) as pb.Ifriend_t
                if (e.target.name == 'imgRole') {
                    clientCore.UserInfoTip.showTips(e.target as Laya.Sprite, data.userBaseInfo);
                }
                else if (e.target.name == 'btnCp') {
                    this.event(Laya.Event.START, data.friendUid);
                    clientCore.DialogMgr.ins.close(this);
                }
            }
        }

        private onClose() {
            this.event(Laya.Event.END);
            clientCore.DialogMgr.ins.close(this);
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScroll.y = this.boxScroll.y + (this.boxScroll.height - this.imgScroll.height) * scroll.value / scroll.max;
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