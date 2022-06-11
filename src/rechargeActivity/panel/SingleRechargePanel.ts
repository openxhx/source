namespace rechargeActivity {
    export class SingleRechargePanel extends BasePanel {
        constructor() {
            super();
        }
        init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info) {
            super.init(data, info);
            this._mainUI = new ui.rechargeActivity.panel.SingleRechargePanelUI();
            this.addChild(this._mainUI);
            this.initPanel();
            this.addEventListenters();
            this._mainUI['imgBg'].skin = clientCore.LocalInfo.sex == 1 ? 'unpack/rechargeActivity/singleFemale.png' : 'unpack/rechargeActivity/singleMale.png'
        }
        refreshGetBitData() {
            this.bitData = this.rechargeInfo.singlePayStatus;
        }
        protected itemRender(item: RechargeRender, index: number) {
            item.setInfo(this.type, item.dataSource, this.rechargeInfo.singlePayMaxCnt);
        }
        hide() {
            this.removeSelf();
        }
        private onTry(idx: number) {
            let idArr = [2100249, 2110171, 1000054, 2100245]
            alert.showPreviewModule(idArr[idx]);
        }
        addEventListenters() {
            super.addEventListenters();
            for (let i = 0; i < 4; i++) {
                BC.addEvent(this, this._mainUI['btnTry_' + i], Laya.Event.CLICK, this, this.onTry, [i]);
            }
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}