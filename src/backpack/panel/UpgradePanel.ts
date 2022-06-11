namespace backpack.panel {
    /**
     * 升级仓库
     */
    export class UpgradePanel extends ui.backpack.UpgradePanelUI {
        private cost: number = 0;
        constructor() {
            super();
        }

        public show(): void {
            clientCore.DialogMgr.ins.open(this);
            this.updateView();
        }

        public updateView(): void {
            let id = 1511002;
            let num = clientCore.ItemsInfo.getItemNum(id);
            this.txtNow.text = clientCore.LocalInfo.pkgSize.toString();
            let expandNum = xls.get(xls.itemBag).get(id).value * num;
            let all = clientCore.LocalInfo.pkgSize + expandNum
            if (all > 15990) {
                this.cost = num - Math.floor((all - 15990) / xls.get(xls.itemBag).get(id).value);
                all = 15990;
            } else {
                this.cost = num;
            }
            this.txtNum.text = 'x' + this.cost;
            this.txtTo.text = all.toString();
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnUpgrade, Laya.Event.CLICK, this, this.onUpgrade);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.updateView);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.updateView);
        }

        private onUpgrade(): void {
            net.sendAndWait(new pb.cs_mts_warehouse_capacity({ itemNum: this.cost }))
                .then((data: pb.sc_mts_warehouse_capacity) => {
                    core.SoundManager.instance.playSound(pathConfig.getSoundUrl('extend'));
                    alert.showFWords("仓库升级成功~");
                    clientCore.LocalInfo.pkgSize = data.size;
                    this.updateView();
                    EventManager.event(globalEvent.BACKPACK_UPGRADE);
                    this.hide();
                }).catch((data) => {

                });
        }
    }
}