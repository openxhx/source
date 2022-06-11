namespace scene.copy.child {
    /**
     * BOSS副本
     */
    export class CopyBoss extends CopyNoramlBase {

        /** 己方的角色*/
        public myRoles: pb.Irole_pos[];
        public anima: number;
        /** 战斗UI*/
        private _ui: battle.view.FightUI;

        constructor() { super(); }

        protected enterCopy(): void {
            super.enterCopy();
            // 创建我的队伍
            map.MapScene.ins.addWaves(unit.CampEnum.MY, this.myRoles);
            if (clientCore.SceneManager.ins.modMark) {
                let info = clientCore.SceneManager.ins.modMark;
                this.openMod = { moduleName: info.openWhenClose, data: info.openData };
            }
        }
        protected showBattleUI(): void {
            this._ui = new battle.view.FightUI();
            this._ui.addEventListeners();
            this._ui.initBossView(this.stageId);
            this._ui.updateAnima(this.anima);
            clientCore.LayerManager.battleUILayer.addChild(this._ui);
            // 进入房间
            battle.BattleRoom.ins.enter(1);
        }
        public dispose(): void {
            super.dispose();
            this._ui && this._ui.destroy();
            this.myRoles.length = 0;
            this._ui = this.myRoles = null;
            EventManager.event(globalEvent.MID_OPERA_EVENT_COMPLETE, this.stageId);
        }
    }
}