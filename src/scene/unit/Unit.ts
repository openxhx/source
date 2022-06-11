namespace scene.unit {
    /**
     * 地图单元
     */
    export class Unit implements IUnit {

        id: number;
        display: Laya.Sprite;

        /** 被清理了*/
        public cleaned: boolean;

        protected _x: number;
        protected _y: number;

        constructor() { }

        init(data: any): void {
            this.cleaned = false;
            this.display = new Laya.Sprite();
        }

        render(): void {
        }

        public get x(): number {
            return this._x;
        }
        public set x(value: number) {
            this._x = value;
            this.display.x = value;
        }
        public get y(): number {
            return this._y;
        }
        public set y(value: number) {
            this._y = value;
            this.display.y = value;
        }

        /** 添加到场景*/
        public addToScene(): void {
            scene.map.MapScene.ins.roleLayer.addChild(this.display);
        }

        /** 移除场景*/
        public removeToScene(): void {
        }

        dispose(): void {
            this._x = this._y = 0;
            this.cleaned = true;
            this.display.removeSelf();
        }
    }
}