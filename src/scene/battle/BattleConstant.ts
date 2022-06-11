namespace scene.battle {
    /**
     * 事件
     */
    export class BattleConstant {
        /** 一次攻击结束*/
        public static readonly ONE_ATTACK_END: string = "0";
        /** 战斗结束*/
        public static readonly FIGHT_FINISH: string = "1";
        /** 新的回合*/
        public static readonly UPDATE_BOUT: string = "2";
        /** 新的一波*/
        public static readonly UPDATE_WAVE: string = "3";
        /** 更新灵气*/
        public static readonly UPDATE_ANIMA: string = "4";
        /** 神祈CD*/
        public static readonly UPDATE_PRAY_CD: string = "5";
        /** 己方站位*/
        public static readonly myPoints: Array<number[]> = [[444, 436], [491, 538], [432, 630], [251, 436], [281, 538], [183, 630]];
        /** 敌方站位*/
        public static readonly otherPoints: Array<number[]> = [[876, 426], [837, 529], [898, 622], [1071, 426], [1064, 543], [1148, 620]];
        /** 双方中点位置*/
        public static readonly midPoint: Laya.Point = new Laya.Point(664, 534);

        constructor() { };
    }
}