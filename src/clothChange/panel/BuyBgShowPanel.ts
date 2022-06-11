namespace clothChange{
    export enum ContinueType{
        bgShow,
        max
    }
    export interface ContinueInfo{
        targetId:number;
        targetType:ContinueType;
        cost:xls.pair;
        costTime:number;
        name:string;
    }
    export class BuyBgShowPanel extends ui.clothChange.panel.BuyBgShowPanelUI{
        private curInfo:ContinueInfo = null;
        constructor() {
            super()
            this.sideClose = true;
        }

        show(data:ContinueInfo) {
            this.curInfo = data;
            this.updateView(data);
        }

        private updateView(info:ContinueInfo) {
            this.txtCost.text = info.cost.v2.toString();
            this.txtName.text = info.name;
            this.txtEffect.text = `续费${info.costTime}天吗？`;
        }

        private async onSure() {
            if(!this.curInfo) return;
            let showNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SHOW_MONEY_ID);
            let price = this.curInfo.cost.v2;
            if(showNum < price){
                alert.alertQuickBuy(clientCore.MoneyManager.SHOW_MONEY_ID, price - showNum, true);
                return;
            }
            let msg;
            switch(this.curInfo.targetType){
                case ContinueType.bgShow:
                    msg = new pb.cs_buy_time_limit_attire({ attireId: this.curInfo.targetId });
                    break;
                default:
                    return;
            }
            net.sendAndWait(msg).then(()=>{
                this.onCancle();
            });
        }

        private onCancle() {
            this.curInfo = null;
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onCancle);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}