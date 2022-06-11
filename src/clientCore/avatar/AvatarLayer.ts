namespace clientCore {
    /**
     * 实体层级
     * 用于显示各种NPC 敌人啥的
     */
    export class AvatarLayer {

        /** 形象下层*/
        private _down: Laya.Sprite;
        /** 形象*/
        private _body: Laya.Sprite;
        /** 形象上层*/
        private _up: Laya.Sprite;

        constructor() {
            this._down = new Laya.Sprite();
            this._body = new Laya.Sprite();
            this._up = new Laya.Sprite();
        }

        setup(): void {
            MapManager.avatarLayer.addChild(this._down);
            MapManager.avatarLayer.addChild(this._body);
            MapManager.avatarLayer.addChild(this._up);
        }

        public get down(): Laya.Sprite {
            return this._down;
        }
        public get body(): Laya.Sprite {
            return this._body;
        }
        public get up(): Laya.Sprite {
            return this._up;
        }

        private static _ins: AvatarLayer;
        public static get ins(): AvatarLayer {
            return this._ins || (this._ins = new AvatarLayer());
        }
    }
}