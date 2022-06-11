namespace alert {
    const WIDTH = 700;
    const HEIGHT = 64;
    const SKIN = 'alert/105.png';
    const GRID = '0,121,0,128';
    const RECT = new Laya.Rectangle(0, 0, WIDTH, HEIGHT);
    export interface IScrollStyle {
        skin: string,
        grid: string,
        width: number,
        height: number,
        /**文本滚动区域,如果不传，就用上面的宽高(只关注x,y和width,字号不变) */
        scrollRect?: Laya.Rectangle
    }
    export class ScrollWords {
        private static _instance: ScrollWords;
        private _isShowing: boolean = false;
        private _words: string[];
        private _imgbg: Laya.Image;
        private _txt: Laya.Label;
        private _panel: Laya.Panel;
        private _imgClose: Laya.Image;

        static get ins() {
            this._instance = this._instance || new ScrollWords();
            return this._instance;
        }

        constructor() {
            this._imgbg = new Laya.Image(SKIN);
            this._panel = new Laya.Panel();

            this._imgbg.addChild(this._panel);
            this._imgClose = new Laya.Image('commonBtn/btn_l_y_close.png');
            this._imgClose.on(Laya.Event.CLICK, this, this.onClick);
            this._imgbg.addChild(this._imgClose);
            this.setStyle({ grid: GRID, width: WIDTH, height: HEIGHT, scrollRect: RECT, skin: SKIN });
            this._txt = new Laya.Label();
            this._txt.fontSize = 30;
            this._txt.font = "汉仪中圆简";
            this._txt.color = "#805329";
            this._txt.bold = false;
            this._txt.wordWrap = false;
            this._panel.addChild(this._txt);
            this._imgbg.y = Laya.stage.height / 6;
            this._words = [];


        }

        private onClick(): void {
            alert.showSmall('是否关闭通告，本次游戏不再弹出？', {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        clientCore.GlobalConfig.needNotice = false;
                        egret.Tween.removeTweens(this._imgbg);
                        egret.Tween.removeTweens(this._txt)
                        this._imgbg.removeSelf();
                    }]
                }
            })
        }

        show(str: string) {
            this._words.push(str);
            if (!this._isShowing) {
                this.showOneWord()
            }
        }

        setStyle(style: IScrollStyle) {
            this._imgbg.skin = style.skin;
            this._imgbg.sizeGrid = style.grid;
            this._imgbg.width = style.width;
            this._panel.x = style.scrollRect ? style.scrollRect.x : 0;
            this._panel.width = style.scrollRect ? (style.scrollRect.width - style.scrollRect.x) : style.width;
            this._imgbg.x = clientCore.LayerManager.stageWith / 2 - this._imgbg.width / 2;
            this._panel.y = style.height / 2 - 15;

            this._imgClose.x = this._panel.width;
            // this._imgClose.y = 
        }

        setDefaultStyle() {
            //当前有特殊的style，不让恢复
            if (this._isShowing && this._imgbg.skin != SKIN) {
                return;
            }
            this.setStyle({ grid: GRID, skin: SKIN, width: WIDTH, height: HEIGHT });
        }

        private showOneWord() {
            egret.Tween.removeTweens(this._imgbg);
            egret.Tween.removeTweens(this._txt)
            if (this._words.length > 0) {
                this._isShowing = true;
                this._txt.x = this._imgbg.width;
                this._txt.text = this._words.shift();
                let targetX = -this._txt.width;
                let time = Math.abs(targetX) / 100 * 2000;
                this._imgbg.alpha = 0;
                egret.Tween.get(this._imgbg).to({ alpha: 1 }, 300).wait(time).to({ alpha: 0 }, 300).call(this.showOneWord, this);
                egret.Tween.get(this._txt).wait(300).to({ x: targetX }, time);
                clientCore.LayerManager.alertLayer.addChild(this._imgbg);
            }
            else {
                this._isShowing = false;
                this._imgbg.removeSelf();
            }
        }
    }
}