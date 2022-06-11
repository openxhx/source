namespace mail.panel {
    /**
     * 邮件内容
     */
    export class MailValuePanel extends ui.mail.panel.MailValuePanelUI {

        private _handler: Laya.Handler;

        private _isGet: boolean;
        private _tempX: number = 0;

        constructor() {
            super();
            //奖励列表初始化
            this.list.hScrollBarSkin = null;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.panel.vScrollBarSkin = null;
        }

        public show(info: pb.IMailInfo, handler: Laya.Handler): void {
            clientCore.DialogMgr.ins.open(this);
            this._handler = handler;
            this._isGet = false;
            this.txTitle.changeText(info.title);
            this.txValue.text = info.content;
            //过滤性别不对的
            let array: pb.IItemInfo[] = info.rewardInfo;
            array = _.filter(array, (o) => {
                if (xls.get(xls.itemCloth).has(o.itemId)) {
                    let sex = xls.get(xls.itemCloth).get(o.itemId).sex;
                    return sex == 0 || sex == clientCore.LocalInfo.sex;
                }
                else {
                    return true;
                }
            })
            this.list.array = array;
            let max = 684;
            this.list.width = Math.min(684, 155 * this.list.length);
            this.btnGet.visible = array.length != 0;
            let hasGet: boolean = info.getReward == 1;
            this.btnGet.disabled = hasGet;
            this.btnGet.label = hasGet ? "已领取" : "领取";
            this.btnGet.labelPadding = hasGet ? "20,0,0,28" : "20,0,0,42";
            let timeOut: number = clientCore.MailManager.ins.getTimeOut(info);
            this.txTimeOut.changeText(`有效期:${timeOut < 3600 ? "小于1小时" : util.StringUtils.getTime(timeOut, '{day}天{hour}时')}`);
        }

        public hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            if (this._handler) {
                this._isGet && this._handler.run();
                this._handler.recover();
            }
            this._handler = null;
            super.destroy();
        }

        private onGet(): void {
            this._isGet = true;
            this.hide();
        }

        private listRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: pb.IItemInfo = this.list.array[index];
            let id = data.itemId;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.txtName.text = clientCore.ItemsInfo.getItemName(id);
            item.txtName.visible = true;
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            item.num.value = "" + data.itemCnt;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = e.currentTarget['dataSource'].itemId;
                clientCore.ToolTip.showTips(e.currentTarget, { id: id });
            }
        }
    }
}