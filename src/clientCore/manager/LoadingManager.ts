namespace clientCore {
    export class LoadingManager {
        private static _ui: ui.loading.LoadingUI;
        private static _smallUI: ui.loading.LoadingSmallUI;
        private static _darkUI: ui.loading.LoadingDarkUI;
        private static _nowProgress: number;
        private static WIDTH: number = 1182;
        private static _smallLoadingOpenTime: number;
        private static _loadingMsg: string;
        public static async setup() {
            LoadingManager._ui = new ui.loading.LoadingUI();
            LoadingManager._nowProgress = 0;
            LayerManager.loadingLayer.mouseEnabled = true;
            LoadingManager._smallUI = new ui.loading.LoadingSmallUI();
            // LoadingManager._ui.txtTips.filters = [new Laya.GlowFilter('#e965a7', 1)]
        }

        public static show(msg: string) {
            this._loadingMsg = msg;
            Laya.Tween.clearAll(LoadingManager._ui);
            if (LoadingManager._nowProgress == 0) {
                LoadingManager._nowProgress = 0;
                LoadingManager._ui.txt.text = this._loadingMsg + " 0%";
                LoadingManager._ui.imgProgress.width = 0;
                LoadingManager._ui.imgFlower.x = LoadingManager._ui.imgProgress.x;
            }
            LoadingManager._ui.alpha = 1;
            let ranRole = Math.floor(Math.random() * 3) + 1;
            console.log(`res/bg/loadingImage/${ranRole}.png`);
            LoadingManager._ui.imgRole.skin = `res/bg/loadingImage/${ranRole}.png`;

            let ranTips = xls.get(xls.loadingTips).getValues()[_.random(0, xls.get(xls.loadingTips).length - 1, false)];
            LoadingManager._ui.txtTips.text = ranTips.tipDesc;
            LayerManager.loadingLayer.mouseThrough = false;
            LayerManager.loadingLayer.addChild(LoadingManager._ui);
        }

        /** 打开一个转菊花小loading */
        public static showSmall(txt?: string) {
            this._smallUI.ani1.play(0, true);
            LayerManager.loadingLayer.addChild(LoadingManager._smallUI);
            LayerManager.loadingLayer.mouseThrough = false;
            this._smallLoadingOpenTime = new Date().getTime();
            this._smallUI.txt.visible = txt ? true : false;
            if (txt)
                this._smallUI.txt.text = txt;
            Laya.timer.clearAll(this);
        }

        public static showProgress(txt: string): void {
            if (this._smallUI) {
                this._smallUI.txt.visible = txt ? true : false;
                this._smallUI.txt.text = txt;
            }
        }

        /**
         * 关闭转菊花loading 如果转菊花时间小于0.5s 则0.5s后再关闭 返回promise对象
         * @param force 立即关闭
         */
        public static hideSmall(force: boolean = false) {
            let now = new Date().getTime();
            let diff = now - this._smallLoadingOpenTime;
            if (force) {
                this.removeSmallLoading();
                return;
            }
            return new Promise((ok) => {
                Laya.timer.once(diff < 300 ? 300 : diff, this, () => {
                    ok();
                    this.removeSmallLoading();
                })
            })
        }

        /**
         * 打开一个渐黑的遮罩
         */
        public static showDark() {
            this._darkUI = this._darkUI || new ui.loading.LoadingDarkUI();
            LayerManager.loadingLayer.addChild(this._darkUI);
            this._darkUI.ani1.stop();
            this._darkUI.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
            this._darkUI.ani1.offAll();
            //这里需要处理个问题 动画如果被从舞台上移除，不会继续播放触发complete事件（removeSmallLoading  hide方法都可能触发）
            let remove = new Promise((ok) => { this._darkUI.once(Laya.Event.REMOVED, this, ok); })
            let playOver = new Promise((ok) => { this._darkUI.ani1.once(Laya.Event.COMPLETE, this, ok); })
            this._darkUI.ani1.play(0, false);
            return Promise.race([remove, playOver]);
        }

        /**
         * 关闭渐黑图
         * @param force 立刻关闭
         */
        public static hideDark(force: boolean = false): void {
            if (this._darkUI && this._darkUI.parent) {
                this._darkUI.ani1.stop();
                if(force){
                    this._darkUI.removeSelf();
                    return;
                }
                this._darkUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                this._darkUI.ani1.once(Laya.Event.COMPLETE, this._darkUI, this._darkUI.removeSelf);
                this._darkUI.ani1.play(0, false);
            }
        }

        private static removeSmallLoading() {
            LayerManager.loadingLayer.removeChildren();
            LayerManager.loadingLayer.mouseThrough = true;
        }

        /**
         * 设置loading 进度或者文本
         * @param param 0-100 或者 string
         */
        public static setLoading(txt: string, progress: number) {
            return new Promise((ok) => {
                if (LoadingManager._ui) {
                    if (clientCore.GlobalConfig.isIosTest) {
                        let ranTips = xls.get(xls.loadingTips).getValues()[_.random(0, xls.get(xls.loadingTips).length - 1, false)];
                        LoadingManager._ui.txtTips.text = ranTips.tipDesc;
                        this._loadingMsg = '正在进入拉贝尔大陆...';
                    }
                    progress = ~~progress;
                    if (progress > LoadingManager._nowProgress) {
                        LoadingManager._nowProgress = progress;
                        Laya.Tween.clearTween(LoadingManager._ui.imgProgress);
                        Laya.Tween.to(LoadingManager._ui.imgProgress, { width: progress / 100 * LoadingManager.WIDTH }, 70, null,
                            new Laya.Handler(null, () => {
                                LoadingManager._ui.txt.text = this._loadingMsg + progress + '%';
                                ok();
                            }));
                        Laya.Tween.to(LoadingManager._ui.imgFlower, { x: (LoadingManager._ui.imgProgress.x + progress / 100 * LoadingManager.WIDTH) }, 70, null, null);
                    }
                    else {
                        ok();
                    }
                }
                else {
                    ok();
                }
            });
        }

        public static hide(): Promise<any> {
            return new Promise((ok) => {
                Laya.Tween.clearTween(this._ui.imgProgress);
                this._ui.imgProgress.width = this.WIDTH;
                Laya.Tween.to(this._ui, { alpha: 0 }, 400, null, new Laya.Handler(this, () => {
                    LayerManager.loadingLayer.removeChildren();
                    LayerManager.loadingLayer.mouseThrough = true;
                    this._nowProgress = 0;
                    ok();
                }));
            });
        }
    }
}