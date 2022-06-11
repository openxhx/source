namespace clientCore {
    /**
     * 家族地图
     */
    export class PickProgress extends Laya.Sprite {
        private _bg: Laya.Image;
        private _progress: Laya.Image;
        private _mask: Laya.Image;
        constructor() {
            super();
            this.initProgress();
        }
        private initProgress() {
            let source: Laya.Texture = Laya.loader.getRes("commonUI/pickProgressBg.png");
            this.pivotX = source.width / 2;
            this._bg = new Laya.Image();
            this._progress = new Laya.Image();
            this._mask = new Laya.Image();
            this._bg.source = source;
            this._progress.skin = "commonUI/pickProgress.png";
            this._mask.skin = "commonUI/pickProgress.png";
            this._progress.mask = this._mask;
            this.addChild(this._bg);
            this.addChild(this._progress);

        }
        public showProgress(curNum: number, totalNum: number) {
            if (curNum > totalNum) {
                curNum = totalNum;
            }
            this._mask.x = -this._mask.width + this._mask.width * (curNum / totalNum);
        }
    }
}