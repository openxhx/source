namespace rotateJump {
    import Point = Laya.Point;
    export class GameObject extends Laya.EventDispatcher {
        private mDisplayObject: Laya.Sprite;
        private mPos: Point;
        private mParent: Laya.Sprite;

        constructor(isCreateDisplayObj: boolean = true) {
            super();
            if (isCreateDisplayObj) {
                this.mDisplayObject = new Laya.Sprite();
                this.mPos = new Point();
            }
        }

        public setDisplayObject(disObj: Laya.Sprite): void {
            if (this.mDisplayObject != null) {
                this.mDisplayObject.destroy(true);
            }
            this.mDisplayObject = disObj;
            this.mPos = new Point(disObj.x, disObj.y);
            this.mParent = this.mDisplayObject.parent as Laya.Sprite;
        }

        public setParent(parent: Laya.Sprite, worldPositionStays: boolean = true): void {
            let globalRotation: number = this.mDisplayObject.globalRotation;
            if (worldPositionStays && this.mParent != null) {
                let globalPos = this.mParent.localToGlobal(this.pos, true);
                parent.addChild(this.displayObject);
                this.pos = parent.globalToLocal(globalPos);
                //console.log(parent.localToGlobal(this.pos, true));
            }
            else
                parent.addChild(this.displayObject);
            this.displayObject.rotation = globalRotation - parent.rotation;
            this.mParent = parent;
        }

        public get displayObject(): Laya.Sprite {
            return this.mDisplayObject;
        }

        public get pos(): Point {
            return this.mPos;
        }

        public set pos(p: Point) {
            this.mPos = p;
            this.mDisplayObject.pos(p.x, p.y);
        }

        public setPos(x: number, y: number): void {
            this.mPos.setTo(x, y);
            this.mDisplayObject.pos(x, y);
        }

        public get parent(): Laya.Sprite {
            return this.mParent;
        }

    }
}