namespace scene.battle.process {

    export enum ProcessEnum {
        /** 一般的*/
        NORMAL,
        /** 近战攻击*/
        CLOSECOMBAT,
        /** 多重攻击*/
        MULTiPLE,
        /** 神祈*/
        PRAY = 10001
    }

    /**
     * 技能处理工厂
     */
    export class ProcessFactory {
        /**
         * 获取技能处理类型
         * @param type 
         */
        public static getProcess(type: number): BaseProcess {
            let _process: BaseProcess;
            switch (type) {
                case ProcessEnum.NORMAL:
                    _process = new NormalProcess();
                    break;
                case ProcessEnum.CLOSECOMBAT:
                    _process = new CloseCombatProcess();
                    break;
                case ProcessEnum.PRAY:
                    _process = new PrayProcess();
                    break;
                case ProcessEnum.MULTiPLE:
                    _process = new MultipleProcess();
                    break;
                default:
                    break
            }
            return _process;
        }

        public static getType(config: xls.SkillBase): ProcessEnum {
            // if (config.hitTimes > 1) { //多重攻击
            //     return process.ProcessEnum.MULTiPLE;
            // } else if (config.behaviorType == 2) { //近身攻击
            //     return process.ProcessEnum.CLOSECOMBAT;
            // } else {
            //     return process.ProcessEnum.NORMAL;
            // }
            if (config.hitTimes > 1) { //多重攻击
                return process.ProcessEnum.MULTiPLE;
            } else {
                return process.ProcessEnum.NORMAL;
            }
        }

        constructor() { }
    }
}