namespace tigerBless {
    /**
     * 萌虎送福
     * tigerBless.TigerBlessModule
     */
    export class TigerBlessModule extends ui.tigerBless.TigerBlessModuleUI {
        private tigerIds: number[];
        private rewardId: number;
        private titleId: number = 3500100;
        private curHave: number;
        init() {
            this.sideClose = true;
            this.tigerIds = clientCore.LocalInfo.sex == 1 ? [150355, 150356, 150357, 150358, 150359, 150360, 150361, 150362, 150363] : [150364, 150365, 150366, 150367, 150368, 150369, 150370, 150371, 150372];
            this.rewardId = clientCore.LocalInfo.sex == 1 ? 150373 : 150374;
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年1月14日活动', '【活动】萌虎送福', '打开活动面板');
            this.curHave = 0;
            for (let i = 0; i < 9; i++) {
                if (clientCore.ItemsInfo.checkHaveItem(this.tigerIds[i])) {
                    this.curHave++;
                    this["item" + i].skin = "tigerBless/di_2.png";
                }
            }
            let haveReward = clientCore.ItemsInfo.checkHaveItem(this.rewardId);
            this.btnGet1.visible = !haveReward;
            this.labPro1.text = haveReward ? "已领取" : `已收集:${this.curHave}/6`;
            let haveTitle = clientCore.TitleManager.ins.checkHaveTitle(this.titleId);
            this.btnGet2.visible = !haveTitle;
            this.labPro2.text = haveTitle ? "已领取" : `已收集:${this.curHave}/9`;
        }

        private getReward(idx: number) {
            let need = idx == 1 ? 6 : 9;
            if (this.curHave < need) {
                alert.showFWords("未达成条件");
                return;
            }
            this["btnGet" + idx].visible = false;
            net.sendAndWait(new pb.cs_cute_tiger_night_reward({ flag: idx })).then((msg: pb.sc_cute_tiger_night_reward) => {
                alert.showReward(msg.item);
                this["labPro" + idx].text = "已领取";
            })
        }

        private tryHands(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.tigerIds[idx]);
        }

        private showTip(idx: number) {
            clientCore.ToolTip.showTips(this["item" + idx], { id: this.tigerIds[idx] });
        }

        private showTipById(type: number) {
            let id = type == 1 ? this.rewardId : this.titleId;
            let item = type == 1 ? this.imgReward : this.imgTitle;
            clientCore.ToolTip.showTips(item, { id: id });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGet1, Laya.Event.CLICK, this, this.getReward, [1]);
            BC.addEvent(this, this.btnGet2, Laya.Event.CLICK, this, this.getReward, [2]);
            BC.addEvent(this, this.imgReward, Laya.Event.CLICK, this, this.showTipById, [1]);
            BC.addEvent(this, this.imgTitle, Laya.Event.CLICK, this, this.showTipById, [2]);
            for (let i = 0; i < 9; i++) {
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.showTip, [i]);
                BC.addEvent(this, this["btnTry" + i], Laya.Event.CLICK, this, this.tryHands, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.tigerIds = null;
            super.destroy();
        }
    }
}