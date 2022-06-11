namespace scene.unit {
    /**
     * 地图单元的接口
     */
    export interface IUnit {
        /** id*/
        id: number;
        display: Laya.Sprite;
        /** 初始化单元数据*/
        init(data: any): void;
        /** 渲染单元显示*/
        render(): void;
        dispose(): void;
    }

    /**
     * 攻击者
     */
    export interface IAttack {
    }

    /**
     * 受击者
     */
    export interface IHit {
    }

    /**
     * 战斗接口
     */
    export interface IFighter extends IAttack, IHit {
        /** 阵营ID*/
        campID: number;
        /** 死亡标记*/
        dieSign: boolean;
        /** 技能行为*/
        skillBehavior: ISkillBehavior;
        /** 设置技能行为*/
        setSkillBehavior(behavior: ISkillBehavior): void;
        /** 开始攻击*/
        startAttack(result: pb.attack_result): void;
        /**
         * 播放技能
         * @param type 
         */
        playSkill(type: EventEnum): void;
        /**
         * 播放动作
         * @param type 动作类型 
         * @param complete 单次播放完成回调
         */
        playAction(type: ActionEnum, complete?: Laya.Handler): void;
    }

    export interface ISkillBehavior {
        /** 释放技能*/
        playSkill(): void;
    }
}