namespace defendFarmGame {
    interface IMonsterParams {
        x: number;
        y: number;
        type: number;
        speed: number; //速度
        life: number;
    }

    /**
     * 野怪item
     */
    export class MonsterItem extends ui.defendFarmGame.MonsterItemUI {
        static readonly Monster_OUT: string = 'Monster_OUT';

        private _isSurvival: boolean;
        private _life: number;
        private _startT: number;
        private _params: IMonsterParams;

        private animate: clientCore.Bone;
        private img: Laya.Image;

        constructor() {
            super();
            this.anchorX = this.anchorY = 0.5;
        }

        configure(params: IMonsterParams): void {
            this._life = 1;
            this._isSurvival = true;
            this._startT = Laya.Browser.now();
            this._params = params;
            this.pos(params.x, params.y);

            if (!this.animate) {
                this.animate = clientCore.BoneMgr.ins.play("res/animate/defendFarm/" + this._params.type + "luoluoguai.sk", "idle", true, this as Laya.Sprite, null, true);
                this.animate.pos(50, 145);
            }
            this.on(Laya.Event.CLICK, this, this.onClick);
            this.mouseEnabled = true;
        }

        update(currT: number): void {
            if (!this._isSurvival) {
                return;
            }
            let passT: number = (currT - this._startT) / 1000;
            this.x = this._params.x - this._params.speed * passT;

            if (this.x < 0) {
                this.dispose();
                EventManager.event(MonsterItem.Monster_OUT);
            }
        }

        dispose(): void {
            this.animate?.dispose();
            this.animate = null;
            this.offAll();
            this.removeSelf();
            Laya.Pool.recover('defendFarmGame.MonsterItem', this);
        }

        private onClick(): void {
            if (!this._isSurvival) {
                return;
            }
            this._life++;
            if (this._life > this._params.life) {
                this._isSurvival = false;
                this.mouseEnabled = false;
                this.animate.stop();
                this.animate.play("dead", false, Laya.Handler.create(this, () => {
                    this.dispose();
                }))
            } else {
                this.animate.stop();
                this.animate.play("hurt", true)
            }
        }
    }
}