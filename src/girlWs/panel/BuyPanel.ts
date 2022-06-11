namespace girlWs {
    /**
     * 星尘礼包
     */
    export class BuyPanel extends ui.girlWs.panel.BuyPanelUI {
        private readonly RECHAGE_ID: number[] = [48, 49];
        async show(): Promise<void> {
            let timeArr: number[] = await clientCore.LimitRechargeManager.instance.getInfo();
            for (let i: number = 0; i < 2; i++) {
                let cfg = clientCore.RechargeManager.getShopInfo(this.RECHAGE_ID[i]);
                let item: ui.girlWs.item.BuyItemUI = this[`item${i}`];
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.rewardFamale[0] : cfg.rewardMale[0];
                let event: xls.rechargeEvent = _.find(xls.get(xls.rechargeEvent).getValues(), (element: xls.rechargeEvent) => { return element.chargeId == this.RECHAGE_ID[i]; });
                let times: number = timeArr[event.id - 1] >> 0;
                let limit: xls.pair = event.limit[0];
                item.nameTxt.changeText(`${cfg.cost}元星尘礼包`);
                item.limitTxt.changeText(`${limit.v1 == 1 ? '今日' : '本周'}剩余：${limit.v2 - times}/${limit.v2}`);
                item.btnBuy.disabled = times == limit.v2;
                times != limit.v2 && BC.addEvent(this, item.btnBuy, Laya.Event.CLICK, this, this.onClick, [i, event.id]);
                clientCore.GlobalConfig.setRewardUI(item.vReward, { id: reward.v1, cnt: reward.v2, showName: false });
            }
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private waiting: boolean = false;
        private async onClick(index: number, id: number): Promise<void> {
            if (this.waiting) return;
            this.waiting = true;
            let event: xls.rechargeEvent = _.find(xls.get(xls.rechargeEvent).getValues(), (element: xls.rechargeEvent) => { return element.chargeId == this.RECHAGE_ID[index]; });
            let key: number = id - 1;
            let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
            let item: ui.girlWs.item.BuyItemUI = this[`item${index}`];
            clientCore.RechargeManager.pay(this.RECHAGE_ID[index]).then((data) => {
                alert.showReward(data.items);
                let limit: xls.pair = event.limit[0];
                item.btnBuy.disabled = ++value >= event.limit[0].v2;
                item.limitTxt.changeText(`${limit.v1 == 1 ? '今日' : '本周'}剩余：${limit.v2 - value}/${limit.v2}`);
                clientCore.LimitRechargeManager.instance.settimes(key, value);
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }
    }
}