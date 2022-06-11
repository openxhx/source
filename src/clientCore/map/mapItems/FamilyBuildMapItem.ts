/// <reference path="MapItemBase.ts" />
namespace clientCore {
    export class FamilyBuildMapItem extends MapItemBase {
        constructor(info: MapItemInfo) {
            super(info);
        }
        public getImgPath(): string {
            // return "res/itemUI/familyBuilding/" + this.mapItemInfo.id + ".png";
            return pathConfig.getBuildingPath(this.mapItemInfo.id);
        }

        public openModule() {
            if (this.mapItemInfo.id == 499995) {/** 生命之树-家族信息 */
                ModuleManager.open("family.FamilyModule", { panel: "info", type: 1 });
            }
            else if (this.mapItemInfo.id == 499996) {/** 神树花园-活动 */
                if (this.mapItemInfo.lockState == 0) {
                    // alert.showFWords("仙游花园达到1级后开启家族活动");
                    ModuleManager.open("familyActivity.FamilyActivityInfoModule");
                    return;
                }

            }
            else if (this.mapItemInfo.id == 499997) {/** 神秘商店-神秘商店 */
                // if (this.mapItemInfo.lockState == 0) {
                //     alert.showFWords("神秘商店达到1级后开始营业");
                //     return;
                // }
                // let lv: number = clientCore.FamilyMgr.ins.calculateBuildLv(499997, this.mapItemInfo.donateNum);
                // if (lv == 0) {
                //     alert.showFWords("神秘商店达到1级后开始营业");
                //     return;
                // }

                clientCore.ModuleManager.open("commonShop.CommonShopModule", 4);
            }
            else if (this.mapItemInfo.id == 499998) {/** 裁缝小屋-裁缝小屋 */
                // if (this.mapItemInfo.lockState == 0) {
                //     alert.showFWords("裁缝小屋达到1级后开始营业");
                //     return;
                // }
                let lv: number = clientCore.FamilyMgr.ins.calculateBuildLv(499998, this.mapItemInfo.donateNum);
                // if (lv == 0) {
                //     alert.showFWords("裁缝小屋达到1级后开始营业");
                //     return;
                // }
                ModuleManager.open("familyTailor.FamilyTailorModule", { type: 0, lv: lv });
            }
        }
        public initProduceReward() {

        }

        public destroy() {
            super.destroy();
            this.removeSelf();
        }
    }
}