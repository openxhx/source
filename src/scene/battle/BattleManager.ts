

namespace scene.battle {
    /**
     * 战斗管理者
     */
    export class BattleManager {


        /** 人物初始化所携带的buff 在战斗开始前处理*/
        public static promiseBuffs: Promise<void>[] = [];

        constructor() { }

        /**
         * 血量变化
         * @param type 服务器的伤害类型 0无类型，1纯伤害，2回复生命 3闪避
         * @param affecter 作用者
         * @param num 变化的数值
         */
        public static changeHp(type: number, affecter: unit.Fighter, value: number): void {
            switch (type) {
                case 0: //不造成任何伤害 只是用来提供buff 不处理
                    break;
                case 1:
                    font.FontManager.showFont(battle.AttackType.DAMAGE, value + "", affecter.x, affecter.y - 200);
                    affecter.playAction(unit.ActionEnum.HURT);
                    affecter.hp -= value;
                    break;
                case 2:
                    font.FontManager.showFont(battle.AttackType.CURE, value + "", affecter.x, affecter.y - 200);
                    affecter.hp += value;
                    break;
                case 3:
                    font.FontManager.showFont(battle.AttackType.MISS, "", affecter.x, affecter.y - 200);
                    break;
                default:
                    break;
            }
        }

        public static async handlerBuffs(): Promise<void> {
            if (this.promiseBuffs && this.promiseBuffs.length > 0) {
                await Promise.all(this.promiseBuffs);
                this.promiseBuffs.length = 0;
            }
        }

        /**
         * 检查是否可以跳过战斗
         */
        public static checkJumpBattle(): boolean {
            // 花宝
            let petType: number = clientCore.FlowerPetInfo.petType;
            if (petType != 0) {
                let xlsData: xls.babyPay = xls.get(xls.babyPay).get(petType);
                let len: number = xlsData.privilege.length;
                for (let i: number = 0; i < len; i++) {
                    let element: xls.pair = xlsData.privilege[i];
                    if (element && element.v1 == 2) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}