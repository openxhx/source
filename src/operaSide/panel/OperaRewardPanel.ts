namespace operaSide {
    export class OperaRewardPanel extends ui.operaSide.panel.OperaRewardPanelUI {
        private _rewardState: number[] = [];
        constructor() {
            super();
            this.list_0.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list_1.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list_0.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list_1.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
            let config = xls.get(xls.dramaBaseData).get(1);
            let sex = clientCore.LocalInfo.sex;
            this.list_0.dataSource = sex == 1 ? config.participateAwardFemale : config.participateAwardMale;
            this.list_1.dataSource = sex == 1 ? config.winAwardFemale : config.winAwardMale;
            if (this._rewardState.length == 0) {
                net.sendAndWait(new pb.cs_final_fight_reward_panel()).then((data: pb.sc_final_fight_reward_panel) => {
                    this._rewardState = data.flag.slice();
                    this.updateRewardState();
                })
            }
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            clientCore.GlobalConfig.setRewardUI(cell, { id: data.v1, cnt: data.v2, showName: false, lock: false });
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.target, { id: e.currentTarget['dataSource'].v1 });
            }
        }

        private onGet(idx: number) {
            net.sendAndWait(new pb.cs_get_final_fight_reward({ type: idx + 1 })).then((data: pb.sc_get_final_fight_reward) => {
                alert.showReward(data.items);
                this._rewardState[idx] = 2;
                this.updateRewardState();
                util.RedPoint.reqRedPointRefresh(16201);
            })
        }

        private updateRewardState() {
            if (this._closed)
                return;
            for (let i = 0; i < 2; i++) {
                this['imgGet_' + i].visible = this._rewardState[i] == 2;
                this['btnGet_' + i].visible = this._rewardState[i] < 2;
                this['btnGet_' + i].disabled = this._rewardState[i] == 0;
            }
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGet_0, Laya.Event.CLICK, this, this.onGet, [0]);
            BC.addEvent(this, this.btnGet_1, Laya.Event.CLICK, this, this.onGet, [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}