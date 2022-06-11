
namespace operaDrama {
    export class OperaDrawAlertPanel extends ui.operaDrama.panel.OperaDrawAlertPanelUI {

        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.sideClose = true;
            let rwdConfig = xls.get(xls.dramaAward).get(14);
            this.list.dataSource = clientCore.LocalInfo.sex == 1 ? rwdConfig.femaleAward : rwdConfig.maleAward;
            this.list.repeatX = this.list.length;
        }
        show() {
            clientCore.DialogMgr.ins.open(this);
            let rewardArr = _.filter(xls.get(xls.godTree).getValues(), o => o.module == 201);
            let allClothId = _.compact(_.map(rewardArr, (o) => {
                let reward = clientCore.LocalInfo.sex == 1 ? o.item : o.itemMale;
                let isCloth = xls.get(xls.itemCloth).has(reward.v1);
                return isCloth ? reward.v1 : 0;
            }));
            let getted = clientCore.OperaManager.instance.hasRewardCliamed(12);
            let allClothGet = _.filter(allClothId, id => clientCore.ItemsInfo.getItemNum(id) == 0).length == 0;
            this.imgGet.visible = getted;
            this.btnGet.visible = !getted;
            this.btnGet.disabled = !allClothGet;
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            clientCore.GlobalConfig.setRewardUI(cell, { id: cell.dataSource.v1 as number, cnt: 0, showName: false });
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.target, { id: this.list.getItem(idx).v1 });
            }
        }

        private onGet() {
            clientCore.OperaManager.instance.getRewardByIdx(12).then(() => {
                this.show();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }

    }
}