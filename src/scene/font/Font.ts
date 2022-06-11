namespace scene.font {


    export class Font extends ui.fight.FontUI {

        private _interval: number;

        constructor() { super(); }

        public setParams(type: battle.AttackType, value: string, x: number, y: number): void {
            switch (type) {
                case battle.AttackType.DAMAGE:
                    this.font.visible = true;
                    this.font.value = "-" + value;
                    this.font.skin = "fight/dmg.png";
                    break;
                case battle.AttackType.CRIT:
                    this.font.visible = true;
                    this.font.value = "-" + value;
                    this.font.skin = "fight/criti.png";
                    break;
                case battle.AttackType.MISS:
                    this.img.visible = true;
                    this.img.skin = "fight/16.png";
                    break;
                case battle.AttackType.CURE:
                    this.font.visible = true;
                    this.font.value = "+" + value;
                    this.font.skin = "fight/heal.png";
                    break;
                default:
                    console.log("font error: ", "未定义伤害类型" + type);
                    break;
            }
            this.pos(x, y);
            this._interval = this.ani1.interval;
            this.ani1.interval = this._interval * (1 / battle.BattleConfig.rate);
            this.ani1.play(0, false);
            this.ani1.once(Laya.Event.COMPLETE, this, this.dispose);
        }

        private dispose(): void {
            this.font.visible = this.img.visible = false;
            this.ani1.interval = this._interval;
            this.font.alpha = this.img.alpha = 1;
            Laya.Pool.recover("Font", this);
        }

        public static create(): Font {
            return Laya.Pool.getItemByClass("Font", Font);
        }
    }
}