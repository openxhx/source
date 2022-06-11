

namespace clientCore {

    /**
     * 人物的各部件层级
     */
    export class PersonLayer {

        /** 身体层级*/
        private _bodyLayer: Laya.Sprite;
        /**特效层级（cp戒指特效） */
        private _effectLayer: Laya.Sprite;
        /** 花宝层*/
        private _petLayer: Laya.Sprite;
        /** 名字层*/
        private _nameLayer: Laya.Sprite;
        /** 称号层*/
        private _titleLayer: Laya.Sprite;
        /**徽章层 */
        private _badgeBgLayer: Laya.Sprite;
        private _badgeDecLayer: Laya.Sprite;
        /** 进度层级*/
        private _progressLayer: Laya.Sprite;


        constructor() {
            this._petLayer = new Laya.Sprite();
            this._effectLayer = new Laya.Sprite();
            this._bodyLayer = new Laya.Sprite();
            this._nameLayer = new Laya.Sprite();
            this._titleLayer = new Laya.Sprite();
            this._badgeBgLayer = new Laya.Sprite();
            this._badgeDecLayer = new Laya.Sprite();
            this._progressLayer = new Laya.Sprite();
        }

        public setup(): void {
            clientCore.MapManager.peopleLayer.addChild(this._bodyLayer);
            clientCore.MapManager.peopleLayer.addChild(this._effectLayer);
            clientCore.MapManager.peopleLayer.addChild(this._nameLayer);
            clientCore.MapManager.peopleLayer.addChild(this._titleLayer);
            clientCore.MapManager.peopleLayer.addChild(this._badgeBgLayer);
            clientCore.MapManager.peopleLayer.addChild(this._badgeDecLayer);
            clientCore.MapManager.peopleLayer.addChild(this._progressLayer);
            clientCore.MapManager.peopleLayer.addChild(this._petLayer);
        }

        public get effectLayer() {
            return this._effectLayer;
        }

        public get petLayer(): Laya.Sprite {
            return this._petLayer;
        }

        public get bodyLayer(): Laya.Sprite {
            return this._bodyLayer;
        }

        public get nameLayer(): Laya.Sprite {
            return this._nameLayer;
        }

        public get titleLayer(): Laya.Sprite {
            return this._titleLayer;
        }

        public get progressLayer(): Laya.Sprite {
            return this._progressLayer;
        }

        public get badgeBgLayer(): Laya.Sprite {
            return this._badgeBgLayer;
        }
        public get badgeDecLayer(): Laya.Sprite {
            return this._badgeDecLayer;
        }
        /**
         * 添加进层级 会检测是否有相同的资源 然后放到相邻位置 减少drawcall
         * @param img 
         */
        public addUI(img: Laya.Image | FunnyBody, parentCon: Laya.Sprite): void {
            let len: number = parentCon.numChildren;
            let index: number = -1;
            for (let i: number = 0; i < len; i++) {
                let child: Laya.Node = parentCon.getChildAt(i);
                if (child instanceof Laya.Image && child.skin == img.skin) {
                    index = i;
                    break;
                }
            }
            if (index < 0) {
                parentCon.addChild(img);
            }
            else {
                parentCon.addChildAt(img, index + 1);
            }
        }


        private static _ins: PersonLayer;
        public static get ins(): PersonLayer {
            return this._ins || (this._ins = new PersonLayer());
        }
    }
}