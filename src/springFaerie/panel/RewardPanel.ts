namespace springFaerie {
    export class RewardPanel extends ui.springFaerie.panel.RewardPanelUI {
        public rewardFlag: number;
        private suit: number = 2110624;
        private scoreNum: number;
        constructor() {
            super();
            this.listReward.vScrollBarSkin = ""
            this.listReward.renderHandler = new Laya.Handler(this, this.rewardRender);
        }

        show(curPoint: number) {
            this.scoreNum = curPoint;
            this.listReward.array = _.filter(xls.get(xls.collocationActivity).getValues(), (o) => { return o.id >= 77 && o.id <= 84 });
            this.imgSuit1.skin = `unpack/springFaerie/suit${clientCore.LocalInfo.sex}.png`;
            this.labTime.text = "3.18~3.24";
            //this.labEnd.text = "3.17";
            this.labName1.text = clientCore.SuitsInfo.getSuitInfo(this.suit).suitInfo.name + "套装";
            clientCore.DialogMgr.ins.open(this, false);
        }

        private rewardRender(item: ui.springFaerie.render.RewardItemUI) {
            const data: xls.collocationActivity = item.dataSource;
            const reward = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
            const cost = data.score;
            item.imgTarget.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.numTxt.text = "桃运积分达到" + cost;
            item.imgGot.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            item.btnExchange.visible = !item.imgGot.visible;
            BC.removeEvent(this, item.imgTarget, Laya.Event.CLICK, this, this.ShowItemTip);
            BC.removeEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, item.imgTarget, Laya.Event.CLICK, this, this.ShowItemTip, [item.imgTarget, reward[0].v1]);
            BC.addEvent(this, item.btnExchange, Laya.Event.CLICK, this, this.getReward, [data]);
            let have = clientCore.ItemsInfo.getItemNum(data.cost[0].v1);
            if (have >= data.cost[0].v2 && this.scoreNum >= cost && !item.imgGot.visible) {
                item.imgEqual.skin = "springFaerie/RewardPanel/equal1.png";
                item.diTarget.skin = "springFaerie/RewardPanel/di_item1.png";
            } else {
                item.imgEqual.skin = "springFaerie/RewardPanel/equal.png";
                item.diTarget.skin = "springFaerie/RewardPanel/di_item.png";
            }
        }

        /**显示物品信息 */
        private ShowItemTip(item: any, id: number, e: Laya.Event) {
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
            net.sendAndWait(new pb.cs_gu_ling_xian_reward({ id: data.id })).then((msg: pb.sc_gu_ling_xian_reward) => {
                alert.showReward(msg.item);
                this.listReward.refresh();
                //util.RedPoint.reqRedPointRefresh(29325);
                this.mouseEnabled = true;
            }).catch(() => {
                this.mouseEnabled = true;
            });
        }

        private onCloseClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suit);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.trySuit, [1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}