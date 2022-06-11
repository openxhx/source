/// <reference path="CopyNormalBase.ts" />

namespace scene.copy.child {
    /**
     * 约会副本
     */
    export class CopyAffair extends CopyNoramlBase {
        /** 我的队伍*/
        public roles: pb.Irole_pos[];
        /** 灵气值*/
        public anima: number;
        /** 战斗UI*/
        private _ui: battle.view.FightUI;

        constructor() { super(); }

        protected enterCopy(): void {
            super.enterCopy();
            // 创建我的队伍
            map.MapScene.ins.addWaves(unit.CampEnum.MY, this.roles);
            this.openMod = { moduleName: 'roleChain2.RoleChainModule', data: 0 };
        }

        protected showBattleUI(): void {
            this._ui = new battle.view.FightUI();
            this._ui.addEventListeners();
            this._ui.initView(4, this.stageId);
            this._ui.updateAnima(this.anima);
            clientCore.LayerManager.battleUILayer.addChild(this._ui);
            // 进入房间
            battle.BattleRoom.ins.enter();
        }


        public dispose(): void {
            super.dispose();
            this._ui && this._ui.destroy();
            this.roles.length = 0;
            this._ui = this.roles = null;
        }
    }
}