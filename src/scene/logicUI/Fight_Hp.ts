namespace scene.logicUI {
    /**
     * 战斗血条
     */
    export class Fight_HP extends ui.fight.BarUI {

        constructor() { super(); }

        public setHP(w: number): void {
            Laya.Tween.clearAll(this.hp);
            Laya.Tween.to(this.hp, { width: w + 1 }, 200); //+1防止残血空槽的情况
        }

        public setAnger(w: number): void {
            Laya.Tween.clearAll(this.anger);
            Laya.Tween.to(this.anger, { width: w + 1 }, 200);
        }

        public setIdentity(value: number): void {
            this.icon.skin = pathConfig.getRoleAttrIco(value);
        }

        public setCareer(value: number): void {
            this.career.skin = pathConfig.getRoleBattleTypeIcon(value);
        }

        public dispose(): void {
            Laya.Tween.clearAll(this.hp);
            Laya.Tween.clearAll(this.anger);
            this.anger.width = this.hp.width = 0;
            this.removeSelf();
            Laya.Pool.recover("Fight_HP", this);
        }

        public static create(): Fight_HP {
            return Laya.Pool.getItemByClass("Fight_Hp", Fight_HP);
        }
    }
}