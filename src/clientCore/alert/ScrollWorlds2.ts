namespace alert {
    /**
     * 跑马灯标示
     * 可根据标示删除某种跑马灯
     * 标示与播放优先级成反比
     */
    export enum Sign {
        FLOWER_VEHICLE = 1, //花车
        BOSS_XM, //西蒙
        FOLWER_VEHICLE_SHOW, //花车炫耀公告
        FUNNY_TOY,//奇趣道具
        TREATURE,//宝藏探险
        ACTIVITY,//活动
        DEFAULT = 9999//默认
    }

    export class ScrollWordInfo {
        y: number = 32;
        width: number = 700;
        sizeGrid: string = '0,121,0,128';
        bgPath: string = 'alert/105.png';
        value: string;
        sign: number = Sign.DEFAULT;
        fontSize?: number;
        fontColor?: string;
        constructor() { }
    }

    const DEFAUL_INFO: ScrollWordInfo = {
        y: 32,
        width: 700,
        sizeGrid: '0,121,0,128',
        bgPath: 'alert/105.png',
        value: '',
        sign: Sign.DEFAULT,
        fontColor: '#805329',
        fontSize: 30
    }

    /**
     * 世界跑马灯
     */
    export class ScrollWords2 extends ui.alert.notice.ScrollWordUI {

        private static _instance: ScrollWords2;
        public static get instance(): ScrollWords2 {
            return this._instance || (this._instance = new ScrollWords2());
        }

        private _words: ScrollWordInfo[] = [];
        private _current: ScrollWordInfo;//当前正在播放的跑马灯

        constructor() {
            super();
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
        }

        public showTxt(data: ScrollWordInfo): void {
            this._words.push(data);
            this._words = _.sortBy(this._words, 'sign');
            if (!this.parent) {
                clientCore.LayerManager.alertLayer.addChild(this);
                this.start(this._words.shift());
            }
        }

        /** 停止跑马灯*/
        public stopWords(sign?: Sign): void {
            if (!sign) {
                util.TweenUtils.remove('ScrollWords2');
                this._words.length = 0;
                this.removeSelf();
            } else {
                this._words = _.filter(this._words, (element) => { return element.sign != sign; });
                if (this._current && this._current.sign == sign) {
                    util.TweenUtils.remove('ScrollWords2');
                    this._current = null;
                    this.end();
                }
            }
        }

        private start(data: ScrollWordInfo): void {
            data = _.assignIn(_.cloneDeep(DEFAUL_INFO), data);
            this._current = data;
            this.y = 36;
            this.x = Laya.stage.width / 2 - data.width / 2;
            this.panel.y = data.y;
            this.imgBG.skin = data.bgPath;
            this.imgBG.sizeGrid = data.sizeGrid;
            this.imgBG.width = data.width;
            this.valueTxt.x = 577;
            this.valueTxt.fontSize = data.fontSize;
            this.valueTxt.text = data.value;
            this.valueTxt.color = data.fontColor;
            util.TweenUtils.creTween(this.valueTxt, { x: -this.valueTxt.textWidth }, this.valueTxt.textWidth / 100 * 2000, null, this, this.end, 'ScrollWords2');
        }

        private end(): void {
            if (this._words.length <= 0) {
                this.removeSelf();
                return;
            }
            this.start(this._words.shift());
        }

        private onClose(): void {
            alert.showSmall('是否关闭通告，本次游戏不再弹出？', {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        clientCore.GlobalConfig.needNotice = false;
                        util.TweenUtils.remove('ScrollWords2');
                        this.btnClose.off(Laya.Event.CLICK, this, this.onClose);
                        this.removeSelf();
                        this._words.length = 0;
                    }]
                }
            })
        }
    }
}