
namespace scene.copy.child {
    /**
     * 金币副本
     */
    export class CopyGold extends CopyNoramlBase {

        /** 己方的角色*/
        public myRoles: pb.Irole_pos[];
        public anima: number;

        private _ui: battle.view.FightUI;

        constructor() { super(); }

        protected enterCopy(): void {
            super.enterCopy();
            // 创建我的队伍d
            map.MapScene.ins.addWaves(unit.CampEnum.MY, this.myRoles);
            this.openMod = { moduleName: 'adventureAct.AdventureActModule' };
        }

        protected showBattleUI(): void {
            this._ui = new battle.view.FightUI();
            this._ui.addEventListeners();
            this._ui.initView(5, this.stageId);
            this._ui.updateAnima(this.anima);
            this._ui.htmlWave.visible = false;
            this._ui.htmlBout.x = 710;
            this._ui.btnJump.visible = false;
            this._ui.spMask.visible = false;
            clientCore.LayerManager.battleUILayer.addChild(this._ui);
            // 进入房间
            battle.BattleRoom.ins.enter();
        }

        private _resultMod: battle.result.IResult;
        private _resultMsg: pb.sc_battle_finish;
        protected openFinish(msg: pb.sc_battle_finish): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "battleFightComplete") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this._resultMod = msg.result == 2 ? new battle.result.ResultFailPanel() : new battle.result.ResultSucPanel();
            this._resultMsg = msg;
            this._resultMod.show(this._resultMsg);
        }

        public dispose(): void {
            super.dispose();
            this._ui.destroy();
            this._ui = null;
            this.myRoles = null;
            EventManager.event(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, this.stageId);
        }
    }
}