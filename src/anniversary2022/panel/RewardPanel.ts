namespace anniversary2022 {
    export class RewardPanel extends ui.anniversary2022.panel.RewardPanelUI {
        private suit: number = 2110645;//2110646;//2110641;//2110635;//2110634;//2110621;
        public scoreNum: number;
        constructor() {
            super();
            this.init();
        }

        init() {
            this.sideClose = true;
            this.listReward.vScrollBarSkin = ""
            this.listReward.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.suit1.visible = clientCore.LocalInfo.sex == 1;
            this.suit2.visible = clientCore.LocalInfo.sex == 2;
        }

        initOver() {
            this.labCur.text = " " + this.scoreNum + " ";
            this.listReward.array = _.filter(xls.get(xls.collocationActivity).getValues(), (o) => { return o.id >= 127 && o.id <= 135 });
        }

        private rewardRender(item: ui.anniversary2022.item.RewardItemUI) {
            const data: xls.collocationActivity = item.dataSource;
            const reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
            const cost = data.score;
            item.item1.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.labPoint.text = "庆典积分达到" + cost;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            item.btnGet.visible = !item.imgGot.visible;
            BC.removeEvent(this, item.item1, Laya.Event.CLICK, this, this.showItemTip);
            BC.removeEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, item.item1, Laya.Event.CLICK, this, this.showItemTip, [item.item1, reward[0].v1]);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [data]);
            let have = clientCore.ItemsInfo.getItemNum(data.cost[0].v1);
            if (have >= data.cost[0].v2 && this.scoreNum >= cost && !item.imgGot.visible) {
                item.btnGet.disabled = false;
            } else {
                item.btnGet.disabled = true;
            }
        }

        /**显示物品信息 */
        private showItemTip(item: any, id: number, e: Laya.Event) {
            clientCore.ToolTip.showTips(item, { id: id });
            e.stopPropagation();
        }

        private getReward(data: xls.collocationActivity) {
            let have = clientCore.ItemsInfo.getItemNum(data.cost[0].v1);
            if (have < data.cost[0].v2 || this.scoreNum < data.score) {
                alert.showFWords("交换条件未满足~");
                return;
            }
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_second_anniversary_celebration_reward({ id: data.id })).then(async (msg: pb.sc_second_anniversary_celebration_reward) => {
                alert.showReward(msg.item);
                this.listReward.refresh();
                this.mouseEnabled = true;
                await util.RedPoint.reqRedPointRefresh(29327);
                EventManager.event("CHECK_REWARD_TECHO_RED");
            }).catch(() => {
                this.mouseEnabled = true;
            });
        }

        private onCloseClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suit);
        }

        addEventListeners() {
            // BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}