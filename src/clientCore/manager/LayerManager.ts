namespace clientCore {
    export const enum MODE {
        HENG = 'heng',  //横屏模式
        SHU = 'shu'     //竖屏模式
    }
    export const enum DisplayLayer {
        MAP,      // 地图层
        JOY,      //摇杆层
        SCREEN_SHOT,//地图截屏
        DOWN_UI, //UI下层
        BATTLE,  //战斗层
        BATTLE_UI,  //战斗UI层
        UI,       // UI框层
        // MAIN_FULL_SCREEN,     //主界面满屏层
        // MAIN_DIALOG, // 主界面弹出层
        MAIN, //主页面
        MAIN_UP,  // UI上层
        ALERT,    // 弹出层
        LOADING,  // 加载动画层
        GUIDE,
        SYSTEM,    //系统显示
        CLICK_EFFECT,//点击特效层
        BG_SHOW //全屏背景秀
    }

    const MAX_EFFECT = 3;

    export class LayerManager {
        public static mapLayer: core.BaseLayer;
        public static joyLayer: core.BaseLayer;//此层坐标永远为0,0
        public static screenShotLayer: core.BaseLayer;
        public static bgshowLayer: core.BaseLayer;
        public static battleLayer: core.BaseLayer;
        public static battleUILayer: core.BaseLayer;
        public static downUILayer: core.BaseLayer; //UI下层
        public static uiLayer: core.BaseLayer;
        public static mainLayer: core.BaseLayer;
        public static upMainLayer: core.BaseLayer; //UI上层

        public static alertLayer: core.BaseLayer;
        public static loadingLayer: core.BaseLayer;
        public static guideLayer: core.BaseLayer;
        public static systemLayer: core.BaseLayer;
        public static clickEffectLayer: core.BaseLayer;

        private static _layers: core.BaseLayer[];
        private static _moshiLayers: core.BaseLayer[];      //设置界面模式影响的界面

        /**mainLayer和stage的X轴偏移 */
        public static OFFSET: number;

        /**界面模式--横屏/竖屏 */
        private static _moshi: MODE = MODE.HENG;

        public static setup() {
            LayerManager.mapLayer = new core.BaseLayer(DisplayLayer.MAP);
            LayerManager.uiLayer = new core.BaseLayer(DisplayLayer.UI);
            LayerManager.joyLayer = new core.BaseLayer(DisplayLayer.JOY);
            LayerManager.screenShotLayer = new core.BaseLayer(DisplayLayer.SCREEN_SHOT);
            LayerManager.bgshowLayer = new core.BaseLayer(DisplayLayer.BG_SHOW);
            LayerManager.battleLayer = new core.BaseLayer(DisplayLayer.BATTLE);
            LayerManager.battleUILayer = new core.BaseLayer(DisplayLayer.BATTLE_UI);
            LayerManager.downUILayer = new core.BaseLayer(DisplayLayer.DOWN_UI);
            LayerManager.mainLayer = new core.BaseLayer(DisplayLayer.MAIN);
            LayerManager.upMainLayer = new core.BaseLayer(DisplayLayer.MAIN_UP);
            LayerManager.alertLayer = new core.BaseLayer(DisplayLayer.ALERT);
            LayerManager.loadingLayer = new core.BaseLayer(DisplayLayer.LOADING);
            LayerManager.guideLayer = new core.BaseLayer(DisplayLayer.GUIDE);
            LayerManager.systemLayer = new core.BaseLayer(DisplayLayer.SYSTEM);
            LayerManager.clickEffectLayer = new core.BaseLayer(DisplayLayer.CLICK_EFFECT);
            LayerManager._layers = [
                LayerManager.mapLayer,
                LayerManager.joyLayer,
                LayerManager.downUILayer,
                LayerManager.battleLayer,
                LayerManager.battleUILayer,
                LayerManager.uiLayer,
                LayerManager.screenShotLayer,
                LayerManager.bgshowLayer,
                LayerManager.mainLayer,
                LayerManager.upMainLayer,
                LayerManager.alertLayer,
                LayerManager.loadingLayer,
                LayerManager.guideLayer,
                LayerManager.systemLayer,
                LayerManager.clickEffectLayer
            ];
            LayerManager._moshiLayers = [
                LayerManager.upMainLayer,
                LayerManager.alertLayer,
                LayerManager.systemLayer
            ];
            LayerManager._layers.forEach((layer) => {
                Laya.stage.addChild(layer)
            });
            this.resizeView();
            // this.enableClickEffect();
        }

        public static resizeView(): void{
            let offetX: number = (Laya.stage.width - Laya.stage.designWidth) / 2;
            let needOffx: core.BaseLayer[] = [LayerManager.mainLayer, LayerManager.battleUILayer, LayerManager.loadingLayer];
            this.OFFSET = offetX;
            _.forEach(needOffx, (element: core.BaseLayer) => {
                element.x = offetX;
            });
        }

        /**开启屏幕点击特效 */
        public static enableClickEffect() {
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.playEffect);
        }

        /**关闭屏幕点击特效 */
        public static disableClickEffect() {
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.playEffect);
            LayerManager.clickEffectLayer.removeChildren();
        }

        private static playEffect(e: Laya.Event) {
            if (LayerManager.clickEffectLayer.numChildren < MAX_EFFECT) {
                let effect = BoneMgr.ins.play('res/animate/mcPick/click.sk', 0, false, LayerManager.clickEffectLayer);
                effect.pos(e.stageX, e.stageY);
            }
        }

        public static playEffect2(x: number, y: number) {
            // if (LayerManager.clickEffectLayer.numChildren < MAX_EFFECT) {
                let effect = BoneMgr.ins.play('res/animate/mcPick/click.sk', 0, false, LayerManager.clickEffectLayer);
                effect.pos(x, y);
            // }
        }

        public static createScreenShot() {
            let screenShot = new Laya.Sprite();
            screenShot.size(Laya.stage.width, Laya.stage.height);
            if(clientCore.GlobalConfig.isH5) {
                return screenShot;
            }
            if (Laya.Render.isConchApp) {
                screenShot.texture = Laya.stage.drawToCanvas(Laya.Browser.mainCanvas._width, Laya.Browser.mainCanvas._height, 0, 0).getTexture();
            }
            else {
                screenShot.texture = Laya.stage.drawToTexture(Laya.Browser.mainCanvas._width, Laya.Browser.mainCanvas._height, 0, 0);
            }
            screenShot.filters = [new Laya.BlurFilter(5)]
            return screenShot;
        }

        public static hideScreenShot() {
            this.screenShotLayer.visible = false;
            this.screenShotLayer.mouseEnabled = false;
        }

        /**获取当前界面模式--横屏/竖屏状态下舞台宽度 */
        public static get stageWith(): number {
            return this._moshi == MODE.HENG ? Laya.stage.width : Laya.stage.height;
        }

        /**获取当前界面模式--横屏/竖屏状态下舞台宽度 */
        public static get stageHeight(): number {
            return this._moshi == MODE.HENG ? Laya.stage.height : Laya.stage.width;
        }

        /**获取界面模式 */
        public static get moshi(): MODE {
            return this._moshi;
        }

        /**设置界面模式 */
        public static set moshi(value: MODE) {
            this._moshi = value;
            if (value == MODE.HENG) {
                this.setupHengUI();
            } else {
                this.setupShuUI();
            }
        }

        /**将界面设置成横屏 */
        private static setupHengUI(): void {
            let stageWith = this.stageWith;
            let stageHeight = this.stageHeight;

            LayerManager._layers.forEach((layer) => {
                layer.y = 0;
                layer.rotation = 0;
                layer.width = stageWith;
                layer.height = stageHeight;
            });
        }

        /**将界面设置成竖屏 */
        private static setupShuUI(): void {
            let stageWith = this.stageWith;
            let stageHeight = this.stageHeight;

            LayerManager._moshiLayers.forEach((layer) => {
                layer.y = stageWith;
                layer.rotation = -90;
                layer.width = stageWith;
                layer.height = stageHeight;
            });
        }
    }
}