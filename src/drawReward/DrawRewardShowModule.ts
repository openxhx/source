namespace drawReward {
    /**
     * drawReward.DrawRewardShowModule
     * 1抽、10连抽奖励 通用 展示
     */
    export class DrawRewardShowModule extends ui.drawReward.DrawRewardShowModuleUI {
        private _oncePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _rewardInfoArr: pb.GodTree[] | pb.drawReward[];
        private _showOneFlag: boolean;
        constructor() {
            super();
        }
        init(d: any) {
            this._rewardInfoArr = d;
            this._oncePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.addPreLoad(xls.load(xls.godTree));
        }
        popupOver() {
            this._showOneFlag = this._rewardInfoArr.length == 1;
            if (this._rewardInfoArr.length > 1) {
                clientCore.DialogMgr.ins.open(this._tenPanel, false);
                this._tenPanel.showReward(this._rewardInfoArr, this, this.waitOnePanelClose);
                this._tenPanel.on(Laya.Event.CLOSE, this, this.closeModule);
            }
            else {
                this.getOne(this._rewardInfoArr[0]);
                this._oncePanel.on(Laya.Event.CLOSE, this, this.closeModule);
            }
        }
        private closeModule() {
            console.log("close DrawRewardShowModule!!!");
            this.destroy();
        }
        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._oncePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }
        private async getOne(rwdInfo: pb.GodTree) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
                if (this._showOneFlag) {
                    this.destroy();
                }
            }
            else {
                clientCore.DialogMgr.ins.open(this._oncePanel, false);
                this._oncePanel.showReward(rwdInfo);
            }
        }
        destroy() {
            super.destroy();
            this._tenPanel.offAll();
            this._oncePanel.offAll();
            this._tenPanel = null;
            this._oncePanel = null;
        }
    }
}