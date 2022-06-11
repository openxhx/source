
namespace saveFaeryInteract {

    export class SaveFaeryFightInfo extends ui.fightInfo.FightInfoModuleUI {
        private _dateStage: xls.stageBase;
        private _bone: clientCore.Bone;

        constructor() { super(); }

        init(stageId: number) {
            this._dateStage = xls.get(xls.stageBase).get(stageId);
            this.addPreLoad(clientCore.FormationControl.instance.initXml());
            // this.initView();
        }

        onPreloadOver(){
            this.initView();
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.goFight);
            BC.addEvent(this, this.btnBattleArray, Laya.Event.CLICK, this, this.goBattleArray);
        }
        public popupOver() {
        }
        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onCloseClick(){
            EventManager.event("SAVE_FAERY_FIGHT_EXIT");
            this.destroy();
        }

        public destroy(): void {
            this._bone && this._bone.dispose();
            this._bone = this._dateStage = null;
            super.destroy();
        }

        private initView(): void {
            this.txCon.text = this._dateStage.passStageConditionDesc;
            this.txDesc.text = this._dateStage.desc;
            // this.txChap.changeText(this._dateStage.stageId + "");
            this.txChap.visible = false;
            this.txTitle.changeText(this._dateStage.name);
            this.rePro.skin = pathConfig.getRoleAttrIco(this._dateStage.commend);
            this.recPower.changeText(this._dateStage.combat + "");
            this.imgTalkBg.height = this.txDesc.getBounds().height + 40;

            let seetArr: number[] = clientCore.FormationControl.instance.seatArr;
            let fight: number = 0;
            _.forEach(seetArr, (id: number) => {
                let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(id);
                role && (fight += role.fight);
            })

            this.currPower.changeText(fight + "");
            this.txTl.changeText("-" + this._dateStage.vim);
            // this.imgNoVim.visible = this._dateStage.vim == 0;
            let monsterInfo: xls.monsterBase = xls.get(xls.monsterBase).get(this._dateStage.display);
            if (monsterInfo) {
                // 显示怪物形象
                this._bone = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(monsterInfo.monAppear), "idle", true, this.boxCon);
                // 显示其他信息
                this.monsterPro.skin = pathConfig.getRoleAttrIco(monsterInfo.Identity);
                this.txMonsterName.text = monsterInfo.name;
            }
        }

        private async goFight(): Promise<void> {
            if(clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.HEALTH_ID) < this._dateStage.vim){
                alert.showFWords("体力不足");
                return;
            }
            let stageId: number = this._dateStage.id;
            await clientCore.SceneManager.ins.register();
            clientCore.SceneManager.ins.battleLayout(6, stageId);
            this.destroy();
        }

        private goBattleArray(): void {
            // this.destroy();
            clientCore.ModuleManager.open("battleArray.BattleArrayModule");
        }
    }
}