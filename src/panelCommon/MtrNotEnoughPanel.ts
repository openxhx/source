namespace panelCommon {
    /**
     * panelCommon.MtrNotEnoughPanel
     * 奖励包包含东西
     * 
     */
    export class MtrNotEnoughPanel extends ui.panelCommon.MtrNotEnoughPanelUI {
        private okHandler: laya.utils.Handler;

        private _count: number;

        private _needTip: boolean;
        constructor() {
            super();
            this.sideClose = true;
            this.itemList.vScrollBarSkin = "";
            this.itemList.renderHandler = new Laya.Handler(this, this.listRender);
            this.itemList.selectEnable = true;
            this.itemList.selectHandler = new Laya.Handler(this, this.listSelect);
        }

        init(data: { mtr: xls.pair[], handler: laya.utils.Handler }) {
            this._needTip = false;
            this.okHandler = data.handler;
            let count: number = 0;
            for (let i: number = 0; i < data.mtr.length; i++) {
                let haveNum = clientCore.ItemsInfo.getItemNum(data.mtr[i].v1);
                if (data.mtr[i].v2 > haveNum) {
                    count += (data.mtr[i].v2 - haveNum) * xls.get(xls.materialBag).get(data.mtr[i].v1).buy;
                }
            }
            this.itemList.repeatX = data.mtr.length;
            this.itemList.array = data.mtr;
            this._count = count;
            this.num.text = "x" + count.toString();
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            if (reward.v1 >= 730001 && reward.v1 <= 730008) this._needTip = true;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
            let have = clientCore.ItemsInfo.getItemNum(reward.v1);
            item.num.value = this.getNumToAbc(have, reward.v2) + "/" + reward.v2;
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

        private listSelect(index: number) {
            if (index == -1) return;
            let reward: xls.pair = this.itemList.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.itemList.cells[index], { id: reward.v1 });
            };
            this.itemList.selectedIndex = -1;
        }

        public onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        public onOk(e: Laya.Event) {
            this.onClose();
            if (this._needTip) {
                alert.showSmall("特殊材料在材料商店中购买更合算，是否确认继续用神叶购买？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            alert.useLeaf(this._count, this.okHandler);
                        }]
                    }
                });
            }else{
                alert.useLeaf(this._count, this.okHandler);
            }
        }

        public addEventListeners() {
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            this.btnOk.on(Laya.Event.CLICK, this, this.onOk);
        }

        public removeEventListeners() {
            this.btnClose.off(Laya.Event.CLICK, this, this.onClose);
            this.btnOk.off(Laya.Event.CLICK, this, this.onOk);
        }

        public destory() {
            this.okHandler.recover();
            super.destroy();
        }
    }
}