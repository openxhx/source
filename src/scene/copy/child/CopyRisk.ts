
namespace scene.copy.child {
    /**
     * 冒险副本
     */
    export class CopyRisk extends CopyNoramlBase {

        /** 己方的角色*/
        public myRoles: pb.Irole_pos[];
        public anima: number;

        private _ui: battle.view.FightUI;

        constructor() { super(); }

        protected enterCopy(): void {
            super.enterCopy();
            // 创建我的队伍d
            map.MapScene.ins.addWaves(unit.CampEnum.MY, this.myRoles);
            this.openMod = { moduleName: 'adventure.AdventureModule', data: 0 };
        }

        protected showBattleUI(): void {
            this._ui = new battle.view.FightUI();
            this._ui.addEventListeners();
            this._ui.initView(1, this.stageId);
            this._ui.updateAnima(this.anima);
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
            if (msg.result != 2) {
                //胜利 检查是否有结尾动画需要播
                let xlsStage = xls.get(xls.stageBase).get(this.stageId);
                let aniBeforeBattle = _.find(xlsStage.movie, (ani) => { return ani.v1 == 2 });
                if (aniBeforeBattle)
                    clientCore.AnimateMovieManager.showAnimateMovie(aniBeforeBattle.v2.toString(), this, this.onBeforeBattleAniOver);
                else
                    this.onBeforeBattleAniOver();
            }
            else {
                Laya.timer.once(1000, this, this.onBeforeBattleAniOver);
            }
        }

        private onBeforeBattleAniOver() {
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