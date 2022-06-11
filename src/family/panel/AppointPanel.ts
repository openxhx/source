namespace family.panel {
    /**
     * 任命
     */
    export class AppointPanel extends ui.family.panel.AppointPanelUI {

        private _info: pb.memberInfo;
        private _selIndex: number;
        private _postIndex:number;
        constructor() {
            super();

            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);

        }

        show(info: pb.memberInfo): void {
            this._info = info;
            this.list.array = ["族长", "副族长", "长老", "精英", "族员"];
            this.list.selectedIndex = info.post - 1;
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(): void {
            this._info = null;
            super.destroy();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private listRender(item: Laya.Box, index: number): void {
            (item.getChildByName("post") as Laya.Label).changeText(this.list.array[index]);
            (item.getChildByName("board") as Laya.Image).skin = index == this._info.post - 1 ? "family/apdi1.png" : "family/apdi2.png";
        }

        private listSelect(index: number): void {
            if (index == -1) return;
            this.list.selectedIndex = -1;
            if (this._info.post - 1 == index) return;
            let myPost: number = clientCore.FamilyMgr.ins.svrMsg.post;
            if (myPost >= index + 1 && myPost != FamlyPost.SHAIKH) {
                alert.showFWords("暂无权限任命该职位");
                return;
            }
            this._selIndex = index;
            alert.showSmall(`是否确认将${this._info.nick}任命为${this.list.array[index]}`, {
                callBack: {
                    caller: this,
                    funArr: [this.appointMember]
                }
            })
        }

        private appointMember(): void {
            this._postIndex = this._selIndex + 1;
            if( this._postIndex == 1){
                alert.showSmall(`注意：移交族长后将自动降职为族员，该操作不可撤销！请谨慎操作！\n\n是否确认将玩家 ${this._info.nick} 任命为族长？`, {
                    callBack: {
                        caller: this,
                        funArr: [this.sendAppointCmd]
                    }
                });
                return;
            }
            this.sendAppointCmd();
        }
        private sendAppointCmd(){
            FamilySCommand.ins.appointMember(this._info.userid,  this._postIndex, Laya.Handler.create(this, () => {
                this._info.post = this._postIndex;
                this.list.refresh();
                EventManager.event(FamilyConstant.UPDATE_POST, this._postIndex);
            }));
        }
    }
}