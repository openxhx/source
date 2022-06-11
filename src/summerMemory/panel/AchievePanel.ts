namespace summerMemory {
    export class AchievePanel extends ui.summerMemory.panel.AchievementPanelUI {
        private _sign: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        public setInfo(sign: number) {
            this._sign = sign;
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            let reward = clientCore.LocalInfo.sex == 1 ? [117987, 113587, 133760] : [117988, 113588, 133768];
            let limit = [60, 40, 20];
            let type = ["小鱼", "大鱼", "彩虹鱼"];
            for (let i: number = 0; i < 3; i++) {
                clientCore.GlobalConfig.setRewardUI(this["item" + (i + 1)], { id: reward[i], cnt: 1, showName: true });
                this["imgGet" + (i + 1)].visible = clientCore.ItemsInfo.checkHaveItem(reward[i]);
                this["btnGet" + (i + 1)].visible = !this["imgGet" + (i + 1)].visible;
                this["btnGet" + (i + 1)].disabled = model.fishCnt[i] < limit[i];
                this["labContent" + (i + 1)].text = `共捕获${model.fishCnt[i]}/${limit[i]}${type[i]}`;
            }
        }

        private showTips(idx: number) {
            let reward = clientCore.LocalInfo.sex == 1 ? [117987, 113587, 133760] : [117988, 113588, 133768];
            let item = this["item" + idx];
            let id = reward[idx - 1];
            clientCore.ToolTip.showTips(item, { id: id });
        }

        addEventListeners() {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["btnGet" + i], Laya.Event.CLICK, this, this.toBuy, [i]);
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.showTips, [i]);
            }
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        toBuy(idx: number) {
            let type: number = idx == 1 ? 1 : idx + 1;
            net.sendAndWait(new pb.cs_summer_memory_get_achievement({ type: type })).then((msg: pb.sc_summer_memory_get_achievement) => {
                alert.showReward(msg.items);
                this["imgGet" + idx].visible = true;
                this["btnGet" + idx].visible = false;
            })
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }

    }
}