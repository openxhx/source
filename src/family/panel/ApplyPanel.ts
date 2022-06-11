namespace family.panel {
    /**
     * 申请面板
     */
    export class ApplyPanel extends ui.family.panel.ApplyPanelUI {

        private _page: number;
        private _applys: pb.UserBase[];

        private _sCommand: FamilySCommand;
        /** 申请数量*/
        private _applyCnt: number;
        private _wait: boolean;

        constructor() {
            super();

            this.list.vScrollBarSkin = "";
            this.list.scrollBar.elasticBackTime = 200;
            this.list.scrollBar.elasticDistance = 200;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnDeny, Laya.Event.CLICK, this, this.oneKey, [4]);
            BC.addEvent(this, this.btnAgree, Laya.Event.CLICK, this, this.oneKey, [3]);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.START, this, this.onStart);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._applys && (this._applys.length = 0);
            this._applys = this._sCommand = null;
            super.destroy();
        }

        public show(): void {
            this._applyCnt = 0;
            this._wait = false;
            this._page = 1;
            this._applys = [];
            this._sCommand = FamilySCommand.ins;
            this.addPreLoad(this.getApplys());
            clientCore.DialogMgr.ins.open(this);
        }

        public hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private getApplys(): Promise<void> {
            return new Promise((suc) => {
                this._sCommand.getApplys(this._page, Laya.Handler.create(this, (array: pb.UserBase[]) => {
                    this._applyCnt += array.length;
                    this._page++;
                    this._applys = this._applys.concat(array);
                    this.list.array = this._applys;
                    this.updateView();
                    suc();

                    if(this.list.array.length == 0){
                        util.RedPoint.reqRedPointRefresh(803);
                    }
                }));
            })
        }

        private updateView(): void {
            this.imgNone.visible = this._applys.length <= 0;
            this.btnDeny.visible = this.btnAgree.visible = !this.imgNone.visible;
        }

        private listMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let name: string = e.target.name;
            if (name == "deny" || name == "agree") {
                let info: pb.applyInfo = this.list.array[index];
                let type: number = name == "deny" ? 2 : 1;
                this._sCommand.acceptionOpt(type, Laya.Handler.create(this, (msg: pb.sc_member_acception_opt) => {
                    if (msg.flag == 1 && type == 1) {
                        alert.showFWords(`很遗憾,${info.nick}已加入其它家族啦~`);
                    }
                    this.list.deleteItem(index);
                    if(this.list.array.length == 0 && this._applyCnt % 10 == 0)
                    {
                        this.getApplys()
                    } else{
                        this.updateView();
                        if(this.list.array.length == 0){
                            util.RedPoint.reqRedPointRefresh(803);
                        }
                    } 
                    
                }), info.userid);
            }
        }

        private listRender(item: ui.family.item.ApplyItemUI, index: number): void {
            let info: pb.UserBase = this.list.array[index];
            item.imgMan.visible = info.sex == 2;
            item.imgWoman.visible = info.sex == 1;
            item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(info.headImage);
            item.txName.changeText(info.nick);
            item.txLv.changeText("Lv:" + clientCore.LocalInfo.parseLvInfoByExp(info.exp).lv + "");
            item.txVip.changeText(clientCore.LocalInfo.parseVipInfoByExp(info.vipExp).lv + "");
        }


        /** 一键*/
        private oneKey(type: number): void {
            this._sCommand.acceptionOpt(type, Laya.Handler.create(this, () => {
                this.list.array = null;
                this._applys.length = 0;
                this.updateView();
                util.RedPoint.reqRedPointRefresh(803);
            }));
        }

        private async onStart(): Promise<void> {
            if (this._wait || this._applyCnt % 10 != 0 || this.list.scrollBar.value < this.list.scrollBar.max) return;
            this._wait = true;
            await this.getApplys();
            this._wait = false;
        }
    }
}