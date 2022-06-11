namespace clientCore {
    export enum EventUI {
        weddingItem
    }
    /**在UI层做展示的活动界面 */
    export class EventUIManager {
        /**模块缓存(用来判断这个模块是否加载过) key:模块名（namespace） */
        private static _moduleCacheHashMap: util.HashMap<boolean>;
        /**相关活动名称 */
        private static _eventuiNames: string[] = ["weddingItem"];
        /**ui界面约束 */
        private static _viewPosLimit: any[] = [{ bottom: 30, centerX: 50 }];
        /**相关动画资源 */
        private static _animationRes: string[][] = [[""]];
        /**当前UI */
        private static _curUI:Laya.View;

        public static setup() {
            this._moduleCacheHashMap = new util.HashMap();
        }

        public static async open(event: EventUI) {
            if(this._curUI) return;
            let moduleName: string = this._eventuiNames[event];
            //------模块加载前，处理loading  ui显示等逻辑
            await this.beforeModuleLoad(moduleName);
            //------模块正式加载
            let haveCache = this._moduleCacheHashMap.has(moduleName);
            //方便调试非app模式全部重新加载
            if (!haveCache || !clientCore.GlobalConfig.isApp) {
                await Promise.all([
                    this.loadJs(moduleName),
                    this.loadatlas(moduleName),
                    this.loadUnpack(moduleName),
                    this.loadAnimation(event)]);
            }
            switch(event){
                case EventUI.weddingItem:
                    // this._curUI = new 
                    break;
            }
        }

        private static async beforeModuleLoad(moduleName: string) {
            //没有缓存过的打开转菊花
            if (!this._moduleCacheHashMap.has(moduleName))
                clientCore.LoadingManager.showSmall();
        }

        static async loadJs(packName: string) {
            let url = clientCore.GlobalConfig.isApp ? `js/${packName}.js` : `js/${packName}.js?${Math.random()}`;
            return util.LoadScript(url).then((jsFile) => {
                let js = jsFile + "\n //@ sourceURL=src/" + packName + ".js";
                window["eval"](js);
            });
        }

        static async loadatlas(packName: string) {
            return res.load(`atlas/${packName}.atlas`, Laya.Loader.ATLAS);
        }

        static async loadUnpack(packName: string) {
            //大图不缓存
            return res.load(UnpackJsonManager.getUnpackUrls(packName), Laya.Loader.IMAGE, false);
        }

        static async loadAnimation(event: EventUI) {
            return res.load(this._animationRes[event]);
        }

        /**
         * 提前载入模块资源
         * @param moduleName 
         */
        public static loadModule(event: EventUI) {
            let moduleName: string = this._eventuiNames[event];
            this._moduleCacheHashMap.add(moduleName, true);
            return [this.loadJs(moduleName), this.loadatlas(moduleName), this.loadUnpack(moduleName), this.loadAnimation(event)];
        }
        /**
         * 
         */
        public static closeEventUI() {
            this._curUI.destroy();
        }
    }
}