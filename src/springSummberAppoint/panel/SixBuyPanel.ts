namespace springSummberAppoint {
    /**
     * 超值六元购
     */
    export class SixBuyPanel extends ui.springSummberAppoint.panel.SixBuyPanelUI implements IPanel {
        private curDay: number;
        private buyIds: number[] = [21, 29, 39];
        private detailPanel: BuyDetailsPanel;
        ruleId: number = 1151;
        constructor() {
            super();
            this.pos(250, 0);
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.list.selectHandler = new Laya.Handler(this, this.rewardSelect);
            this.addEvents();
        }

        private initView() {
            this.curDay = Math.floor((util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) - util.TimeUtil.formatTimeStrToSec("2021/4/16 00:00:00")) / 86400);
            if (this.curDay < 0) this.curDay = 0;
            let idx: number = this.curDay % 3;
            let config = clientCore.RechargeManager.getShopInfo(this.buyIds[idx]);
            let item = clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale;
            let has = clientCore.ItemsInfo.checkHaveItem(item[0].v1);
            this.btnBuy.disabled = this.imgBuy.visible = has;
            this.list.array = item;
            this.list.repeatX = item.length;
            if (item.length > 1) {
                this.icon.skin = `res/cloth/icon/${item[1].v1}.png`;
            } else {
                this.icon.skin = `res/cloth/icon/${item[0].v1}.png`;
            }
        }

        show(sign: number, parent: Laya.Sprite): void {
            this.initView();
            parent.addChild(this);
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

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        dispose(): void {
            BC.removeEvent(this);
            EventManager.off("GIFT_BUY", this, this.buy);
            this.detailPanel?.destroy();
            this.detailPanel = null;
        }

        private addEvents(): void {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openDetail);
            EventManager.on("GIFT_BUY", this, this.buy);
        }

        private openDetail() {
            if (!this.detailPanel) this.detailPanel = new BuyDetailsPanel();
            this.detailPanel.showInfo(this.buyIds[this.curDay % 3]);
            clientCore.DialogMgr.ins.open(this.detailPanel);
        }

        private waiting: boolean = false;
        private async buy(id: number): Promise<void> {
            if (this.waiting) return;
            this.waiting = true;
            clientCore.RechargeManager.pay(id).then((data) => {
                alert.showReward(data.items);
                this.btnBuy.disabled = this.imgBuy.visible = true;
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }
    }
}