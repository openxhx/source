namespace doubleNinth {
    export class RewardPanel extends ui.doubleNinth.panel.RewardPanelUI {
        private curShowId: number;
        private probabilityInfo: xls.probability[];
        show(curId: number) {
            if (clientCore.LocalInfo.sex == 1) {
                this.caomuSuit.skin = "unpack/doubleNinth/5492.png";
                this.yaoshiSuit.skin = "unpack/doubleNinth/5360.png";
            } else {
                this.caomuSuit.skin = "unpack/doubleNinth/5493.png";
                this.yaoshiSuit.skin = "unpack/doubleNinth/5361.png";
            }
            this.listCloth.renderHandler = new Laya.Handler(this, this.showDetailReward);
            this.listOther.renderHandler = new Laya.Handler(this, this.showDetailReward);
            this.listCloth.mouseHandler = new Laya.Handler(this, this.rewardClick, [0]);
            this.listOther.mouseHandler = new Laya.Handler(this, this.rewardClick, [1]);
            this.listCloth1.renderHandler = new Laya.Handler(this, this.showDetailReward);
            this.listOther1.renderHandler = new Laya.Handler(this, this.showDetailReward);
            this.listCloth1.mouseHandler = new Laya.Handler(this, this.rewardClick, [2]);
            this.listOther1.mouseHandler = new Laya.Handler(this, this.rewardClick, [3]);
            let suit1 = clientCore.SuitsInfo.getSuitInfo(2110517);
            let suit2 = clientCore.SuitsInfo.getSuitInfo(2110516);
            this.lab0.changeText(suit1.hasCnt + "/" + suit1.clothes.length);
            this.lab1.changeText(suit2.hasCnt + "/" + suit2.clothes.length);
            this.curShowId = curId;
            this.curListIdx = "";
            this.showDetail("", curId);
            clientCore.DialogMgr.ins.open(this);
            this.changeDot();
        }

        private showDetail(list: string, id: number) {
            let cfg = _.filter(xls.get(xls.godTree).getValues(), (o) => { return o.module == id });
            let cloths: xls.pair[] = [];
            let other: xls.pair[] = [];
            for (let i: number = 0; i < cfg.length; i++) {
                if (cfg[i].type == 3) cloths.push(clientCore.LocalInfo.sex == 1 ? cfg[i].item : cfg[i].itemMale);
                else other.push(clientCore.LocalInfo.sex == 1 ? cfg[i].item : cfg[i].itemMale);
            }
            this.probabilityInfo = _.filter(xls.get(xls.probability).getValues(), (element) => { return element.type == id - 1069 });
            this["listCloth" + list].array = cloths;
            this["listOther" + list].array = other;

        }

        private async changePage(flag: number) {
            let nextPage = this.curShowId + flag;
            if (nextPage < 1102) nextPage = 1105;
            if (nextPage > 1105) nextPage = 1102;
            let nextList = this.curListIdx == "" ? "1" : "";
            this.showDetail(nextList, nextPage);
            this["listCloth" + nextList].x = this["listOther" + nextList].x = flag > 0 ? 510 : -510;
            this.mouseEnabled = false;
            this.moveList(flag);
            await util.TimeUtil.awaitTime(1100);
            this.mouseEnabled = true;
            this.curShowId = nextPage;
            this.curListIdx = nextList;
            this.changeDot();
        }
        /**改变批次 */
        private changeDot() {
            for (let i = 0; i < 4; i++) {
                this["dot_" + i].skin = (this.curShowId - 1102) == i ? "doubleNinth/dot_1.png" : "doubleNinth/dot_0.png";
            }
            for (let i = 0; i < 4; i++) {
                if (this.curShowId == 1102 + i) {
                    this.labNum.changeText(`奖励批次：${1 + i}/4`);
                }
            }
        }

        private moveList(flag: number) {
            let arr = [this.listCloth, this.listOther, this.listCloth1, this.listOther1];
            for (let i = 0; i < arr.length; i++) {
                let list = arr[i];
                let target = list.x - flag * 510;
                Laya.Tween.to(list, { x: target }, 1000, null);
            }
        }

        //#region 界面滑动切换
        private downPos: number;
        private curListIdx: string;
        private onMouseDown(e: Laya.Event) {
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.downPos = e.currentTarget.mouseX;
        }

        private onMouseUp(e: Laya.Event) {
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            let upPos = e.currentTarget.mouseX;
            let dis = Math.abs(upPos - this.downPos);
            if (dis > 20) {
                let flag = upPos > this.downPos ? -1 : 1;
                this.changePage(flag);
            }
        }
        //#endregion

        addEventListeners() {
            BC.addEvent(this, this.btntry0, Laya.Event.CLICK, this, this.onTry, [2110517]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [2110516]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.probabilityInfo = null;
            super.destroy();
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onTry(id: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
        }

        private showDetailReward(cell: ui.doubleNinth.render.RewardItemUI) {
            let reward: xls.pair = cell.dataSource;
            clientCore.GlobalConfig.setRewardUI(cell.item, { id: reward.v1, cnt: reward.v2, showName: true });
            cell.item.txtName.color = "#ffffff";
            let cfg = _.find(this.probabilityInfo, (o) => { return reward.v1 == (clientCore.LocalInfo.sex == 1 ? o.itemIdFemale.v1 : o.itemIdMale.v1) });
            cell.txtProbability.text = (util.tofix2(cfg.probability * 100, 2) + "%");
            cell.imgGet.visible = xls.get(xls.itemCloth).has(reward.v1) && clientCore.LocalInfo.checkHaveCloth(reward.v1);
        }

        private rewardClick(type: number, e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let list = [this.listCloth, this.listOther, this.listCloth1, this.listOther1][type];
                let id = list.getCell(idx).dataSource.v1;
                clientCore.ToolTip.showTips(list.getCell(idx), { id: id });
            }
        }
    }
}