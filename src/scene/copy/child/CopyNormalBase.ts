namespace scene.copy.child {
    /**
     * 普通的副本基础
     */
    export class CopyNoramlBase extends CopyBase {

        /** 当前关卡*/
        public stageId: number;

        constructor() { super(); }

        protected enterCopy(): void {
            // 监听战斗结束
            BC.addEvent(this, EventManager, battle.BattleConstant.FIGHT_FINISH, this, this.next);
        }

        protected playMusic(): void {
            // 播放战斗音乐
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('fight'));
            battle.BattleConfig.playMusic ? core.SoundManager.instance.resumeBgm() : core.SoundManager.instance.pauseBgm();
        }

        protected next(msg: pb.sc_battle_finish): void {
            battle.BattleRoom.ins.exit();
            clientCore.SystemOpenManager.fightSuccFlag = msg.result == 3;
            switch (msg.result) {
                case 1://胜利
                    Laya.timer.once(2000, this, this.move); //两秒后移动
                    break;
                case 2://失败
                case 3://通关
                    this.openFinish(msg);
                    break;
                case 0:
                case 4://强退
                    EventManager.event("BATTLE_FIGHT_EXIT");
                    copy.CopyManager.ins.close();
                    break;
                default:
                    break;
            }
        }

        protected openFinish(msg: pb.sc_battle_finish): void {
            if (msg.pattern == 6 && msg.sceneId >= 60138 && msg.sceneId <= 60147) {
                let result = msg.result == 3 ? 1 : 2;
                EventManager.event("BATTLE_FIGHT_FINISH", [msg.sceneId, result]);
                copy.CopyManager.ins.close();
            } else {
                let mod: battle.result.IResult = msg.result == 2 ? new battle.result.ResultFailPanel() : new battle.result.ResultSucPanel();
                Laya.timer.once(300, this, () => { mod.show(msg); })
            }
        }

        /** 移动到下一个目标地*/
        protected move(): void {
            let myTeam: unit.Team = unit.UnitManager.ins.getTeam(unit.CampEnum.MY);
            myTeam.teamAction(unit.ActionEnum.MOVE);
            map.MapScene.ins.mapMove(1500, Laya.Handler.create(this, function (): void {
                myTeam.teamAction(unit.ActionEnum.IDLE);
                battle.BattleRoom.ins.enter();
            }))
        }

        public dispose(): void {
            super.dispose();
            BC.removeEvent(this);
            battle.BattleRoom.ins.exit();
        }
    }
}