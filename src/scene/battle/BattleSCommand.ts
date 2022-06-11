namespace scene.battle {
    /**
     * 战斗消息控制
     */
    export class BattleSCommand {

        constructor() {
        }

        /**
         * 战斗布局
         * @param modudeType 战斗模式，1冒险，2秘闻录，3活动（试炼里面进的） 4约会 5金币（特殊的活动）
         * @param levelID 关卡id
         */
        public battleLayout(modudeType: number, levelID: number) {
            return net.sendAndWait(new pb.cs_battle_role_pos({ pattern: modudeType, sceneId: levelID })).then((msg: pb.sc_battle_role_pos) => {
                BattleConfig.mod = modudeType;
                BattleConfig.isFinish = false;
                switch (modudeType) {
                    case 1:
                        copy.CopyManager.ins.createRisk(msg.roleLists, msg.anima, levelID);
                        break;
                    case 2:
                        copy.CopyManager.ins.createMwl(msg.roleLists, msg.anima, levelID);
                        break;
                    case 3:
                        copy.CopyManager.ins.createAct(msg.roleLists, msg.anima, levelID);
                        break;
                    case 4:
                        copy.CopyManager.ins.createAffair(msg.roleLists, msg.anima, levelID);
                        break;
                    case 5:
                        copy.CopyManager.ins.createGold(msg.roleLists, msg.anima, levelID);
                        break;
                    case 6:
                        copy.CopyManager.ins.createBoss(msg.roleLists, msg.anima, levelID);
                        break;
                    default:
                        break;
                }
                EventManager.event(BattleConstant.UPDATE_ANIMA, msg.anima);
            })
        }

        /**
         * 获取敌方角色信息
         * @param handler 
         */
        public getEnemyRole(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_enemy_role_info()).then((msg: pb.sc_get_enemy_role_info) => {
                handler.runWith([msg.roleLists]);
            });
        }

        /**
         * 获取一整波的伤害
         * @param handler 回调
         */
        public battleResult(handler: Laya.Handler, skillID?: number): void {
            net.sendAndWait(new pb.cs_battle_role_attack()).then((msg: pb.sc_battle_role_attack) => {
                handler.runWith([msg.results]);
            });
        }

        /**
         * 设置自动攻击
         * @param bout 当前回合
         * @param index 当前位置
         * @param team 当前战斗队伍
         */
        public autoAttack(bout: number, index: number, team: number, handler: Laya.Handler): void {
            let type: number = BattleConfig.autoFight ? 0 : 1; //0-取消 1-开始
            let room: BattleRoom = BattleRoom.ins;
            let showMagic: number = room.praying ? 1 : 0;
            net.sendAndWait(new pb.cs_battle_auto_attack({ attack: type, curRound: bout, actIdx: index, team: team, showMagic: showMagic })).then((msg: pb.sc_battle_auto_attack) => {
                //房间未关闭
                !room.isClose && (room.battleResults = msg.results);
                //房间暂停恢复
                room.recover();
                BattleConfig.autoFight = type == 0 ? false : true;
                handler && handler.run();
            })
        }

        /**
         * 战斗结束
         * @param type 结束类型 1 结束 2 强退 
         */
        public battleFinish(type: number): void {
            net.sendAndWait(new pb.cs_battle_finish({ type: type })).then((msg: pb.sc_battle_finish) => {
                BattleConfig.isFinish = msg.result != 1;
                EventManager.event(BattleConstant.FIGHT_FINISH, msg);
            });
        }

        /**
         * 获取玩家神祈技能
         * @param handler 
         */
        public getPrays(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_god_pray_skill()).then((msg: pb.sc_get_god_pray_skill) => {
                handler && handler.runWith([msg.skillId]);
            })
        }

        /**
         * 释放神祈
         * @param skillId 
         * @param bout 
         * @param index 
         * @param handler
         */
        public useSkill(skillId: number, bout: number, index: number, handler?: Laya.Handler): void {
            net.sendAndWait(new pb.cs_battle_role_attack({
                skillId: skillId,
                curRound: bout,
                actIdx: index
            })).then((msg: pb.sc_battle_role_attack) => {
                msg.results.length > 0 && BattleRoom.ins.combBattleResults(msg.results);
                BattleRoom.ins.recover();
                handler && handler.run();
            });
        }

        private static _ins: BattleSCommand;
        public static get ins(): BattleSCommand {
            return this._ins || (this._ins = new BattleSCommand());
        }
    }
}