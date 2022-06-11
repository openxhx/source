namespace luckyBamboo {
    export class LuckyBambooFriendPanel extends ui.luckyBamboo.panel.LuckyBambooFriendPanelUI {
        constructor() {
            super();
            this.init();
        }

        init() {
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
        }

        show(list: pb.Ibamboo_list_info[]) {
            this.list.array = list;
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.luckyBamboo.render.FriendItemUI) {
            let data: pb.Ibamboo_list_info = item.dataSource;
            let value: pb.Ifriend_t = clientCore.FriendManager.instance.getFriendInfoById(data.uid);
            let userBase: pb.IUserBase = value.userBaseInfo;
            item.imgAlertwater.visible = data.flag == 0;
            item.imgMan.visible = userBase.sex == 2; //先默认写死是女孩纸
            item.imgWoman.visible = userBase.sex == 1;
            item.txName.changeText(userBase.nick);
            item.txFamily.changeText(userBase.familyName ? userBase.familyName : "无");
            item.txLev.changeText("Lv:" + clientCore.LocalInfo.parseLvInfoByExp(userBase.exp).lv);
            item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(userBase.headImage);
            item.imgHead.mouseEnabled = true;
            item.txLoveNum.changeText(clientCore.GlobalConfig.lovePointInfo(userBase.love).lv + "(级)");
            item.txWisdomNum.changeText(clientCore.GlobalConfig.wisdomPointInfo(userBase.wisdom).lv + "(级)");
            item.txBeautyNum.changeText(clientCore.GlobalConfig.beatuyPointInfo(userBase.beauty).lv + "(级)");
            item.txFriendShip.text = (value instanceof pb.friend_t ? value.friendShip : 0).toString();
            let vipLv = clientCore.LocalInfo.parseVipInfoByExp(userBase.vipExp).lv;
            if (vipLv > 0) {
                item.vipBg.visible = true;
                item.vipLevel.visible = true;
                item.vipLevel.value = vipLv.toString();
            }
            else {
                item.vipBg.visible = false;
                item.vipLevel.visible = false;
            }
            BC.addEvent(this, item.btnBamboo, Laya.Event.CLICK, this, this.checkFriendBamboo, [userBase.userid]);
        }

        private checkFriendBamboo(id: number) {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("luckyBamboo.LuckyBambooInfoModule", id);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}