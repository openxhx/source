namespace chrysanthemumAlcohol {
    export class OperateBoxRender {
        private _value: number;

        public mainUI: ui.chrysanthemumAlcohol.render.OperateBoxRenderUI;

        constructor(ui: ui.chrysanthemumAlcohol.render.OperateBoxRenderUI) {
            this.mainUI = ui;
        }

        public update(data: { type: number, num?: number, isAdd?: boolean }) {
            this.mainUI.labNum.text = "";
            this.mainUI.labNum2.visible = false;
            if (data) {
                if (data.type == 0) {
                    this.mainUI.icon.skin = "chrysanthemumAlcohol/fu_ben.png"
                    this.mainUI.icon.visible = true;
                } else if (data.type == 1) {
                    this.mainUI.icon.skin = "chrysanthemumAlcohol/tu_ceng_15.png"
                    this.mainUI.icon.visible = true;
                }
                if (data.num) {
                    if (data.isAdd) {
                        this.value = data.num / 1.4;
                        this.mainUI.labNum.text = "x" + this.value;
                        this.onMoveNum(data.num);
                        this.mainUI.labNum2.visible = true;
                    } else {
                        this.mainUI.labNum.text = "x" + data.num;
                    }
                }
            }
        }

        public startTween(): void {
            this.onMove1();
        }

        private onMove1(): void {
            Laya.Tween.clearAll(this.mainUI.box);
            this.mainUI.box.scaleX = this.mainUI.box.scaleY = 1;
            Laya.Tween.to(this.mainUI.box, { scaleX: 0.95, scaleY: 0.95 }, 1000, null, Laya.Handler.create(this, () => {
                this.onMove2();
            }));
        }

        private onMove2(): void {
            Laya.Tween.clearAll(this.mainUI.box);
            this.mainUI.box.scaleX = this.mainUI.box.scaleY = 0.95;
            Laya.Tween.to(this.mainUI.box, { scaleX: 1, scaleY: 1 }, 1000, null, Laya.Handler.create(this, () => {
                this.onMove1();
            }));
        }

        public stopTween(): void {
            Laya.Tween.clearAll(this.mainUI.box);
            this.mainUI.box.scaleX = this.mainUI.box.scaleY = 1;
        }

        private onMoveNum(value: number): void {
            Laya.Tween.clearAll(this);
            Laya.Tween.clearAll(this.mainUI.labNum2);
            this.mainUI.labNum2.y = this.mainUI.labNum.y + 5;
            Laya.Tween.to(this, { value: value }, 500, null, null, 500);
            Laya.Tween.to(this.mainUI.labNum2, { y: this.mainUI.labNum.y - 15 }, 1000, null, Laya.Handler.create(this, () => {
                this.mainUI.labNum2.visible = false;
            }));
        }

        public get value(): number {
            return this._value;
        }

        public set value(value: number) {
            this._value = _.floor(value);
            this.mainUI.labNum.text = "x" + this._value;
        }

        destroy(): void {
            Laya.Tween.clearAll(this);
            Laya.Tween.clearAll(this.mainUI.labNum2);
            this.stopTween();
            this.mainUI = null;
        }
    }
}