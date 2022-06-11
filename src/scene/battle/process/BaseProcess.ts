namespace scene.battle.process {
    /**
     * 攻击行为处理基类
     */
    export class BaseProcess implements IProcess {
        param: any;
        skillObj: skill.Skill;
        attacker: unit.Fighter;
        points: Laya.Point[];
        startHandler: Laya.Handler;
        hitHandler: Laya.Handler;
        completeHandler: Laya.Handler;
        clearTag: boolean;

        private _behaviors: behaviors.BaseBehavior[];

        constructor() {
            this.clearTag = true;
            this._behaviors = [];
        }

        /**
         * 准备 可在此做一些战斗开始的动作
         */
        async prepare(): Promise<void> {
            if (this.skillObj.type == skill.SkillType.ANGER) {
                // let rate: number = animation.AnimationControl.ins.rate;
                // BattleConfig.isPause = true;
                // animation.AnimationControl.ins.rate = 0.000000001; //设置最慢速率 达到暂停效果 不知道为啥直接设置暂停没有用
                animation.AnimationControl.ins.pasue();
                await map.MapScene.ins.showBlack();
                let render: animation.BoneRender = animation.AnimationFactory.getBoneEffect(pathConfig.getSkillEffect("flash"), false, Laya.Handler.create(this, () => {
                    // BattleConfig.isPause = false;
                    // animation.AnimationControl.ins.rate = rate;
                    // console.log
                    animation.AnimationControl.ins.resume();
                    map.MapScene.ins.hideBlack();
                    this.go();
                }))
                render.pos(this.attacker.x, this.attacker.y);
                map.MapScene.ins.upEffect.addChild(render);
                return;
            }
            this.go();
        }

        private async go(): Promise<void> {
            //执行前置行为
            await this.waitBehavior("start");
            this.start();
        }

        /**
         * 所有前置操作请写在 super.start() 前面
         */
        start(): void {
            this.startHandler && this.startHandler.run();
        }
        showEffect(): void {
            /** 播放音效*/
            if (BattleConfig.playSound && this.skillObj) {
                let castSound: number = Number(this.skillObj.config.castSound);
                castSound != 0 && core.SoundManager.instance.playBattleSound(pathConfig.getBattleSound(castSound), BattleConfig.rate);
            }
        }
        /**
         * 战斗退出
         */
        exit(): void {
            /** 后摇时间*/
            Laya.timer.once(this.skillObj.config.rockDelay / BattleConfig.rate, this, async () => {
                /** 行为恢复*/
                await this.waitBehavior("over");
                this.completeHandler && this.completeHandler.run();
            });
        }

        dispose(): void {
            Laya.timer.clearAll(this); //清理对象上的所有定时器
            this._behaviors = this.clearTag = this.skillObj = this.attacker = this.points = this.hitHandler = this.completeHandler = this.startHandler = null;
        }

        addBehavior(behavior: behaviors.BaseBehavior): void {
            this._behaviors.indexOf(behavior) == -1 && this._behaviors.push(behavior);
        }

        removeBehavior(behavior: behaviors.BaseBehavior): void {
            let index: number = this._behaviors.indexOf(behavior);
            index != -1 && this._behaviors.splice(index, 1);
        }

        private waitBehavior(type: "start" | "over"): Promise<void[]> {
            if (this._behaviors.length <= 0) return;
            let promiseArr: Promise<void>[] = [];
            _.forEach(this._behaviors, (element) => {
                promiseArr.push(type == "start" ? element.start() : element.over());
            })
            return Promise.all(promiseArr);
        }
    }
}