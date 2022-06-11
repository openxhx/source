namespace clientCore {

    export class AlertTalk extends Laya.Sprite{
        private _alertTip: Laya.Image;
        constructor() {
            super();
            this.visible = false;
        }

        public showAlert() {
            if (!this._alertTip) {
                this._alertTip = new Laya.Image("res/swimsuit/limitTip.png");
                this.addChild(this._alertTip);
                this._alertTip.y = -158;
            }
            this._alertTip.visible = true;
        }

        destroy() {
            this._alertTip?.destroy();
            this._alertTip = null;
            super.destroy();
        }
    }
}