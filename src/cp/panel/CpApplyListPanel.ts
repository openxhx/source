namespace cp {
    export class CpApplyListPanel extends ui.cp.panel.ApplyListPanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            this.onApplyListChange();
        }

        private onApplyListChange() {
            this.list.dataSource = clientCore.CpManager.instance.applyList;
            this.boxScroll.visible = this.list.length > 5;
            this.txtNoApply.visible = this.list.length == 0;
        }

        private onListRender(cell: ui.cp.render.ApplyRenderUI, idx: number) {
            let data = cell.dataSource as pb.ICpInfo;
            let nick = data.userBase.nick
            cell.txtNick.text =  nick.length > 6 ? (nick.slice(0,6) + '...') : nick;
            cell.txtFname.text = data.userBase.familyName;
            cell.txtTime.text = util.TimeUtil.formatData(util.TimeUtil.formatSecToDate(data.applyTime));
            cell.txtnum.text = clientCore.FriendManager.instance.getFriendInfoById(data.coupleId)?.friendShip.toString();
            cell.imgRole.skin = clientCore.ItemsInfo.getItemIconUrl(data.userBase.headImage);
            cell.txtLv.text = clientCore.LocalInfo.parseLvInfoByExp(data.userBase.exp).lv.toString();
            cell.imgRing.skin = clientCore.ItemsInfo.getItemIconUrl(data.toolId);
            cell.imgSex.skin = data.userBase.sex == 1 ? 'cp/icon_woman.png' : 'cp/icon_man.png';
            cell.boxLv.visible = data.userBase.vipExp > 0;
            if (data.userBase.vipExp > 0) {
                cell.txtVipLv.value = clientCore.LocalInfo.parseVipInfoByExp(data.userBase.vipExp).lv.toString();
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx) as pb.ICpInfo
                if (e.target.name == 'imgRole') {
                    clientCore.UserInfoTip.showTips(e.target as Laya.Sprite, data.userBase);
                }
                else if (e.target.name == 'btnCheck') {
                    this.event(Laya.Event.CHANGED, data);
                }
            }
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScroll.y = this.boxScroll.y + (this.boxScroll.height - this.imgScroll.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, EventManager, globalEvent.CP_APPLY_LIST_UPDATE, this, this.onApplyListChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}