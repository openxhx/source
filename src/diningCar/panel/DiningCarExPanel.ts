namespace diningCar {
    export class DiningCarExPanel extends ui.diningCar.panel.DiningCarExchangeUI {
        private completed: number[];
        private waitMsg: boolean;
        constructor() {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
        }

        public show() {
            if (this.waitMsg) return;
            this.waitMsg = true;
            net.sendAndWait(new pb.cs_get_breakfast_car_exchange_task()).then((msg: pb.sc_get_breakfast_car_exchange_task) => {
                this.completed = msg.completed;
                this.list.array = msg.ids;
                this.list.spaceY = msg.ids.length;
                clientCore.DialogMgr.ins.open(this);
                clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开更多体力弹窗');
                this.waitMsg = false;
            });
        }

        private listRender(item: ui.diningCar.render.DiningCarExItemUI) {
            let id: number = item.dataSource;
            let config = xls.get(xls.diningCarTask).get(id);
            item.target.dataSource = config.awards[0];
            clientCore.GlobalConfig.setRewardUI(item.target, { id: config.awards[0].v1, cnt: config.awards[0].v2, showName: false });
            BC.addEvent(this, item.target, Laya.Event.CLICK, this, this.showTip, [item.target]);
            item.list.renderHandler?.recover();
            item.list.renderHandler = new Laya.Handler(this, (rewarditem: ui.commonUI.item.RewardItemUI) => {
                let reward: xls.pair = rewarditem.dataSource;
                clientCore.GlobalConfig.setRewardUI(rewarditem, { id: reward.v1, cnt: reward.v2, showName: false });
                rewarditem.num.value = this.getNumToAbc(clientCore.ItemsInfo.getItemNum(reward.v1), reward.v2) + "/" + reward.v2;
            });
            item.list.selectEnable = true;
            item.list.selectHandler?.recover();
            item.list.selectHandler = new Laya.Handler(this, (index: number) => {
                if (index == -1) return;
                let reward: xls.pair = item.list.array[index];
                if (reward) {
                    clientCore.ToolTip.showTips(item.list.cells[index], { id: reward.v1 });
                };
                item.list.selectedIndex = -1;
            })
            item.list.array = config.expend;
            item.list.repeatX = config.expend.length;
            item.imgGot.visible = this.completed.includes(id);
            item.btnGet.visible = !item.imgGot.visible;
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.exchange, [id]);
        }

        private showTip(item: any) {
            let reward: xls.pair = item.dataSource;
            if (reward)
                clientCore.ToolTip.showTips(item, { id: reward.v1 });
        }

        private getNumToAbc(has: number, need: number) {
            let arr: string[];
            if (has >= need) {
                arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
            } else {
                arr = ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
            }
            let str = has.toString();
            let res = "";
            for (let i: number = 0; i < str.length; i++) {
                res += arr[Number(str[i])];
            }
            return res;
        }

        private async exchange(id: number) {
            let config: xls.diningCarTask = xls.get(xls.diningCarTask).get(id);
            let data = _.filter(config.expend, (v) => {
                return v.v2 > clientCore.ItemsInfo.getItemNum(v.v1);
            });
            if (data.length > 0) {
                alert.mtrNotEnough(data, Laya.Handler.create(this, this.onUseLeafComplete, [id]));
            } else {
                this.onUseLeafComplete(id);
            }
        }

        private async onUseLeafComplete(id: number) {
            if (this.waitMsg) return;
            this.waitMsg = false;
            net.sendAndWait(new pb.cs_breakfast_car_exchange({ id: id })).then((msg: pb.sc_breakfast_car_exchange) => {
                this.completed.push(id);
                this.list.refresh();
                this.waitMsg = false;
                alert.showReward(msg.items);
            }).catch(() => {
                this.waitMsg = false;
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}