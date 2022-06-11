namespace kitchen {
    export class MakeResultPanel extends ui.kitchen.panel.MakeResultPanelUI {
        private ani:clientCore.Bone;
        private result:number;
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listSelect);
        }

        show(result: number, id: number) {
            this.labName.text = clientCore.ItemsInfo.getItemName(id);
            this.icon.skin = clientCore.ItemsInfo.getItemUIUrl(id);
            this.labDes.text = clientCore.ItemsInfo.getItemDesc(id);
            this.result = result;
            if (result == 1) {
                this.imgResult.skin = "unpack/kitchen/lose.png";
                this.boxMaterial.visible = false;
            } else if (result == 0) {
                this.imgResult.skin = "unpack/kitchen/win.png";
                this.boxMaterial.visible = true;
                this.list.array = xls.get(xls.diningRecipe).get(id).material;
            }
            clientCore.DialogMgr.ins.open(this);
        }

        popupOver() {
            this.sideClose = true;
            if(this.result == 0){
                this.ani = clientCore.BoneMgr.ins.play("res/animate/restaurant/star.sk", "animation", false, this.boxAni);
            }
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let mtr: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: mtr.v1, cnt: mtr.v2, showName: false });
            item.num.value = mtr.v2.toString();
            item.num.visible = true;
        }

        private listSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: this.list.array[index].v1 });
            }
        }

        destroy() {
            this.sideClose = false;
            this.ani?.dispose();
            this.ani = null;
            super.destroy();
        }
    }
}