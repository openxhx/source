namespace ginkgoOath {
    export class GinkgoOathReplacePanel extends ui.ginkgoOath.panel.GinkgoOathReplacePanelUI {
        constructor() {
            super();
            this.listOld.renderHandler = this.listNew.renderHandler = new Laya.Handler(this, this.itemRender);
        }

        public show() {
            let oldItem = [];
            let newItem = [];
            let rule = _.filter(xls.get(xls.itemCallback).getValues(), (o) => { return o.type == 92 });
            for (let i: number = 0; i < rule.length; i++) {
                let oldId = rule[i].itemid;
                let newId = clientCore.LocalInfo.sex == 1 ? rule[i].female[0] : rule[i].male[0];
                let oldCnt = clientCore.ItemsInfo.getItemNum(oldId);
                if (oldCnt > 0) {
                    oldItem.push({ id: oldId, cnt: oldCnt });
                    newItem.push({ id: newId, cnt: Math.ceil(oldCnt / rule[i].scale.v1 * rule[i].scale.v2) });
                }
            }
            this.listOld.repeatX = oldItem.length;
            this.listOld.array = oldItem;
            this.listNew.repeatX = newItem.length;
            this.listNew.array = newItem;
            clientCore.DialogMgr.ins.open(this);
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI) {
            let data = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: data.id, cnt: data.cnt, showName: false });
        }

        private replace() {
            net.sendAndWait(new pb.cs_item_callback({ type: 92 })).then(async (data: pb.sc_item_callback) => {
                alert.showReward(data.item);
                clientCore.DialogMgr.ins.close(this);
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOk, Laya.Event.CLICK, this, this.replace);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}