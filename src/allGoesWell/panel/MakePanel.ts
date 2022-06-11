namespace allGoesWell {
    export class MakePanel extends ui.allGoesWell.panel.MakeTangyuanPanelUI {
        private cost: xls.pair[];
        constructor() {
            super();
            this.sideClose = true;
            this.init();
        }

        init() {
            this.cost = [];
            //莹莹翠绿
            let config = xls.get(xls.eventExchange).get(3149);
            this.cost = this.cost.concat(config.cost);
            //粉粉如意
            config = xls.get(xls.eventExchange).get(3150);
            this.cost = this.cost.concat(config.cost);
            //心想事成
            config = xls.get(xls.eventExchange).get(3151);
            this.cost = this.cost.concat(config.cost);

            for (let i = 1; i <= 6; i++) {
                this["item" + i].skin = clientCore.ItemsInfo.getItemIconUrl(this.cost[i - 1].v1);
            }
        }

        public show() {
            clientCore.UIManager.setMoneyIds([9900303, 9900304, 9900305]);
            this.setCostNum();
            clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','打开制作元宵面板');
            clientCore.DialogMgr.ins.open(this);
        }

        private setCostNum() {
            for (let i = 1; i <= 6; i++) {
                this["labCnt" + i].text = clientCore.ItemsInfo.getItemNum(this.cost[i - 1].v1) + "/" + this.cost[i - 1].v2;
            }
        }

        private onExchange(id: number): void {
            let cost = xls.get(xls.eventExchange).get(id).cost;
            let arr: xls.pair[] = [];
            for (let i = 0; i < cost.length; i++) {
                let data = cost[i];
                let hasNum = clientCore.ItemsInfo.getItemNum(data.v1);
                if (hasNum < data.v2) {
                    arr.push(data);
                }
            }
            if (arr.length > 0) {
                alert.mtrNotEnough(arr, Laya.Handler.create(this, this.makeTangyuan, [id]));
            } else {
                this.makeTangyuan(id);
            }
        }

        private makeTangyuan(id: number) {
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 228 })).then((msg: pb.sc_common_exchange) => {
                // alert.showReward(msg.item);
                this.aniNpc.play(id - 3149, false, true, 0);
                this.aniNpc.once(Laya.Event.COMPLETE, this, this.onAniOver);
                this.aniNpc.visible = true;
                this.boxNpc.visible = false;
                this.setCostNum();
            })
        }

        private onAniOver() {
            this.aniNpc.visible = false;
            this.boxNpc.visible = true;
        }

        private showTip(index: number) {
            clientCore.ToolTip.showTips(this["item" + index], { id: this.cost[index - 1].v1 });
        }

        onCloseClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.imgClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnMake1, Laya.Event.CLICK, this, this.onExchange, [3149]);
            BC.addEvent(this, this.btnMake2, Laya.Event.CLICK, this, this.onExchange, [3150]);
            BC.addEvent(this, this.btnMake3, Laya.Event.CLICK, this, this.onExchange, [3151]);
            for (let i = 1; i <= 6; i++) {
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.showTip, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        clean() {
            this.cost = null;
            this.destroy();
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.setMoneyIds([9900307, clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID]);
        }
    }
}