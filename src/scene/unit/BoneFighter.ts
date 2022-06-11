///<reference path="Fighter.ts" />

namespace scene.unit {
    /**
     * 骨骼战斗对象
     */
    export class BoneFighter extends Fighter {
        /** 人物*/
        private _render: animation.BoneRender;
        /** 血条和怒气条*/
        private _bar: logicUI.Fight_HP;
        /** 脚底的圆圈*/
        private _circle: Laya.Image;
        /** 是否渲染好了*/
        private _hasRender: boolean = false;
        /** 当前的动作*/
        private _currentType: ActionEnum;

        constructor() { super(); }

        public render(): void {
            this._hasRender = false;
            this._currentType = ActionEnum.IDLE;
            // 创建血条
            this._bar = logicUI.Fight_HP.create();
            this._bar.setIdentity(this._data.identity);
            this._bar.visible = !this._data.showHp;
            this._data.campID != unit.CampEnum.MONSTER && this._bar.setCareer(this._data.career);
            // 创建脚底圆圈
            let path: string = this.campID == CampEnum.MY ? "fight/myS.png" : "fight/othorS.png";
            this._circle = new Laya.Image(path);
            this._circle.anchorX = this._circle.anchorY = 0.5;
            this.setCircle(false);
            // 创建人物
            // this._render = animation.AnimationFactory.getBone(pathConfig.getRoleBattleSk(this._data.skinID), Laya.Handler.create(this, this.onRenderBody));
            this._render = animation.BoneRender.create();
            let data: animation.AnimationData = animation.AnimationData.create();
            data.path = pathConfig.getRoleBattleSk(this._data.skinID);
            data.isRate = true;
            this._render.init(data, Laya.Handler.create(this, this.onRenderBody));
            this._render.scale(this._data.scale, this._data.scale);
            this.display.addChild(this._render);
        }

        private onRenderBody(): void {
            this._hasRender = true;
            this.playAction(this._currentType);
        }

        playAction(type: ActionEnum, complete?: Laya.Handler): void {
            this._currentType = type;
            if (!this._hasRender) return;
            switch (type) {
                case ActionEnum.DEAD:
                    this._render.playAni(type, false, Laya.Handler.create(this, this.removeToScene));
                    break;
                case ActionEnum.ATTACK_1:
                    this._render.playLabel(type, false, Laya.Handler.create(this, this.idle), Laya.Handler.create(this, this.playSkill));
                    break;
                case ActionEnum.ATTACK_2:
                    this._render.playLabel2(type, false, Laya.Handler.create(this, this.idle), Laya.Handler.create(this, this.playSkill), 'complete');
                    break;
                case ActionEnum.HURT:
                    this._render.playAni(type, false, Laya.Handler.create(this, () => {
                        complete && complete.run();
                        this.idle();
                    }));
                    break;
                case ActionEnum.MOVE:
                case ActionEnum.IDLE:
                    this._render.playAni(type, true)
                    break
                default:
                    console.error("actionError: ", "无动作类型：" + type);
                    break;
            }
        }

        public get x(): number {
            return this._x;
        }

        public set x(value: number) {
            if (this._x == value || this.cleaned) return;
            this._x = value;
            if (this._circle) {
                this._circle.x = value;
                this._bar.x = value - this._bar.width / 2;
            }
            this.display.x = value;
            buff.BuffManager.ins.getBuffs(this)?.changeProp("x", value);
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            if (this._y == value || this.cleaned) return;
            this._y = value;
            if (this._circle) {
                this._circle.y = value;
                this._bar.y = value - 200 * this._data.scale;
            }
            this.display.y = value;
            buff.BuffManager.ins.getBuffs(this)?.changeProp("y", value);
        }

        public addToScene(): void {
            super.addToScene();
            map.MapScene.ins.barLayer.addChild(this._bar);
            map.MapScene.ins.circleLayer.addChild(this._circle);
        }

        public dispose(): void {
            super.dispose();
            this._render.dispose();
            this._bar.dispose();
            this._circle.destroy();
            this._circle = this._render = this._bar = null;
            Laya.Pool.recover("BoneFighter", this);
        }

        protected updateHp(value: number): void {
            let targetVal: number = 110 * (value / this._maxHP);
            this._bar.setHP(targetVal);
        }

        protected updateAnger(value: number): void {
            let targetVal: number = 100 * (value / this._maxAnger);
            this._bar.setAnger(targetVal);
        }

        public static create(): BoneFighter {
            return Laya.Pool.getItemByClass("BoneFighter", BoneFighter);
        }

        public setCircle(value: boolean): void {
            this._circle.visible = value;
        }

        public checkAttack2(): boolean {
            return this._render.checkAttack2();
        }
    }
}