namespace clientCore {

    export class Swim {
        public base: Laya.Sprite;
        private _swimsuit: Laya.Image;
        private _alertTip: Laya.Image;
        private _alertAni: clientCore.Bone;
        private reward: any[];
        constructor() {
            this.init();
        }

        init() {
            this.base = new Laya.Sprite();
            this._swimsuit = new Laya.Image();
            this._swimsuit.anchorX = 0.5;
            this._swimsuit.scaleX
            this.scale(0.6, 0.6);
            this.base.addChild(this._swimsuit);
            this.visible = false;
        }

        public showAlert(reward: any[]) {
            this.reward = reward;
            if (!this._alertTip) {
                this._alertTip = new Laya.Image("main/onsenRyokan/talk.png");
                this.base.addChild(this._alertTip);
                this._alertTip.y = -158;
            }
            this._alertTip.visible = true;
            this._alertAni = clientCore.BoneMgr.ins.play("res/swimsuit/effect.sk", 0, false, this.base);
            this._alertAni.scaleY = this._alertAni.scaleX = this.scaleY;
            this._alertAni.once(Laya.Event.COMPLETE, this, () => {
                this._alertTip.visible = false;
                alert.showReward(this.reward);
                this.reward = null;
                this._alertAni.dispose();
                this._alertAni = null;
            })
        }

        set swimVisible(value: boolean) {
            this._swimsuit.visible = value;
        }

        set visible(value: boolean) {
            this.base.visible = value;
        }

        get visible() {
            return this.base.visible;
        }

        set scaleX(value: number) {
            this._swimsuit.scaleX = value;
        }

        get scaleX() {
            return this._swimsuit.scaleX;
        }

        set scaleY(value: number) {
            this._swimsuit.scaleY = value;
        }

        get scaleY() {
            return this._swimsuit.scaleY;
        }

        set x(value: number) {
            this.base.x = value;
        }

        get x() {
            return this.base.x;
        }

        set y(value: number) {
            this.base.y = value;
        }

        get y() {
            return this.base.y;
        }

        set skin(value: string) {
            this._swimsuit.skin = value;
        }

        get width() {
            return this._swimsuit?.width;
        }

        get height() {
            return this._swimsuit?.height;
        }

        scale(x: number, y: number) {
            this.scaleX = x;
            this.scaleY = y;
        }

        pos(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        destroy() {
            this._swimsuit.destroy();
            this.base.destroy();
            this._alertTip?.destroy();
            this._alertAni?.dispose();
            this._alertAni = this._alertTip = this._swimsuit = this.base = null;
            if (this.reward) {
                alert.showReward(this.reward);
            }
        }
    }
}