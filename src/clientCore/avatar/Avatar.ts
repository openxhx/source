namespace clientCore {
    /**
     * 实体
     */
    export class Avatar {

        private static ID: number = 0;

        protected _id: number;
        protected _display: Laya.Sprite;
        protected _x: number;
        protected _y: number;
        protected _type: AvatarEnum;
        protected _destroyed: boolean;
        constructor() {
            this._id = Avatar.ID++;
            this._display = new Laya.Sprite();
        }

        init(data: any): void {
            this._destroyed = false;
            this._id = Avatar.ID++;
            AvatarManager.ins.add(this.id, this);
        }

        update(): void {
        }

        addLayer(): void {
            AvatarLayer.ins.body.addChild(this._display);
        }

        dispose(): void {
            this._destroyed = true;
            this._display?.destroy();
            AvatarManager.ins.remove(this.id);
        }
        get id(): number {
            return this._id;
        }
        get x(): number {
            return this._x;
        }
        get y(): number {
            return this._y;
        }
        get type(): AvatarEnum {
            return this._type;
        }
        set type(value: AvatarEnum) {
            this._type = value;
        }
        get destroyed(): boolean {
            return this._destroyed;
        }
        pos(x: number, y: number): void {
            this._x = x;
            this._y = y;
            this._display.pos(x, y);
        }
    }
}