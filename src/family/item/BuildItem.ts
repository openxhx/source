namespace family.item {
    export class BuildItem extends ui.family.item.BuildItemUI {


        constructor() {
            super();

            this.htmlExp.style.fontSize = 20;
            this.htmlExp.style.width = 196;
            this.htmlExp.style.align = "center";
        }

        public setInfo(info: pb.Build): void {
            let donate: number = info.attrs.fAttrs.donate;
            let xlsData: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(info.buildId);
            let lv: number = info.buildId == FamilyConstant.TREE_ID ? FamilyModel.ins.treeLv : clientCore.FamilyMgr.ins.calculateBuildLv(info.buildId, donate);
            let isLock: boolean = info.attrs.fAttrs.locked == 0;
            this.txName.changeText(xlsData.name);
            this.imgZ.visible = info.buildId == FamilyConstant.TREE_ID;
            this.txLv.changeText(lv + "");
            this.imgIco.skin = pathConfig.getBuildingIconPath(info.buildId);


            //神树最大等级
            if (info.buildId == FamilyConstant.TREE_ID && lv >= clientCore.BuildingUpgradeConf.getMaxLevel(xlsData.buildingType)) {
                this.imgLock.visible = this.boxMax.visible = this.boxBar.visible = false;
                this.boxTreeMax.visible = true;
                let cls: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(xlsData.buildingType, lv - 1);
                this.txMaxExp.changeText(`存储经验：${donate - cls.item[0].v2}`);
                return;
            }

            //经验部分
            this.boxBar.visible = !isLock;
            if (!isLock) {
                let tag: number = info.buildId == FamilyConstant.TREE_ID ? lv - 1 : lv;
                let lastXls: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(xlsData.buildingType, tag);
                let hasExp: number = lastXls ? lastXls.item[0].v2 : 0;
                let xlsUpgrade: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getNextUpgradeInfoByTypeAndLevel(xlsData.buildingType, tag);
                let needExp: number = xlsUpgrade.item[0].v2 - hasExp;
                let currExp: number = donate - hasExp;
                this.htmlExp.innerHTML = util.StringUtils.getColorText2([currExp + "", "#fffc00", "/" + needExp, "#FFFFFF"]);
                this.imgBar.width = Math.min(currExp / needExp * 148, 148);
            }

            //上锁和捐献的显示
            let needLock: boolean = isLock && lv == 0;
            this.box.filters = needLock ? util.DisplayUtil.darkFilter : [];
            this.imgLock.visible = needLock;
            this.boxMax.visible = isLock && lv != 0;
            this.boxMax.visible && this.txLockDesc.changeText(lv < FamilyModel.ins.treeLv ? "管理员未解锁建筑" : "已达当前等级上限");
        }

    }
}