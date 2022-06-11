namespace playground {
    enum LOOK_TYPE {
        NONE,
        /** 对象*/
        OBJECT,
        /** 点*/
        POSITION
    }
    /**
     * 相机
     */
    export class Camera {
        /** 相机绑定者（对象）*/
        private binder: Unit;
        /** 相机绑定者（点）*/
        private position: Laya.Point;
        /** 地图*/
        private map: Laya.Sprite;
        /** 可视范围*/
        private rect: Laya.Rectangle;
        /** 绑定类型*/
        private type: LOOK_TYPE;
        /** 当前缩放*/
        private scale: number;
        /** 最小缩放*/
        private minscale: number;
        /** 相机移动速度*/
        private move: number;

        constructor() { }

        init(map: Laya.Sprite): void {
            this.type = LOOK_TYPE.NONE;
            this.map = map;
            this.scale = 1;
            this.move = 3;
            let sx: number = Laya.stage.width / this.map.width;
            let sy: number = Laya.stage.height / this.map.height;
            this.minscale = sx > sy ? sx : sy;
            this.rect = new Laya.Rectangle(0, 0, Laya.stage.width, Laya.stage.height);
            Laya.timer.frameLoop(1, this, this.update);
        }
        update(): void {
            if (this.type == LOOK_TYPE.NONE) return;
            let x: number, y: number;
            if (this.type == LOOK_TYPE.OBJECT) {
                x = _.clamp(this.rect.width / 2 - this.binder.x, this.rect.width - this.map.width - clientCore.LayerManager.OFFSET, -clientCore.LayerManager.OFFSET);
                y = _.clamp(this.rect.height / 2 - this.binder.y, this.rect.height - this.map.height, 0);
            } else {
                x = _.clamp(this.rect.width / 2 - this.position.x, this.rect.width - this.map.width - clientCore.LayerManager.OFFSET, -clientCore.LayerManager.OFFSET);
                y = _.clamp(this.rect.height / 2 - this.position.y, this.rect.height - this.map.height, 0);
            }
            if (this.map.x != x) {
                this.map.x = this.map.x < x ? Math.min(this.map.x + this.move, x) : Math.max(this.map.x - this.move, x);
                this.rect.x = this.map.x + Laya.stage.width / 2;
            }
            if (this.map.y != y) {
                this.map.y = this.map.y < y ? Math.min(this.map.y + this.move, y) : Math.max(this.map.y - this.move, y);
                this.rect.y = this.map.y + Laya.stage.width / 2;
            }
        }

        go(): void {
            let x: number, y: number;
            if (this.type == LOOK_TYPE.OBJECT) {
                x = _.clamp(this.rect.width / 2 - this.binder.x, this.rect.width - this.map.width - clientCore.LayerManager.OFFSET, -clientCore.LayerManager.OFFSET);
                y = _.clamp(this.rect.height / 2 - this.binder.y, this.rect.height - this.map.height, 0);
            } else {
                x = _.clamp(this.rect.width / 2 - this.position.x, this.rect.width - this.map.width - clientCore.LayerManager.OFFSET, -clientCore.LayerManager.OFFSET);
                y = _.clamp(this.rect.height / 2 - this.position.y, this.rect.height - this.map.height, 0);
            }
            if (this.map.x != x) {
                this.map.x = x;
                this.rect.x = this.map.x + Laya.stage.width / 2;
            }
            if (this.map.y != y) {
                this.map.y = y;
                this.rect.y = this.map.y + Laya.stage.width / 2;
            }
        }

        lookObj(object: Unit): void {
            this.unlook();
            this.binder = object;
            this.type = LOOK_TYPE.OBJECT;
        }
        lookPos(point: Laya.Point): void {
            this.unlook();
            this.position = point;
            this.type = LOOK_TYPE.POSITION;
        }
        unlook(): void {
            this.position = null;
            this.binder = null;
            this.type = LOOK_TYPE.NONE;
        }
        dispose(): void {
            this.unlook();
            Laya.timer.clear(this, this.update);
            this.map = null;
        }
    }
}