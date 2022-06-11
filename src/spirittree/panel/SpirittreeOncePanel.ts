namespace spirittree {
    export class SpirittreeOncePanel extends ui.spirittree.panel.oncePanelUI {
        private _type: number;
        constructor() {
            super();
            this.sideClose = false;
        }

        public showReward(treeInfo: pb.IGodTree) {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClick);
            let xlsInfo = xls.get(xls.godTree).get(treeInfo.id);
            this._type = xlsInfo.type;
            if (xlsInfo.type == 1 || xlsInfo.type == 2) {
                this.boxRole.visible = false;
                this.playAni();
            }
            else if (xlsInfo.type == 5) {
                this.boxMain.visible = false;
                this.imgBgAni.visible = false;
                this.playRoleAni();
                this.showRoleInfo(treeInfo.id);
                return;
            }
            else {
                this.boxRole.visible = false;
                this.boxKing.visible = false;
                this.imgBgAni.visible = false;
                this.boxMain.visible = true;
                this.aniKing.paused();
            }
            let itemInfo = parseReward(treeInfo);
            if (itemInfo) {
                let name = itemInfo.reward.name.replace(/\（|\(/g, "︵").replace(/\）|\)/g, "︶");
                let num = itemInfo.reward.num;
                this.imgBg.skin = `unpack/spirittree/${xlsInfo.type}.png`;
                this.mcItemImg.skin = itemInfo.reward.iconUrl;
                this.txtName.text = name + (num > 1 ? `x${num}` : '');
                //分解
                if (itemInfo.decomp) {
                    this.txtDecomp.text = `重复获得分解为${itemInfo.decomp.name} x${itemInfo.decomp.num}`;
                }
                else {
                    this.txtDecomp.text = '';
                }
            }
        }
        popupOver() {

        }

        private async playRoleAni() {
            this.boxKing.visible = true;
            this.boxRole.visible = false;
            this.boxMain.visible = false;
            this.imgBgAni.visible = false;
            await this.waitAniLabel();
            this.boxRole.visible = true;
            this.boxMain.visible = false;
            this.imgBgAni.visible = false;
            await this.waitAniOver();
            this.boxKing.visible = false;
            this.boxMain.visible = false;
            this.imgBgAni.visible = false;
            console.log("role movie play over!");

        }
        private showRoleInfo(packageID: number) {
            let roleID = xls.get(xls.godTree).get(packageID).item.v1;
            console.log("------------------ 角色ID："+roleID);
            let xlsRole = xls.get(xls.characterId).get(roleID);
            console.log(xlsRole);
            this.skRole.load(pathConfig.getRoleBattleSk(roleID), new Laya.Handler(this, this.onRoleSkLoaded));
            this.imgRole.skin = pathConfig.getRoleUI(roleID);
            this.imgName.skin = pathConfig.getRoleName(xlsRole.mutexId);
            this.imgBattleTyle.skin = pathConfig.getRoleBattleTypeIcon(xlsRole.battleType);
            this.imgAttr.skin = pathConfig.getRoleAttrIco(xlsRole.Identity);
        }
        private onRoleSkLoaded() {
            this.skRole.play('idle', true);
        }

        private async playAni() {
            this.boxKing.visible = true;
            this.imgBgAni.visible = false;
            this.boxMain.visible = false;
            this.boxRole.visible = false;
            await this.waitAniLabel();
            this.boxMain.visible = true;
            this.imgBgAni.visible = true;
            await this.waitAniOver();
            this.boxKing.visible = false;
            // this.boxRole.visible = false;
            console.log("fairy movie play over!");

            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitShowOneRewardPanel") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private waitAniLabel() {
            return new Promise((ok) => {
                this.ani1.play(0, false);
                this.aniKing.play(0, false);
                this.ani1.once(Laya.Event.LABEL, this, ok);
            })
        }

        private waitAniOver() {
            return new Promise((ok) => {
                this.ani1.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private onClick() {
            if (this.boxKing.visible) {
                this.boxKing.visible = false;
                this.ani1.stop();
                this.ani1.offAll();
                this._type == 5 ? this.boxRole.visible = true : this.boxMain.visible = true;
                this._type != 5 && (this.imgBgAni.visible = true);
            }
            else {
                clientCore.DialogMgr.ins.close(this, false);
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickCloseOneRewardPanel") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}