namespace appreciate {
    interface IItemParams {
        type: string;
        scaleMin: number;
        scaleMax: number;
    }

    export class RoleItem extends Laya.Box {
        private _scaleNum: number = 1;
        private _deformation: number = 1;

        private _parms: IItemParams;

        public spMc: Laya.Box;
        private img: Laya.Image;
        private _person: clientCore.Person;
        private _rider: clientCore.Bone;
        private _tmpRiderId: number;
        constructor() {
            super();
            this.mouseThrough = true;

            this.spMc = new Laya.Box();
            this.spMc.width = 0;
            this.spMc.height = 0;
            this.spMc.mouseThrough = true;
            this.addChild(this.spMc);

            this.img = new Laya.Image();
            this.img.skin = "appreciate/1-1.png";
            this.img.width = 500;
            this.img.height = 600;
            this.img.anchorX = this.img.anchorY = 0.5;
            this.img.alpha = 0;
            this.spMc.addChild(this.img);

            this.addEventListeners();
        }

        public init(data: IItemParams): void {
            this._parms = data;
        }

        public update(sex: number, curClothes: number[]): void {
            if (!this._person) {
                this._person = new clientCore.Person(sex);
                this._person.scale(0.625, 0.625);
            } else {
                this._person.downAllCloth()
            }
            this._person.upByIdArr(curClothes);
            this.spMc.addChild(this._person);
            this._person.stopAnimate();
        }

        public changeRider(id: number) {
            this._person.playAnimate(id != 0 ? 'zuoxia' : 'static', true);
            if (id) {
                if (this._tmpRiderId != id) {
                    this._tmpRiderId = id;
                    this._rider?.dispose();
                    this._rider = clientCore.BoneMgr.ins.playRiderBone(id, this._person);
                    // this._rider.scaleX = this._rider.scaleY = 0.625;
                }
                this._rider.visible = true;
            }
            else
                this._rider && (this._rider.visible = false);
        }

        public onClose(): void {
            this.removeSelf();
        }

        //重置
        public onReset(): void {
            this._scaleNum = 1;
            this._deformation = 1;
            this.spMc.scaleX = this.spMc.scaleY = this._scaleNum;
            this.rotation = 0;
        }

        private onShow(): void {
            if (this.parent) {
                this.parent.setChildIndex(this, this.parent.numChildren - 1);
            }
        }

        private onMouseDownShow(e: Laya.Event): void {
            var touches: Array<any> = e.touches;
            if (touches) {
                if (touches.length == 2) {
                    this.stopDrag();
                    return;
                }
                if (touches.length > 2) {
                    return;
                }
            }
            this.startDrag();
            this.onShow();
            EventManager.event(AppreciateModule.ITEM_ON_OPERATION, [this]);
        }

        private onMouseUpShow(): void {
            this.stopDrag();
        }

        /**翻转界面 */
        public onDeformation(): void {
            this._deformation *= -1;
            this.spMc.scaleX *= -1;
        }

        /**旋转界面 */
        public onRotate(value: number): void {
            this.rotation = value;
        }

        /**缩放界面 */
        public OnZoom(value: number): void {
            if (value < this._parms.scaleMin) {
                value = this._parms.scaleMin;
            } else if (value > this._parms.scaleMax) {
                value = this._parms.scaleMax;
            }
            this._scaleNum = value;
            this.spMc.scaleX = this._scaleNum * this._deformation;
            this.spMc.scaleY = this._scaleNum;
        }

        public get scaleNum(): number {
            return this._scaleNum;
        }

        public get parms(): IItemParams {
            return this._parms;
        }

        public getGetBounds() {
            return this.spMc.getBounds();
        }

        public get offsetData() {
            let rect = this.getGetBounds();
            return { x: rect.x - (- rect.width / 2), y: rect.y - (- rect.height / 2) };
        }

        addEventListeners() {
            BC.addEvent(this, this.img, Laya.Event.MOUSE_DOWN, this, this.onMouseDownShow);
            BC.addEvent(this, this.img, Laya.Event.MOUSE_UP, this, this.onMouseUpShow);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        dispose(): void {
            this._parms = null;
            this._person?.destroy();
            this._person = null;
            this._rider?.dispose();
            this._rider = null;
            this.removeEventListeners();
            this.removeSelf();
        }
    }
}