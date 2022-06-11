namespace moonCake {
    export class CakeMakePanel extends ui.moonCake.panel.CakeMakePanelUI {
        private count: number;
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
        }

        public show() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '打开制作月饼面板');
            this.setUI();
            clientCore.DialogMgr.ins.open(this);
        }

        private setUI() {
            let mtr = clientCore.GlobalConfig.config.mooncakeMake;
            this.list.repeatX = mtr.length;
            this.list.array = mtr;
            this.count = 0;
            for (let i: number = 0; i < mtr.length; i++) {
                let max = Math.floor(clientCore.ItemsInfo.getItemNum(mtr[i].v1) / mtr[i].v2);
                if (max < this.count || i == 0) this.count = max;
            }
            this.labCount.text = "x" + this.count;
        }

        private listRender(item: ui.moonCake.render.CakeMetarialRenderUI, idx: number) {
            let data = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item.item, { id: data.v1, cnt: 1, showName: false });
            item.labCount.text = clientCore.ItemsInfo.getItemNum(data.v1) + "/" + data.v2;
            BC.addEvent(this, item.btnPlus, Laya.Event.CLICK, this, this.addMtr, [data.v1]);
            BC.addEvent(this, item.item, Laya.Event.CLICK, this, this.showTip, [idx]);
        }

        private showTip(idx: number) {
            let reward = this.list.array[idx];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[idx], { id: reward.v1 });
            };
        }

        private addMtr(id: number) {
            if (id == 9900077) {
                clientCore.DialogMgr.ins.close(this);
                EventManager.event("MOONCAKE_SHOW_GETFRUITS");
            } else {
                if (clientCore.MaterialBagManager.getCanStoreNum() == 0) {
                    alert.showFWords('仓库已满,请先扩建仓库')
                    return;
                }
                let unitNum = _.find(xls.get(xls.shop).getValues(), (o) => { return o.itemId == id })?.unitNum;
                if (!unitNum) unitNum = 1;
                alert.alertQuickBuy(id, unitNum, true, Laya.Handler.create(this, this.setUI));
            }
        }

        private makeCake() {
            if (!this.count) return;
            net.sendAndWait(new pb.cs_make_moon_cake({ times: this.count })).then((msg: pb.sc_make_moon_cake) => {
                alert.showReward(msg.items);
                this.setUI();
            })
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.makeCake);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}