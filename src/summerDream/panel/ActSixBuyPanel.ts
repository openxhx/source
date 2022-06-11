namespace summerDream {
    export class ActSixBuyPanel extends ui.summerDream.panel.ActSixBuyPanelUI {
        private curDay: number;
        private buyIds: number[] = [21, 29, 39];
        ruleId: number = 1144;
        constructor() {
            super();
            this.init();
        }

        init(): void {
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.list.selectHandler = new Laya.Handler(this, this.rewardSelect);
            this.addEventListeners();
        }

        private initView() {
            this.curDay = Math.floor((util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) - util.TimeUtil.formatTimeStrToSec("2021/6/4 00:00:00")) / 86400);
            if (this.curDay < 0) this.curDay = 0;
            let idx: number = this.curDay % 3;
            let config = clientCore.RechargeManager.getShopInfo(this.buyIds[idx]);
            let item = clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale;
            let has = clientCore.ItemsInfo.checkHaveItem(item[0].v1);
            this.btnBuy.disabled = this.imgGot.visible = has;
            this.list.array = item;
            this.list.repeatX = item.length;
            this.ico.skin = clientCore.ItemsInfo.getItemIconUrl(item[1].v1);
        }

        show() {
            clientCore.Logger.sendLog('2021年6月4日活动', '【付费】夏夜如梦', '打开超值6元GO面板');
            this.initView();
            this.visible = true;
        }

        hide() {
            this.visible = false;
        }

        private rewardSelect(index: number) {
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
                return;
            };
        }

        private rewardRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
            item.txtName.color = "#ffffff";
        }

        private closeClick() {
            EventManager.event("SUMMER_DREAM_CLOSE_ACTIVITY");
            this.hide();
        }

        private buySuit() {
            this.initView();
            alert.showBuyDetails(this.buyIds[this.curDay % 3], new Laya.Handler(this, this.initView), new Laya.Handler(this, this.initView));
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}