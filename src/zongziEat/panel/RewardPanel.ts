namespace zongziEat {
    export class RewardPanel extends ui.zongziEat.panel.ZongziEatRewardUI {
        public rewardFlag: number;
        public curPoint: number;
        private suit: number = 2110669;
        constructor() {
            super();
            this.init();
        }

        init() {
            this.sideClose = true;
            this.list.vScrollBarSkin = ""
            this.list.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.imgSuit.skin = `unpack/zongziEat/suit_${clientCore.LocalInfo.sex}.png`;
        }

        initOver() {
            this.labPoint.text = "" + this.curPoint;
            this.setBeanCount();
            this.list.array = _.filter(xls.get(xls.collocationActivity).getValues(), (o) => { return o.id >= 144 && o.id <= 153 });
        }

        private setBeanCount() {
            this.labBean.text = "" + clientCore.ItemsInfo.getItemNum(9900001);
        }

        private rewardRender(item: ui.zongziEat.item.RewardItemUI) {
            const data: xls.collocationActivity = item.dataSource;
            const reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
            const cost = data.score;
            item.item1.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.item2.skin = clientCore.ItemsInfo.getItemIconUrl(reward[1].v1);
            item.labPoint.text = "大赛积分达到" + cost;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            item.btnGet.visible = !item.imgGot.visible;
            BC.removeEvent(this, item.item1, Laya.Event.CLICK, this, this.showItemTip);
            BC.removeEvent(this, item.item2, Laya.Event.CLICK, this, this.showItemTip);
            BC.removeEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, item.item1, Laya.Event.CLICK, this, this.showItemTip, [item.item1, reward[0].v1]);
            BC.addEvent(this, item.item2, Laya.Event.CLICK, this, this.showItemTip, [item.item2, reward[1].v1]);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [data]);
            let have = clientCore.ItemsInfo.getItemNum(data.cost[0].v1);
            if (have >= data.cost[0].v2 && this.curPoint >= cost && !item.imgGot.visible) {
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
            if (have < data.cost[0].v2 || this.curPoint < data.score) {
                alert.showFWords("领取条件未满足~");
                return;
            }
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_dragon_boat_festival_exchange({ id: data.id })).then(async (msg: pb.sc_dragon_boat_festival_exchange) => {
                alert.showReward(msg.items);
                this.list.refresh();
                this.setBeanCount();
                this.mouseEnabled = true;
                // await util.RedPoint.reqRedPointRefresh(29327);
                // EventManager.event("CHECK_REWARD_TECHO_RED");
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
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}