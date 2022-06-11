namespace scene.battle.behaviors {
    /**
     * 行为基类
     */
    export class BaseBehavior implements IBehavior {

        protected owner: unit.Fighter;

        constructor(owner: unit.Fighter) { this.owner = owner; }


        /** 行为开始*/
        async start(): Promise<void> {

        }

        /** 行为结束*/
        async over(): Promise<void> {

        }

    }
}