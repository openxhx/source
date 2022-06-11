namespace family.panel {
    /**
     * 捐献面板
     */
    export class DonatePanel extends ui.family.panel.DonatePanelUI {

        private xlsFamily: xls.family;
        private buildId: number;
        // private _maxNum:number;
        // private _curNum:number;

        constructor() {
            super();
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
            this.list.scrollBar.touchScrollEnable = false;
            this.list.array = new Array(4);
            this.xlsFamily = xls.get(xls.family).get(1);
            this.htmlTx.style.width = 126;
            this.htmlTx.style.align = "center";
            this.htmlTx.style.fontSize = 22;
            this.htmlTx.style.font = "汉仪中圆简";

        }

        show(buildId: number): void {
            this.buildId = buildId;
            clientCore.DialogMgr.ins.open(this);
            this.updateView();
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public updateView(): void {
            this.list.refresh();
            this.updateCnt();
        }

        private updateCnt(): void {
            let max: number = clientCore.FamilyMgr.ins.svrMsg.donateBaseCnt + clientCore.FamilyMgr.ins.svrMsg.donateVipCnt;
            let curr: number = clientCore.FamilyMgr.ins.svrMsg.donatedCnt;
            let array: string[] = [`${Math.max(0,max - curr)}/${max}`, "#ffffff"];
            let isAdd: boolean = this.boxVip.visible = clientCore.FamilyMgr.ins.svrMsg.donateVipCnt > 0;
            if (isAdd) {
                this.vipLv.value = clientCore.LocalInfo.vipLv + "";
                array.push(`(+${clientCore.FamilyMgr.ins.svrMsg.donateVipCnt})`);
                // array.push("#f112ff");
                array.push("#fcff00");
            }
            this.htmlTx.innerHTML = util.StringUtils.getColorText2(array);
        }

        private listRender(item: ui.family.item.DonateItemUI, index: number): void {
            let costs: xls.pair[] = [this.xlsFamily.genDonate, this.xlsFamily.midDonate, this.xlsFamily.advDonate, this.xlsFamily.specialDonate];
            let gains: xls.pair[] = [this.xlsFamily.genGain, this.xlsFamily.midGain, this.xlsFamily.advGain, this.xlsFamily.specialGain];
            let id: number = costs[index].v1;
            let cnt: number = costs[index].v2;
            let has: number = clientCore.ItemsInfo.getItemNum(id);
            item.txCost.color = has < cnt ? "#f40e0e" : "#805329";
            item.txCost.changeText(cnt + "");
            item.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.txDonate.changeText("个人贡献 " + "+" + gains[index].v1);
            item.txMoney.changeText("建筑经验 " + "+" + gains[index].v2);
            item.txType.changeText(["基础捐献", "中级捐献", "高级捐献", "特殊捐献"][index]);
            item.imgBG.skin = "unpack/family/" + (index + 1) + ".png";

            (item.getChildByName("donate") as Laya.Button).disabled = !clientCore.FamilyMgr.ins.checkDonate() || has < cnt;
        }

        private listMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            if (e.target.name == "donate") {
                FamilySCommand.ins.donateBuild(this.buildId, index + 1);
            }
        }
    }
}