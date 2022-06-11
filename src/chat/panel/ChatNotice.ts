namespace chat.panel {
    /**
     * 公告
     */
    export class ChatNotice {

        private _parent: ChatModule;

        private _rotateBg: Laya.Image;
        private _rotateTx: Laya.Text;
        private _systemBg: Laya.Image;
        private _systemNoticeTx: Laya.Text;
        private _rotateValues: string[]; //走马灯内容

        private _start: boolean; //启动了

        constructor(parent: ChatModule) {
            this._parent = parent;
            this._start = false;
        }

        /**
         * 开始走马灯
         */
        public rotateNotice(value: string): void {
            this._rotateValues = this._rotateValues || [];
            this._rotateValues.push(value);
            if (!this._start) {
                this._start = true;
                this.showRotateNotice(this._rotateValues.pop());
                Laya.timer.loop(1, this, this.onFrame)
            }
        }
        private showRotateNotice(value: string): void {
            let t: ChatNotice = this;
            if (!t._rotateBg) {
                t._rotateBg = new Laya.Image();
                t._rotateBg.source = Laya.loader.getRes("chat/rotateBg.png");
                t._rotateBg.sizeGrid = "1,1,1,1";
                t._rotateBg.width = 612;
                t._rotateBg.height = 45;
                t._rotateBg.y = 55;
                t._rotateBg.scrollRect = new Laya.Rectangle(0, 0, 612, 45);
                t._parent.addChild(t._rotateBg);
            }
            if (!t._rotateTx) {
                t._rotateTx = new Laya.Text();
                t._rotateTx.font = "汉仪中圆简";
                t._rotateTx.fontSize = 15;
                t._rotateTx.y = 15;
                t._rotateTx.color = "#ffffff";
                t._rotateBg.addChild(t._rotateTx);
            }
            t._rotateBg.visible = true;
            t._rotateTx.x = 622;
            t._rotateTx.text = value;
        }
        private onFrame(): void {
            this._rotateTx.x -= 1;
            if (this._rotateTx.x + this._rotateTx.width < 0) {
                this._rotateValues.length > 0 ? this.showRotateNotice(this._rotateValues.pop())
                    : (Laya.timer.clear(this, this.onFrame), this._start = this._rotateBg.visible = false);
            }
        }
        private hideRotateNotice(): void {
            if (this._rotateBg) {
                Laya.timer.clear(this, this.onFrame);
                this._rotateBg.visible = false
            }
        }

        /**
         * 展示系统公告
         * @param value 公告内容 
         */
        public showSystemNotice(value: string): void {
            let t: ChatNotice = this;
            if (!this._systemBg) {
                t._systemBg = new Laya.Image();
                t._systemBg.source = Laya.loader.getRes("chat/systemBg.png");
                t._systemBg.sizeGrid = "1,1,1,1";
                t._systemBg.width = 612;
                t._systemBg.height = 45;
                t._systemBg.y = 382;
                t._parent.addChild(t._systemBg);
            }
            if (!t._systemNoticeTx) {
                t._systemNoticeTx = new Laya.Text();
                t._systemNoticeTx.font = "汉仪中圆简";
                t._systemNoticeTx.fontSize = 15;
                t._systemNoticeTx.pos(22, 4);
                t._systemNoticeTx.width = 582;
                t._systemNoticeTx.wordWrap = true;
                t._systemNoticeTx.leading = 4;
                t._systemNoticeTx.align = "center";
                t._systemNoticeTx.color = "#ffffff";
                t._systemBg.addChild(t._systemNoticeTx);
            }
            t._systemBg.visible = true;
            t._systemNoticeTx.text = value;
        }
        private hideSystemNotice(): void {
            this._systemBg && (this._systemBg.visible = false);
        }

        public dispose(): void {
            let list: Laya.Sprite[] = [this._rotateTx, this._rotateBg, this._systemBg, this._systemNoticeTx];
            _.forEach(list, (ele: Laya.Sprite) => {
                ele && ele.destroy();
                ele = null;
            });
            Laya.timer.clear(this, this.onFrame)
            this._rotateValues = null;
        }
    }
}