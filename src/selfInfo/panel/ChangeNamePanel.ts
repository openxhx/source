
namespace selfInfo {
    /**
     * 改名
     */
    export class ChangeNamePanel extends ui.selfInfo.panel.ChangeNamePanelUI {


        private readonly COST_ITEM: number = 1550004;

        constructor() {
            super();
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(this.COST_ITEM);
        }


        show(): void {
            // clientCore.UIManager.setMoneyIds([this.COST_ITEM]);
            // clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            // clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onSure(): void {
            let nick: string = this.inputName.text;
            if (nick == "") {
                alert.showFWords("角色名不能为空哦^_^");
                return;
            }
            if (clientCore.LocalInfo.userInfo.nick == nick) {
                alert.showFWords("名字无更改!");
                return;
            }
            if (!util.StringUtils.testName(nick)) {
                alert.showFWords("名字中含有不合法字符！");
                this.inputName.text = "";
                return;
            }
            if (clientCore.ItemsInfo.getItemNum(this.COST_ITEM) < 1) {
                alert.alertQuickBuy(this.COST_ITEM, 1, true);
                return;
            }
            if (nick.length > 6) {
                alert.showFWords('角色名最多6个字符！');
                return;
            }
            net.sendAndWait(new pb.cs_change_user_nick({ uname: nick })).then(() => {
                clientCore.LocalInfo.userInfo.nick = nick;
                clientCore.PeopleManager.getInstance().player.updateName(nick);
                EventManager.event(globalEvent.CHANGE_USER_NICK);
                alert.showFWords('改名成功！');
                clientCore.DialogMgr.ins.close(this);
            })
        }
    }
}