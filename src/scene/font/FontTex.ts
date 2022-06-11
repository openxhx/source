namespace scene.font {
    /**
     * 战斗飘字
     */
    export class FontTex {


        private static _pool: Laya.Sprite[] = [];
        /**
         * 
         * @param type 
         * @param value 
         */
        public static show(type: number, x: number, y: number, value?: string): void {
            let sp: Laya.Sprite = this._pool.shift() || new Laya.Sprite();
            let tex: Laya.Texture = Laya.loader.getRes(`font/${type}.png`);
            if (tex) {
                sp.width = tex.sourceWidth;
                sp.graphics.drawTexture(tex, 0, 0, tex.sourceWidth, tex.sourceHeight);
            }
            if (value && value != "") {
                let head: string = type == 5 ? "g" : "r";//TODO
                for (let element of value) {
                    let url: string = `font/${head}${element}.png`;
                    tex = Laya.loader.getRes(url);
                    if (!tex) {
                        console.error(`${url} is not found~`);
                        continue;
                    }
                    sp.graphics.drawTexture(tex, sp.width, 3.5, tex.sourceWidth, tex.sourceHeight);
                    sp.width += tex.sourceWidth;
                }
            }
            sp.pos(x, y);
            sp.pivotX = sp.width / 2;
            scene.map.MapScene.ins.flyTexture.addChild(sp);
            Laya.Tween.to(sp, { x: x, y: y - 100, alpha: 0 }, 1000, null, Laya.Handler.create(this, () => {
                sp.alpha = 1;
                sp.width = 0;
                sp.graphics.clear();
                sp.removeSelf();
                this._pool.push(sp);
            }))
        }
    }
}