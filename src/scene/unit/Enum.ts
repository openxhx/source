namespace scene.unit {
    /**
     * 动作枚举
     */
    export enum ActionEnum {
        /** 死亡*/
        DEAD = "dead",
        /** 受击*/
        HURT = "hurt",
        /** 待机*/
        IDLE = "idle",
        /** 移动*/
        MOVE = "move",
        /** 普通攻击*/
        ATTACK_1 = "attack1",
        /** 怒气攻击*/
        ATTACK_2 = "attack2"
    }

    /**
     * 事件枚举
     */
    export enum EventEnum {
        /** attack2中添加*/
        CUTIN = "cutln",
        /** attack1、attack2中都需添加*/
        COMPLETE = "complete",
        /** 技能特效中添加*/
        HIT = "hit"
    }

    /**
     * 阵营枚举
     */
    export enum CampEnum {
        /** 我方阵营*/
        MY,
        /** 怪物阵营*/
        MONSTER,
        /** 敌方阵营*/
        OTHER,
        /** 无阵营*/
        NONE
    }

    /**
     * 状态枚举
     */
    export enum MoveEunm {
        /** 无状态*/
        NONE,
        /** 走路*/
        WALK
    }

    /**
     * 方向
     */
    export enum DirectionEnum {
        LEFT,
        RIGHT
    }
}