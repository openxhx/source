namespace clientCore {
    /**
     * 冬眠动物
     */
    export class SleepingAnimal extends Laya.Sprite {
        private _itemImg: Laya.Image;
        // private _ske: Laya.Skeleton;
        private ani_name: Laya.Text;
        public ani_type: number;
        constructor(x: number, y: number) {
            super();
            this.mouseEnabled = true;
            this.width = 128;
            this.height = 128;
            this._itemImg = new Laya.Image();
            this._itemImg.anchorX = 0.5;
            this._itemImg.anchorY = 0.5;
            this.addChild(this._itemImg);
            this._itemImg.pos(this.width / 2, this.height / 2);
            this._itemImg.scale(0.6, 0.6);
            this.pos(x, y);

            // this._ske = MapPickAnimate.createAnimate();
            // this.addChildAt(this._ske, 0);
            // this._ske.pos(this.width / 2, this.height / 2);
        }
        public loadImg(type: number) {
            this.ani_type = type;
            this._itemImg.skin = `res/activity/awakeSpring/${this.ani_type}.png`;
            this.ani_name = this.ani_name || this.creTxt();
            this.addChild(this.ani_name);
        }

        public destroy() {
            this.removeSelf();
            super.destroy();
        }

        public creTxt(): Laya.Text {
            let txt: Laya.Text = new Laya.Text();
            txt.fontSize = 17;
            txt.font = '汉仪中圆简';
            txt.color = '#9b6642';
            txt.stroke = 1;
            txt.strokeColor = "#ffffff";
            txt.bold = true;
            txt.text = this.ani_type == 1 ? '冬眠的猫头鹰' : this.ani_type == 2 ? "冬眠的兔子" : "冬眠的乌龟";
            txt.x = 20;
            return txt;
        }
    }
}