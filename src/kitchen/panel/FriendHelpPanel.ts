namespace kitchen {
    export class FriendHelpPanel extends ui.kitchen.panel.FriendHelpPanelUI {
        private canUseFriend: pb.Ifriend_t[];
        private _model: KitchenModel;
        constructor(sign: number) {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this._model = clientCore.CManager.getModel(sign) as KitchenModel;
        }

        show() {
            this.canUseFriend = _.filter(clientCore.FriendManager.instance.friendList, (o) => { return o.userBaseInfo.helpCooking == 0 });
            this.list.array = this.canUseFriend;
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.kitchen.render.FriendRenderUI, idx: number) {
            let value: pb.Ifriend_t = item.dataSource;
            let userBase = value.userBaseInfo;
            let t = item;
            t.head.skin = clientCore.ItemsInfo.getItemIconUrl(userBase.headImage);
            t.sex2.visible = userBase.sex == 2;
            t.sex1.visible = userBase.sex == 1;
            t.labName.text = (userBase.nick);
            t.labFamily.text = (userBase.familyName ? userBase.familyName : "无");
            t.labLv.text = ("Lv:" + clientCore.LocalInfo.parseLvInfoByExp(userBase.exp).lv);
            t.labJiban.text = value.friendShip.toString();
            let vipLv = clientCore.LocalInfo.parseVipInfoByExp(userBase.vipExp).lv;
            if (vipLv > 0) {
                t.vipBg.visible = true;
                t.vip.visible = true;
                t.vip.value = vipLv.toString();
            }
            else {
                t.vipBg.visible = false;
                t.vip.visible = false;
            }
            BC.addEvent(this, t.btnInvite, Laya.Event.CLICK, this, this.invite, [userBase.userid]);
        }

        private invite(id: number) {
            net.sendAndWait(new pb.cs_kitchen_help_cooking_food({ type: 1, uid: id })).then((msg: pb.sc_kitchen_help_cooking_food) => {
                if (msg.status == 1) {
                    alert.showSmall("该好友已经在帮助别人了~");
                    let idx = _.findIndex(this.canUseFriend, (o) => { return o.userBaseInfo.userid == id });
                    this.canUseFriend.splice(idx, 1);
                    this.list.refresh();
                } else {
                    this._model.fHelpTime = msg.eTime;
                    this._model.fHelp = _.find(this.canUseFriend, (o) => { return o.userBaseInfo.userid == id }).userBaseInfo;
                    this._model.fGodPray = msg.godPray;
                    clientCore.DialogMgr.ins.close(this);
                    EventManager.event("REFRESH_HELP_INFO");
                }
            });
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.canUseFriend = null;
            super.destroy();
        }
    }
}