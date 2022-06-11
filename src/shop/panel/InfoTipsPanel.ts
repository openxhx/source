namespace shop {
    export class InfoTipsPanle extends ui.shop.panel.InfoTipsPanelUI {
        constructor() {
            super();
        }
        show(id: number) {
            this.item.txtName.visible = true;
            this.item.num.visible = false;
            if (xls.get(xls.manageBuildingId).has(id)) {
                let formulaID = xls.get(xls.manageBuildingId).get(id).unlock1Formula;
                let itemID = xls.get(xls.manageBuildingFormula).get(formulaID).outputItem;
                let time = xls.get(xls.manageBuildingFormula).get(formulaID).timeS;
                this.item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(itemID);
                this.item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(itemID);
                this.item.txtName.text = clientCore.ItemsInfo.getItemName(itemID);
                this.txtTime.text = util.StringUtils.getTimeStr2(time);
                this.txtTitle.text = '初始生产上限';
                let buildType = xls.get(xls.manageBuildingId).get(id).buildingType;
                let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(buildType, 1);
                this.txtNum.text = upgradeInfo.stackLimit.toString();

            }
            else {
                let itemId = clientCore.SeedFlowerRelateConf.getRelateID(id);
                let outputId = xls.get(xls.flowerPlant).get(itemId).outputItem;
                this.item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(outputId);
                this.item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(outputId);
                this.item.txtName.text = clientCore.ItemsInfo.getItemName(outputId);
                this.txtNum.text = clientCore.FlowerGrowConf.getFlowerMaxGrowNum(itemId, 0).toString();
                let growUp = xls.get(xls.flowerPlant).get(itemId).growUp;
                this.txtTime.text = util.StringUtils.getTimeStr2(_.sum(growUp));
                this.txtTitle.text = '初始生产数量';
            }
        }
    }
}