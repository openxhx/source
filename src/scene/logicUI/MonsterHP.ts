

namespace scene.logicUI {
    /**
     * 怪物血量（活动BOSS）
     */
    export class MonsterHP extends ui.fight.MonsterHpUI {
        private _hp: number; //当前血量
        private _max: number; //最大血量
        private _prop: number;
        private _propHp: number;

        constructor() { super(); }

        public init(data: xls.monsterBase): void {
            this._hp = this._max = data.hpBasic;
            this._propHp = this._max / 100;
            this._prop = 0;
            this.ico.skin = pathConfig.getMonsterIcon(data.monAppear);
            this.updateBlood(this._hp);
        }

        public destroy(): void {
            this.removeEventListeners();
            super.destroy();
        }

        public updateBlood(hp: number): void {
            let chg: number = this._hp - hp;
            if (chg == 0 && this._prop != 0) return; //无变化
            let cnt: number = Math.floor(hp / this._propHp);
            let radio: number = (hp - cnt * this._propHp) / this._propHp;
            let prop: number = 100 - cnt;
            if (prop != this._prop) {
                this._prop = prop;
                let evet: boolean = prop % 2 == 0;
                this.hp2.skin = evet ? "fight/red_bar.png" : "fight/green_bar.png";
                this.hp1.skin = evet ? "fight/green_bar.png" : "fight/red_bar.png";
                this.hp1.visible = prop <= 99;
            }

            this.hp2.width = 596 * radio;
            this.light.x = 48 + 596 - this.hp2.width;
            this.txHp.changeText(`${util.tofix((hp / this._max) * 100, 1)}%`);
            // this.txHp.changeText(`${util.tofix((1 - hp / this._max) * 100, 1)}/${prop}%`);
            this._hp = hp;
        }

        private static _ins: MonsterHP;
        public static show(monsterId: number): void {
            if (this._ins && this._ins.parent) return; //显示中
            let data: xls.monsterBase = xls.get(xls.monsterBase).get(monsterId);
            if (!data) {
                console.error(`配置表monsterBase似乎并不存在ID为${monsterId}的怪物~`);
                return;
            }
            this._ins = this._ins || new MonsterHP();
            this._ins.init(data);
            this._ins.pos(667, 52);
            clientCore.LayerManager.battleUILayer.addChild(this._ins);
        }

        public static update(hp: number): void {
            this._ins && this._ins.parent && this._ins.updateBlood(hp);
        }

        public static hide(): void {
            this._ins.removeSelf();
        }
    }
}