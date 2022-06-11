namespace cp {
    export class CpDivorcePanel extends ui.cp.panel.CpDivorcePanelUI {
        private readonly NEED_NUM: number;
        private readonly NEED_ID: number;
        private readonly OFFLINE_TIME: number;
        constructor() {
            super();
            let cost = xls.get(xls.cpCommonDate).get(1).forceCost;
            this.NEED_ID = cost.v1;
            this.NEED_NUM = cost.v2;
            this.OFFLINE_TIME = 15 * 24 * 3600;//15天
            this.imgCoin.skin = clientCore.ItemsInfo.getItemIconUrl(this.NEED_ID);
            this.txtNum.text = this.NEED_NUM.toString();
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            let cpInfo = clientCore.CpManager.instance.cpInfo;
            if (cpInfo) {
                this.btnPeace.disabled = cpInfo.status == clientCore.CP_STATU.WAIT_DIVORCE;
                this.btnPeace.fontSkin = cpInfo.status == clientCore.CP_STATU.WAIT_DIVORCE ? 'cp/l_p_waitres.png' : 'cp/l_p_sqjc.png';
                let offLineTime = clientCore.ServerManager.curServerTime - cpInfo.userBase.olLast;
                this.btnFree.disabled = offLineTime < this.OFFLINE_TIME;
                this.imgCondition.visible = offLineTime < this.OFFLINE_TIME;
            }
        }


        onClose() {
            clientCore.DialogMgr.ins.close(this);
            this._alert?.destroy();
        }

        private _type: number;
        private _alert: Laya.Sprite;
        private onDivorce(type: number) {
            this._type = type;
            let cpInfo = clientCore.CpManager.instance.cpInfo;
            this._alert = alert.showSmall(`你确定要与${cpInfo.userBase.nick}解除花缘吗？`, {
                callBack: {
                    caller: this, funArr: [
                        this.sureDivorce
                    ]
                }
            })
        }

        private sureDivorce() {
            clientCore.CpManager.instance.divorce(this._type).then(() => {
                this.onClose();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnPeace, Laya.Event.CLICK, this, this.onDivorce, [1]);
            BC.addEvent(this, this.btnFree, Laya.Event.CLICK, this, this.onDivorce, [2]);
            BC.addEvent(this, this.btnForce, Laya.Event.CLICK, this, this.onDivorce, [3]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}