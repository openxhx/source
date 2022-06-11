namespace collection {
    export class CoRoleRewardPanel extends ui.collection.panel.RoleRewardPanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.sideClose = true;
        }

        show(info: pb.sc_get_role_filed_reward) {
            clientCore.DialogMgr.ins.open(this);
            this.list.dataSource = info.achvAttrs;
        }

        private onListRender(cell: Laya.Box, idx: number) {
            let info: pb.IExtAttr = cell.dataSource;
            (cell.getChildByName('imgIcon') as Laya.Image).skin = pathConfig.getRoleSmallAttrIco(info.attr);
            let role = clientCore.RoleManager.instance.getSelfInfo();
            (cell.getChildByName('txtValue') as Laya.Label).text = role.getAttrInfo(info.attr).total.toString();
            (cell.getChildByName('txtAdd') as Laya.Label).text = '+' + info.value;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}