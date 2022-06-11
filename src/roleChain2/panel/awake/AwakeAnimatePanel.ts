namespace roleChain2 {
    /**觉醒动画面板 */
    export class AwakeAnimatePanel extends ui.roleChain2.panel.AwakeAnimationPanelUI {
        private _awakeInfo: xls.awakeBase;
        constructor() {
            super();
            this.sideClose = false;
        }

        public setData(info: xls.awakeBase) {
            this._awakeInfo = info;
            this.boxInfo.visible = false;
            this.boxAni.visible = true;
            //动画相关
            this.setCardInfo(this._awakeInfo.froleID);
            this.sk.load('res/animate/awake/skeleton.sk', new Laya.Handler(this, this.onSkLoaded));
            this.imgFairy.skin = pathConfig.getFairyIconPath(info.needCurrency);
            //信息相关
            let roleId = info.rroleID;
            let xlsRole = clientCore.role.RoleInfo.xlsIdData.get(roleId);
            this.skRole.load(pathConfig.getRoleBattleSk(roleId), new Laya.Handler(this, this.onRoleSkLoaded));
            this.imgRole.skin = pathConfig.getRoleUI(roleId);
            this.imgName.skin = pathConfig.getRoleName(xlsRole.mutexId);
            this.imgBattleTyle.skin = pathConfig.getRoleBattleTypeIcon(xlsRole.battleType);
            this.imgAttr.skin = pathConfig.getRoleAttrIco(xlsRole.Identity);
            BC.addEvent(this, this.btnSee, Laya.Event.CLICK, this, this.onSee);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "AwakeAnimatePanel") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        private onSkLoaded() {
            this.sk.once(Laya.Event.STOPPED, this, this.onAniOver);
            this.sk.on(Laya.Event.LABEL, this, this.onLabel);
            this.ani3.once(Laya.Event.LABEL, this, () => {
                this.sk.play(0, false);
            });
            this.ani3.play(0, false);
        }

        private onRoleSkLoaded() {
            this.skRole.play('idle', true);
        }
        // private stopNow(){
        //     if(clientCore.GuideMainManager.instance.isGuideAction)
        //     {
        //         return;
        //     }
        //     this.onAniOver();
        // }
        private onAniOver() {
            this.sk.stop();
            this.boxAni.visible = false;
            this.boxInfo.visible = true;

            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitAwakeMoviePlayOver") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private onLabel(e) {
            if (e.name == 'start') {
                this.ani1.play(0, false);
            }
            else {
                this.setCardInfo(this._awakeInfo.rroleID);
                this.ani2.play(0, false);
                this.ani4.play(0, false);
            }
        }

        private onSee() {
            clientCore.DialogMgr.ins.close(this);
            clientCore.ModuleManager.closeModuleByName('roleChain2');
            clientCore.ModuleManager.open('foster.FosterModule', this._awakeInfo.rroleID);
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAwakeBtnSee") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private setCardInfo(id: number) {
            this.imgAniRole.skin = pathConfig.getRoleUI(id)
            return;
        }

        private getStarDataSource(star: number) {
            return _.map(new Array(5), (v, idx) => {
                let a = (idx + 1) * 2;
                let b = a - 1;
                if (a <= star) {
                    return { 'index': 2 };
                }
                else if (b <= star) {
                    return { 'index': 1 };
                }
                else {
                    return { 'index': 0 };
                }
            })
        }
    }
}