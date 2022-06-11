namespace appreciate {
    export class PhotoFrameItem extends ui.appreciate.render.PhotoFrameItemUI {
        constructor() {
            super();

            this.addEventListeners();
        }

        public update(url: string): void {
            for (let i = 1; i <= 9; i++) {
                if (i != 5) {
                    this['img' + i].skin = url + i + '.png';
                }
            }
        }

        public onClose(): void {
            this.removeSelf();
        }

        private onMouseDownShow(): void {
            if (this.parent) {
                this.parent.setChildIndex(this, this.parent.numChildren - 1);
            }
        }

        private updatePos1(): void {
            this.img2.left = this.img1.width;
            this.img4.top = this.img1.height;
        }

        private updatePos3(): void {
            this.img2.right = this.img3.width;
            this.img6.top = this.img3.height;
        }

        private updatePos7(): void {
            this.img4.bottom = this.img7.height;
            this.img8.left = this.img7.width;
        }

        private updatePos9(): void {
            this.img6.bottom = this.img9.height;
            this.img8.right = this.img9.width;
        }

        addEventListeners() {
            BC.addEvent(this, this.btn, Laya.Event.CLICK, this, this.onMouseDownShow);
            BC.addEvent(this, this.img1, Laya.Event.RESIZE, this, this.updatePos1);
            BC.addEvent(this, this.img3, Laya.Event.RESIZE, this, this.updatePos3);
            BC.addEvent(this, this.img7, Laya.Event.RESIZE, this, this.updatePos7);
            BC.addEvent(this, this.img9, Laya.Event.RESIZE, this, this.updatePos9);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy(): void {
            this.removeEventListeners();
            super.destroy();
        }
    }
}