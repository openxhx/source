namespace rechargeActivity {
    export class FlowerRwdBlockRender extends ui.rechargeActivity.flowerRender.FlowerRankRwdBlockRenderUI {
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        setData(infos: xls.giveFlowerReward[]) {
            this.list.dataSource = infos;
            this.list.repeatY = infos.length;
            this.imgTitle.skin = `rechargeActivity/rewardPrev/di${infos[0].type}.png`;
        }

        private onListRender(cell: ui.rechargeActivity.flowerRender.FlowerRankRewardRenderUI, idx: number) {
            let data = cell.dataSource as xls.giveFlowerReward;
            cell.txtDes.text = data.des;
            cell.item.num.visible = false;
            cell.item.ico.skin = data.iconId < 999 ? `res/giveFlower/${data.iconId}.png` : clientCore.ItemsInfo.getItemIconUrl(data.iconId);
            cell.btnPrev.visible = data.prevIdArr > 0;
            cell.item.imgBg.skin = data.quality != 0 ? `commonRes/iconType_${data.quality}.png` : clientCore.ItemsInfo.getItemIconBg(data.iconId);
            cell.txtName.text = data.name;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target instanceof HuaButton) {
                    let data = e.currentTarget['dataSource'] as xls.giveFlowerReward;
                    let id = data.prevIdArr;
                    if (xls.get(xls.bgshow).get(id)) {
                        clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: id, condition: '', limit: '' });
                    }
                    else {
                        clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
                    }
                }
            }
        }
    }
}