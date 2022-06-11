namespace scene.buff {
    /**
     * 一个buff个体
     */
    export class Buff {
        /** buff绑定的对象*/
        public binder: unit.Fighter;
        /** msg*/
        public msg: pb.Ibuff_effect;
        /** 配置*/
        public config: xls.BuffBase;
        /** buff执行成功*/
        public success: Function;
        /** 最大buff层数*/
        public maxLayer: number;

        private _icon: Laya.Image;
        private _txCount: Laya.Text;
        private _render: animation.BoneRender;

        constructor() { }

        public start(x: number, y: number): void {
            this.binder.dieSign = this.msg.death == 1; //添加死亡标记
            if (this.config.buffIcon != 0 && this.msg.layer < 30) { //30层以上不显示
                this.showIcon(x, y);
                this.showCount(x, y);
            }
            this.showEffect();
            //buff飘字
            if ([0, 5, 6].indexOf(this.config.battleWord.v1) == -1 && (this.config.battleWord.v2 == 1 || this.maxLayer >= this.msg.layer)) {
                font.FontTex.show(this.config.battleWord.v1, this.binder.x, this.binder.y - 200);
            }
            _.forEach(this.msg.buffType, (element: pb.buff_type) => {
                this.showHurt(element);
            })
            this.success();
        }

        /** 展示icon*/
        private showIcon(x: number, y: number): void {
            this._icon = this._icon || new Laya.Image();
            this._icon.skin = pathConfig.getBuffIcon(this.config.buffIcon);
            map.MapScene.ins.buffLayer.addChild(this._icon);
            this._icon.pos(x, y);
        }

        /** 展示buff层数*/
        private showCount(x: number, y: number): void {
            if (this.msg.layer <= 1) return;
            if (!this._txCount) {
                this._txCount = new Laya.Text();
                this._txCount.color = "#1bfb08";
                this._txCount.fontSize = 15;
                this._txCount.font = "汉仪中圆简";
                this._txCount.bold = true;
            }
            this._txCount.changeText(this.msg.layer + "");
            this._txCount.pos(x + 15, y + 15);
            map.MapScene.ins.textLayer.addChild(this._txCount);
        }

        /** 展示buff特效*/
        private showEffect(): void {
            if (this.config.effectId == "") return;
            let path: string = pathConfig.getSkillEffect(this.config.effectId);
            this._render = animation.AnimationFactory.getBoneEffect(path, this.config.effectContinued == 1);
            this._render.pos(this.binder.x, this.binder.y);
            map.MapScene.ins.upEffect.addChild(this._render);
        }

        /** 改变属性*/
        public changeProp(name: string, value: any): void {
            if (this._render && this._render[name]) {
                this._render[name] = value;
            }
        }

        /** 显示buff伤害数值*/
        private showHurt(msg: pb.buff_type): void {
            switch (msg.type) {
                case battle.BuffType.DAMAGE:
                    msg.num != 0 && battle.BattleManager.changeHp(1, this.binder, msg.num);
                    break;
                case battle.BuffType.CURE:
                    msg.num != 0 && battle.BattleManager.changeHp(2, this.binder, msg.num);
                    break;
                case battle.BuffType.SHIELD:
                    this.binder.shield = msg.num;
                    break;
                case battle.BuffType.ADD_ANGER:
                    if (msg.num != 0) {
                        font.FontTex.show(5, this.binder.x, this.binder.y - 200, "+" + msg.num);
                        if (!battle.BattleRoom.ins.checkSelf(this.binder)) {
                            this.binder.anger += msg.num
                        }
                    }

                    break;
                case battle.BuffType.MINUS_ANGER:
                    if (msg.num != 0) {
                        font.FontTex.show(6, this.binder.x, this.binder.y - 200, "-" + msg.num);
                        if (!battle.BattleRoom.ins.checkSelf(this.binder)) {
                            this.binder.anger += msg.num
                        }
                    }
                    break;
                case battle.BuffType.MAX_HP_CHANGE:
                    this.binder.maxHp = msg.num;
                    this.binder.hp = this.msg.curBlood;
                    break;
                default:
                    break;
            }
        }

        public clear(): void {
            this.success = null;
        }

        public dispose(): void {
            this.success = this.binder = null;
            this._icon && this._icon.removeSelf();
            this._txCount && this._txCount.removeSelf();
            this._render && this._render.dispose();
            this._render = null
            Laya.Pool.recover("Buff", this);
        }

        public static create(): Buff {
            return Laya.Pool.getItemByClass("Buff", Buff);
        }
    }
}