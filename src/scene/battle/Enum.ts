namespace scene.battle {
    /**
     * 攻击类型
     */
    export enum AttackType {
        /** 纯伤害*/
        DAMAGE = 1,
        /** 暴击*/
        CRIT,
        /** 闪避*/
        MISS,
        /** 护盾*/
        SHIELD,
        /** 治疗*/
        CURE
    }

    /**
     * buff类型
     */
    export enum BuffType {
        /** 伤害*/
        DAMAGE = 1,
        /** 治疗*/
        CURE,
        /** 护盾*/
        SHIELD,
        /** 加怒气*/
        ADD_ANGER,
        /** 减怒气*/
        MINUS_ANGER,
        /** 最大生命值变化*/
        MAX_HP_CHANGE
    }

    export enum FinishType {
        /** 结束*/
        OVER = 1,
        /** 强退*/
        BACK,
        /** 跳过*/
        JUMP
    }
}
