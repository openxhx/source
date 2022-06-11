namespace scene.battle {
    /**
     * 房间接口
     */
    export interface IRoom {
        /**
         * 进入房间
         * @param type 0-普通房间 1-BOSS房间（这里boss需要创建血条）
         */
        enter(type: number): void;
        /** 开始*/
        start(): void;
        /** 退出*/
        exit(): void;

    }

    /**
     * 技能处理
     */
    export interface IProcess {
        /** 技能对象*/
        skillObj: skill.Skill;
        /** 攻击者*/
        attacker: unit.Fighter;
        /** 技能位置列表*/
        points: Laya.Point[];
        /** 开始回调*/
        startHandler: Laya.Handler;
        /** 击中回调*/
        hitHandler: Laya.Handler;
        /** 完成回调*/
        completeHandler: Laya.Handler;
        /** 参数*/
        param: any;
        /** 这是清理标记 用于放置Promise的后续操作*/
        clearTag: boolean;
        /** 准备*/
        prepare(): Promise<void>;
        /** 开始*/
        start(): void;
        /** 播放技能特效*/
        showEffect(): void;
        /** 退出*/
        exit(): void;
        /** 清理*/
        dispose(): void;
        /** 添加行为 */
        addBehavior(behavior: IBehavior): void;
        /** 取消行为 */
        removeBehavior(behavior: IBehavior): void;
    }

    /**
     * 行为 
     */
    export interface IBehavior {
        start(): Promise<void>;
        over(): Promise<void>;
    }
}