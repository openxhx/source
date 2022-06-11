namespace appreciate {
    export class FriendsPanel extends ui.appreciate.panel.FriendsPanelUI {

        // 

        public readonly ON_ADD_ROLE: string = "ON_ADD_ROLE";

        constructor() {
            super();
            this.list.vScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.dataSource = _.sortBy(clientCore.FriendManager.instance.friendList, (element) => { return !clientCore.CpManager.instance.checkCp(element.userBaseInfo.userid) })
            this.addEventListeners();
        }

        private onListRender(cell: ui.appreciate.render.FriendsRenderUI, idx: number) {
            let value: pb.friend_t = cell.dataSource;
            let userBase: pb.IUserBase = value.userBaseInfo;

            let isCp: boolean = clientCore.CpManager.instance.checkCp(userBase.userid);
            cell.imgBg.skin = isCp ? "appreciate/di_cp.png" : "appreciate/di_haoyou.png";
            cell.imgNameBg.skin = isCp ? "appreciate/dicp.png" : "appreciate/di.png";
            cell.imgMan.visible = userBase.sex == 2; //先默认写死是女孩纸
            cell.imgWoman.visible = userBase.sex == 1;
            cell.txName.changeText(userBase.nick);
            cell.txFamily.changeText(userBase.familyName ? userBase.familyName : "无");
            cell.txLev.changeText("Lv:" + clientCore.LocalInfo.parseLvInfoByExp(userBase.exp).lv);
            cell.imgHead.gray = value.isOnline == 0;
            cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(userBase.headImage);
            cell.imgHead.mouseEnabled = true;
            cell.txFriendShip.text = value.friendShip.toString();

            let vipLv = clientCore.LocalInfo.parseVipInfoByExp(userBase.vipExp).lv;
            if (vipLv > 0) {
                cell.vipBg.visible = true;
                cell.vipLevel.visible = true;
                cell.vipLevel.value = vipLv.toString();
            }
            else {
                cell.vipBg.visible = false;
                cell.vipLevel.visible = false;
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "btnYaoqing") {
                    this.event(this.ON_ADD_ROLE, [this.list.dataSource[idx]]);
                }
            }
        }

        /**
         * 
         * @param type 1-水平方向 2-竖直方向
         */
        changeDir(type: number): void{
            if(type == 1){
                this.list.scrollBar.slider.isVertical = false;
                this.list.scrollBar.bottom = 0;
            }else{
                this.list.scrollBar.slider.isVertical = true;
                this.list.scrollBar.right = 0;
            }
        }

        onClose(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}