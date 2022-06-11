namespace util {
    export interface IJoyStickUI {
        bottomImg: Laya.Image,
        knob: Laya.Image,
        arrow?: Laya.Image
    }
    export class JoyStick extends Laya.EventDispatcher {
        private initPos: Laya.Point;
        private originPiont: Laya.Point;
        private deltaX: number;
        private deltaY: number;
        private ui: IJoyStickUI & Laya.View;
        private parentUI: Laya.Sprite;
        private bigR: number;
        private smallR: number;
        private _enabled: boolean;
        private moving: boolean;
        private touchID: number;
        /** 摇杆偏离最大距离（不设定的话根据自动计算） */
        public maxDis: number;
        /***摇杆的角度****/
        public angle: number = -1;
        /***摇杆的弧度****/
        public radians: number = -1;
        /** 摇杆摇动距离 */
        public dis: number = 0;

        /**
         * 摇杆通用类
         * 摇杆监听的是stage的鼠标事件
         * 会派发 start end change事件
         * @param initPos:初始位置
         * @param ui:摇杆ui
         * @param parentUI:摇杆ui所在容器(使用LayerManager.joyLayer，为了解决编译引用)
         */
        constructor(initPos: Laya.Point, ui: IJoyStickUI & Laya.View, parentUI: Laya.Sprite) {
            super()
            this.initPos = initPos;
            this.ui = ui;
            this.parentUI = parentUI;
            this.parentUI.mouseEnabled = true;
            this.ui.mouseEnabled = true;
            this.initUI();
            this.enable = true;
            this.ui.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }

        public set enable(p: boolean) {
            if (this._enabled != p) {
                this._enabled = p;
                if (p) {
                    this.ui.visible = true;
                }
                else {
                    if (this.moving) this.onMouseUp(null);
                    this.ui.visible = false;
                    this.ui.knob.pos(this.originPiont.x, this.originPiont.y);
                    this.resetUI();
                }
            }
        }

        public pos(x: number, y: number): void {
            this.initPos.x = x;
            this.initPos.y = y;
            this.ui.pos(this.initPos.x - this.originPiont.x, this.initPos.y - this.originPiont.y);
            this.ui.knob.pos(this.originPiont.x, this.originPiont.y);
        }

        public set visible(value: boolean) {
            this.ui && (this.ui.visible = value);
        }

        public select(): void {
            this.ui && this.ui.event(Laya.Event.MOUSE_DOWN, { stageX: Laya.stage.mouseX, stageY: Laya.stage.mouseY });
        }

        private initUI() {
            this.originPiont = new Laya.Point(this.ui.bottomImg.x + this.ui.bottomImg.width / 2, this.ui.bottomImg.y + this.ui.bottomImg.height / 2);
            this.initPos.x += this.originPiont.x;
            this.initPos.y += this.originPiont.y;
            this.bigR = this.ui.bottomImg.width / 2;
            this.smallR = this.ui.knob.width / 2;
            this.maxDis = this.bigR;
            this.ui.knob.pivot(this.smallR, this.smallR);
            this.parentUI.addChild(this.ui);
            this.ui.visible = false;
            if (this.ui.arrow)
                this.ui.arrow.pivot(this.ui.arrow.width / 2, this.ui.arrow.height / 2);
            this.resetUI();
        }

        private resetUI() {
            this.ui.alpha = 0.7;
            this.ui.pos(this.initPos.x - this.originPiont.x, this.initPos.y - this.originPiont.y);
            this.ui.knob.pos(this.originPiont.x, this.originPiont.y);
            if (this.ui.arrow)
                this.ui.arrow.alpha = 0;

        }

        private onMouseDown(e: Laya.Event): void {
            if (this.initPos.distance(e.stageX, e.stageY) <= this.maxDis) {
                this.touchID = e.touchId;
                this.ui.alpha = 1;
                this.ui.pos(e.stageX - this.originPiont.x, e.stageY - this.originPiont.y);
                this.ui.knob.pos(this.originPiont.x, this.originPiont.y);
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMove);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
                Laya.stage.on(Laya.Event.ROLL_OUT, this, this.onMouseUp);
                Laya.timer.frameLoop(1, this, this.onMoving);
                if (this.ui.arrow)
                    this.ui.arrow.alpha = 0;
            }
        }

        private onMouseUp(e: Laya.Event): void {
            if(e && e.touchId != this.touchID)return;
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMove);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.stage.off(Laya.Event.ROLL_OUT, this, this.onMouseUp);
            Laya.timer.clear(this, this.onMoving);
            this.dis = 0;
            this.radians = this.angle = -1;
            this.moving = false;
            this.resetUI();
            // this.onMoving();
            this.event(Laya.Event.END);
        }

        private onMoving() {
            this.event(Laya.Event.CHANGE, { x: this.ui.knob.x - this.originPiont.x, y: this.ui.knob.y - this.originPiont.y });
        }

        private onMove(e: Laya.Event): void {
            if(this.touchID != e.touchId)return;
            if (!this.moving) {
                this.moving = true;
                this.event(Laya.Event.START);
            }
            this.ui.visible = true;
            let locationPos: Laya.Point = this.ui.globalToLocal(new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY), false);
            this.ui.knob.pos(locationPos.x, locationPos.y);
            this.deltaX = locationPos.x - this.originPiont.x;
            this.deltaY = locationPos.y - this.originPiont.y;
            this.angle = -Math.atan2(this.deltaX, this.deltaY) * 180 / Math.PI + 90;
            this.angle = Math.round(this.angle);
            this.radians = Math.PI / 180 * this.angle;
            this.dis = locationPos.distance(this.originPiont.x, this.originPiont.y);
            let sin = Math.sin(this.radians);
            let cos = Math.cos(this.radians);
            if (this.dis >= this.maxDis) {
                let x: number = Math.floor(cos * this.maxDis + this.originPiont.x);
                let y: number = Math.floor(sin * this.maxDis + this.originPiont.y);
                this.ui.knob.pos(x, y);
            }
            else {
                this.ui.knob.pos(locationPos.x, locationPos.y);
            }
            if (this.ui.arrow) {
                this.ui.arrow.alpha = _.clamp(this.dis / this.maxDis, 0, 1);
                this.ui.arrow.x = cos * this.bigR + this.originPiont.x;
                this.ui.arrow.y = sin * this.bigR + this.originPiont.y;
                this.ui.arrow.rotation = this.angle;
            }
        }

        destroy() {
            this.ui.offAll();
        }
    }
}