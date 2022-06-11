namespace scene.battle {
    /**
     * 战斗参数
     */
    export class BattleConfig {

        /** 速率*/
        public static rate: number = 1;

        /** 当前战斗模式*/
        public static mod: number;

        /** 当前自动战斗状态*/
        public static autoFight: boolean = false;

        /** 战斗音乐*/
        public static playMusic: boolean = true;

        /** 战斗音效*/
        public static playSound: boolean = true;

        /** 是否暂停*/
        public static isPause: boolean = false;

        /** 是否结束*/
        public static isFinish: boolean = false;

        constructor() { }
    }
}