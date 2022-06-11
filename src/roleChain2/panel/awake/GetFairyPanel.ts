namespace roleChain2 {
    export class GetFairyPanel extends ui.roleChain2.panel.GetFairyPanelUI {
        private _fariyId: number;
        show(roleId: number) {
            this.sideClose = false;
            let awakeInfo = _.find(clientCore.role.RoleInfo.xlsAwakeData.getValues(), { 'rroleID': roleId });
            this._fariyId = awakeInfo.needCurrency;
            this.img.skin = pathConfig.getFairyIconPath(this._fariyId);
            let itemInfo = xls.get(xls.itemBag).get(this._fariyId);
            this.txtName.text = itemInfo.name;
            this.txtGetWay.text = itemInfo.channelType.map((o) => {
                return o.split('/')[0]
            }).join('\n');
            // this.txtGetWay.text = '神树抽取获得';
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onSee);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }


        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onSee() {
            let getWay = xls.get(xls.itemBag).get(this._fariyId)?.channelType;
            if (getWay && getWay[0]) {
                clientCore.ToolTip.gotoMod(parseInt(getWay[0].split('/')[1]));
            }
        }

        destroy() {
            super.destroy();
            BC.removeEvent(this);
        }
    }
}