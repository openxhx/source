namespace orderSystem {
    export class OrderDetailPanel {

        private _skin: ui.orderSystem.panel.taskPanelUI;
        private _list: laya.ui.List;
        private _tipHandler: laya.utils.Handler;
        public refreshHandler: laya.utils.Handler;
        public completeHandler: laya.utils.Handler;

        constructor(skin: ui.orderSystem.panel.taskPanelUI) {
            this._skin = skin;
            this._skin.mouseThrough = true;
            this._list = skin.itemList;
            this._list.selectEnable = true;
            this._list.vScrollBarSkin = "";
            skin.rewardList.renderHandler = new Laya.Handler(this, this.rewardRender);
            skin.rewardList.mouseHandler = new Laya.Handler(this, this.showItemTip);
            skin.itemList.renderHandler = new Laya.Handler(this, this.itemRender);
            this._list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        private rewardRender(item: ui.orderSystem.render.orderItemRenderUI, index: number): void {
            let info: xls.pair = item.dataSource;
            item.imgOk.visible = false;
            item.reward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.v1);
            item.reward.txtName.text = clientCore.ItemsInfo.getItemName(info.v1);
            item.reward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.v1);

            // 科技树增加
            let cnt: number = info.v2;
            if (info.v1 == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) { //仙豆
                cnt = Math.round(cnt * (1 + clientCore.ScienceTreeManager.ins.increment(11) / 100));
            } else if (info.v1 == clientCore.MoneyManager.EXP_ID) { //经验
                cnt = Math.round(cnt * (1 + clientCore.ScienceTreeManager.ins.increment(12) / 100));
            }

            item.reward.num.value = cnt.toString();
            item.reward.txtName.visible = false;
        }

        private itemRender(item: ui.orderSystem.render.orderItemRenderUI, idx: number) {

            let value = item.dataSource;
            let haveItemCnt: number = clientCore.ItemsInfo.getItemNum(value.needCollectItemId);
            let needItemTotalCnt: number = value.needItemTotalCnt >> 0;
            let isEnough: boolean = haveItemCnt >= needItemTotalCnt;
            item.imgOk.visible = isEnough;
            if (value.needCollectItemId) {
                item.reward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(value.needCollectItemId);
                item.reward.txtName.text = clientCore.ItemsInfo.getItemName(value.needCollectItemId);
                item.reward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(value.needCollectItemId);
            }
            item.reward.num.value = util.StringUtils.parseNumFontValue(haveItemCnt, needItemTotalCnt);
        }
        public set data(data: OrderData) {
            let npc = xls.get(xls.characterId).get(data.config.publishNPC);
            this._skin.txNpc.text = npc ? npc.name : 'npc表:' + data.config.publishNPC;
            this._skin.imgRole.skin = pathConfig.getRoleUI(data.config.publishNPC);
            this._skin.dialog.text = data.getDialogue();
            this._list.dataSource = data.data.orderItemInfo;
            let exp = new xls.pair();
            exp.v1 = clientCore.MoneyManager.EXP_ID;
            exp.v2 = data.config.foundationReward;
            let favor = new xls.pair();
            favor.v1 = clientCore.MoneyManager.FAVOR_ID;
            favor.v2 = data.config.FriendLiness;
            this._skin.rewardList.dataSource = data.config.itemReward.concat([exp, favor]);
        }

        public set visible(value: boolean) {
            this._skin.visible = value;
        }

        public set tipHandler(handler: Laya.Handler) {
            this._tipHandler = handler;
        }

        public get tipHandler(): Laya.Handler {
            return this._tipHandler;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this._list.getItem(idx) as pb.IOrderItemInfo;
                let diff: number = data.needItemTotalCnt - data.haveItemCnt;
                clientCore.ToolTip.showTips(this._list.getCell(idx), { id: data.needCollectItemId }, diff > 0 ?
                    {
                        id: data.needCollectItemId,
                        cnt: diff,
                        mod: 13,
                        tips: `订单需要的${clientCore.ItemsInfo.getItemName(data.needCollectItemId)}已集齐，是否要返回订单界面？`
                    } : null);
            }
        }

        private showItemTip(e: Laya.Event, idx: number) {
            let data = this._skin.rewardList.getItem(idx) as xls.pair;
            clientCore.ToolTip.showTips(this._skin.rewardList.getCell(idx), { id: data.v1 });
        }

        private onRefreshSure(): void {
            alert.showSmall("是否刷新此订单？", {
                callBack: {
                    funArr: [this.onRefresh],
                    caller: this
                }
            });
        }

        private onRefresh(e: Laya.Event) {
            if (this.refreshHandler) {
                this.refreshHandler.run();
            }
        }

        private onComplete(e: Laya.Event) {
            if (this.completeHandler) {
                this.completeHandler.run();
            }
        }

        public addEventListeners() {
            this._skin.refresh.on(Laya.Event.CLICK, this, this.onRefreshSure);
            this._skin.accept.on(Laya.Event.CLICK, this, this.onComplete);
        }

        public removeEventListeners() {
            this._skin.refresh.offAll();
            this._skin.accept.offAll();
        }

        public destory() {
        }
    }
}