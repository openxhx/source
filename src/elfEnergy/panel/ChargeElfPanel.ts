namespace elfEnergy {
    export class ChargeElfPanel extends ui.elfEnergy.panel.ChargeElfPanelUI {
        private _id: number;

        init(d: any) {
            super.init(d);
        }

        show(info: clientCore.SpriteBuildQueueInfo) {
            this._id = info.id;
            clientCore.DialogMgr.ins.open(this);

            let xlsGlobal = xls.get(xls.globaltest).get(1).energyCost;
            let itemId = xlsGlobal.v1;
            let itemNum = xlsGlobal.v2;//每一itemId 增加的能量数
            this.txtPer.text = 'x' + itemNum;
            this.imgIcon_0.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
            this.imgIcon_1.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
            let lackEnergy = info.total - info.num;
            this.txtNum.text = lackEnergy.toString();
            let needUseNum = itemNum * lackEnergy;
            this.txtLeafNum.text = needUseNum.toString();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onChargeClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onChargeClick() {
            clientCore.BuildQueueManager.buySpirit(this._id).then(() => {
                this.onClose();
            });
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}