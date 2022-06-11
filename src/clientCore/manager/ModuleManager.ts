namespace clientCore {
    export interface ModOpenConfig {
        openWhenClose?: string
        openData?: any
    }
    export class ModuleManager {
        /**模块缓存(用来判断这个模块是否加载过) key:模块名（namespace） */
        private static _moduleCacheHashMap: util.HashMap<boolean>;
        /**模块配置表 key:模块全路径*/
        private static _moduleXlsHash: util.HashMap<xls.moduleOpen>;
        /**当前打开着的模块(关闭了会清除里面的值) key:模块名(全路径)*/
        private static _opendModuleHash: util.HashMap<core.BaseModule>;
        private static _mcBgImg: Laya.Image;
        private static _opening: boolean
        // private static _moduleOpenList:{name:string,bgImg:Laya.Sprite,mod:core.BaseModule}[];
        public static setup() {
            this._moduleCacheHashMap = new util.HashMap();
            this._opendModuleHash = new util.HashMap();
            this._moduleXlsHash = new util.HashMap();
            // this._moduleOpenList = [];
            _.forEach(xls.get(xls.moduleOpen).getValues(), (ele: xls.moduleOpen) => {
                this._moduleXlsHash.add(ele.name, ele)
            });
            this._mcBgImg = new Laya.Image();
            this._opening = false;
        }

        public static async open(viewName: string, data?: any, opt?: ModOpenConfig): Promise<core.BaseModule> {
            if (this._opening || this._opendModuleHash.has(viewName)) //正在打开 或者模块已经打开了
                return Promise.reject(null);

            //TODO 如果是三星公益则特殊处理
            if (clientCore.GlobalConfig.isSamsungGy) {
                if (viewName == 'commonShop.CommonShopModule') {
                    viewName = 'samsungShop.SamsungShopModule';
                } else if (viewName == 'chat.ChatModule') {
                    viewName = 'samsungChat.SamsungChatModule';
                }
            }

            this._opening = true;
            let moduleName: string = viewName.split('.')[0];
            let className: string = _.last(viewName.split('.'));
            let modXlsInfo: xls.moduleOpen = this._moduleXlsHash.has(viewName) ? this._moduleXlsHash.get(viewName) : {
                id: 0,
                name: moduleName,
                fullScreen: 0,
                bg: "",
                desc: '',
                reqMap: 0,
                extraData: ''
            };
            //------模块加载前，处理loading  ui显示等逻辑
            await this.beforeModuleLoad(modXlsInfo, moduleName);
            //------模块正式加载
            let haveCache = this._moduleCacheHashMap.has(moduleName);
            //方便调试非app模式全部重新加载
            if (!haveCache || !clientCore.GlobalConfig.isApp) {
                await Promise.all([
                    this.loadJs(moduleName),
                    this.loadatlas(moduleName),
                    this.loadUnpack(moduleName),
                    this.loadModuleBg(modXlsInfo.bg)]);
            }
            Laya.MouseManager.multiTouchEnabled = false; //打开模块的时候关闭多指操作 在模块的关闭的时候会自动打开。。
            let mod: core.BaseModule = new window[moduleName][className]();
            mod.isMod = true;
            mod.fullScreen = modXlsInfo.fullScreen == 1;
            mod.init(data);
            if (opt) {
                mod.needOpenMod = opt.openWhenClose;
                mod.needOpenData = opt.openData;
            }
            try {
                await mod.waitPreLoad();
                await mod.seqPreLoad();
            }
            catch {
                this._opening = false;
            }
            /**加载模块全屏大图 */
            if (modXlsInfo.bg != "") {
                this._mcBgImg.skin = pathConfig.getModuleBgImg(modXlsInfo.bg);
                this._mcBgImg.anchorX = 0.5;
                this._mcBgImg.x = Laya.stage.width / 2;
            }
            mod.onPreloadOver();
            mod.addEventListeners();
            mod.initOver();
            //------模块加载后，处理loading并将模块加载上舞台
            mod.once(Laya.Event.CLOSE, this, this.onModClose, [viewName]);
            await this.afterModuleLoad(modXlsInfo, mod, moduleName);
            //loading完成后，最后一个BaseModule方法
            console.log("加载了 " + moduleName + " 模块-------------------");
            this._moduleCacheHashMap.add(moduleName, true);
            // if (this._opendModuleHash.length > 0 && hideCur) {
            //     let lastMod = _.last(this._opendModuleHash.getValues());
            //     lastMod.visible = false;
            // }
            this._opendModuleHash.add(viewName, mod);
            this._opening = false;
            EventManager.event("MODULE_OPEN_ALL_OVER");
            return Promise.resolve(mod);
        }

        public static resizeView(): void {
            if (this._mcBgImg) this._mcBgImg.x = Laya.stage.width / 2;
            _.forEach(this._opendModuleHash.getValues(), (element: core.BaseModule) => {
                element.fullScreen && this.handleCloseBtn(element);
            })
        }

        public static get opening(): boolean {
            return this._opening;
        }

        private static handleCloseBtn(mod: core.BaseModule) {
            let backBtn = mod['btnClose'] || mod['btnBack'];
            if (backBtn) {
                backBtn.pos(60 - (Laya.stage.width - Laya.stage.designWidth) / 2, 40, true);
            }
            mod.hitArea = new Laya.Rectangle(-clientCore.LayerManager.mainLayer.x, 0, Laya.stage.width, Laya.stage.height);
        }

        private static async beforeModuleLoad(xlsInfo: xls.moduleOpen, moduleName: string) {
            if (xlsInfo.fullScreen)
                //全屏模块使用黑色过渡
                await clientCore.LoadingManager.showDark();
            else {
                //没有缓存过的非全屏模块，打开转菊花
                if (!this._moduleCacheHashMap.has(moduleName))
                    clientCore.LoadingManager.showSmall();
            }
            //全屏面板影藏地图 UI 摇杆减少dc
            if (xlsInfo.fullScreen) {
                LayerManager.mapLayer.visible = LayerManager.uiLayer.visible = LayerManager.joyLayer.visible = false;
            }
            //无论是否全屏 影藏人物层
            MapManager.hideAllPeople();
        }

        private static async afterModuleLoad(xlsInfo: xls.moduleOpen, mod: core.BaseModule, modName: string) {
            //禁止点击下面的层
            LayerManager.mapLayer.mouseEnabled = LayerManager.uiLayer.mouseEnabled = LayerManager.joyLayer.mouseEnabled = false;
            //停止地图同步
            PeopleManager.getInstance().stopListen();
            //按是否全屏 加载到对应的layer并关闭对应loading
            if (xlsInfo.fullScreen) {
                //全屏就直接开
                clientCore.LoadingManager.hideDark();
                LayerManager.mainLayer.addChild(mod);
                this.handleCloseBtn(mod);
                if (xlsInfo.bg) {
                    LayerManager.screenShotLayer.addChild(this._mcBgImg);
                }
                mod.popupOver();
            } else {
                //非全屏需要一个中心放大动画
                await clientCore.LoadingManager.hideSmall(this._moduleCacheHashMap.has(modName));
                ModuleMgr.ins.open(mod)
            }
        }

        private static async onModClose(viewName: string) {
            console.log("close module name: " + viewName);
            if (this._opendModuleHash.has(viewName)) {
                let mod: core.BaseModule = this._opendModuleHash.get(viewName);
                let needOpenMod = mod.needOpenMod;
                let openData = mod.needOpenData;
                let needCheck = mod.fullScreen;
                this._opendModuleHash.remove(viewName);
                this.handleModuleClose();
                clientCore.BgShowManager.instance.hideFullScreenBgShow(); //这里自动关闭下全屏背景秀
                if (needOpenMod)
                    ModuleManager.open(needOpenMod, openData);
                else {
                    if (this._opendModuleHash.length == 0 && needCheck)
                        EventManager.event(globalEvent.FULL_SCREEN_CLOSE_OR_BACK_HOME);
                }
            }
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
        static async loadModuleBg(bg: string) {
            return res.load((bg != "" ? pathConfig.getModuleBgImg(bg) : ""), Laya.Loader.IMAGE, false);
        }

        /**处理模块关闭（如果没有打开着的 显示一些层） */
        private static async handleModuleClose() {
            if (this._opendModuleHash.length == 0) {
                Laya.MouseManager.multiTouchEnabled = true;//所有模块都关闭了 打开多指
                !MapInfo.mapEditState && MapManager.showAllPeople();
                LayerManager.mapLayer.visible = LayerManager.uiLayer.visible = LayerManager.joyLayer.visible = true;
                LayerManager.mapLayer.mouseEnabled = LayerManager.uiLayer.mouseEnabled = LayerManager.joyLayer.mouseEnabled = true;
                //开始地图同步
                PeopleManager.getInstance().startListen();
                if (this._mcBgImg.parent) {
                    await LoadingManager.showDark();
                    if (this._opendModuleHash.length == 0 || !this.isFullScreen()) {
                        this._mcBgImg.removeSelf();
                        this._mcBgImg.skin = '';
                    }
                    LoadingManager.hideDark();
                }
            }
            // else {
            //     let key = this._opendModuleHash.getKeys();
            //     let name = _.last(key);
            //     this._opendModuleHash.get(name).visible = true;
            //     let bg: string = this._moduleXlsHash.has(name) ? this._moduleXlsHash.get(name).bg : "";
            //     if (bg != "") {
            //         this._mcBgImg.skin = pathConfig.getModuleBgImg(bg);
            //     }
            // }
        }

        /**更换背景图片 */
        public static changeBgSkin(bgPngName: string) {
            this._mcBgImg.skin = pathConfig.getModuleBgImg(bgPngName);
        }

        private static isFullScreen(): boolean {
            let mod = this._opendModuleHash.getValues()[0];
            return mod.fullScreen;
        }

        /**
         * 提前载入模块资源
         * @param moduleName 
         */
        public static loadModule(viewName: string) {
            let moduleName: string = viewName.split('.')[0];
            this._moduleCacheHashMap.add(moduleName, true);
            return [this.loadJs(moduleName), this.loadatlas(moduleName), this.loadUnpack(moduleName)];
        }
        /**
         * 
         * @param moduleName namespace名
         * @param needOpenMod 
         */
        public static closeModuleByName(moduleName: string, needOpenMod?: string, needOpenData?: any) {
            let arr = this._opendModuleHash.toArray();
            for (const o of arr) {
                let key = o[0];
                if (moduleName == key.split('.')[0]) {
                    let mod = o[1];
                    mod.needOpenMod = needOpenMod == void 0 ? mod.needOpenMod : needOpenMod;
                    mod.needOpenData = needOpenData;
                    mod.destroy();
                    this._opendModuleHash.remove(moduleName);
                    this.handleModuleClose();
                }
            }
        }
        /**gl
         * 检查某个模块是否开启
         * @param moduleName 模块名(包名)
         */
        public static checkModuleOpen(moduleName: string): boolean {
            let arr = this._opendModuleHash.toArray();
            for (const o of arr) {
                let key = o[0];
                if (moduleName == key.split('.')[0]) {
                    return true;
                }
            }
            return false;
        }

        public static checkModuleOpen2(moduleName: string): boolean {
            return this._opendModuleHash.has(moduleName);
        }


        /**关闭所有打开的模块 */
        public static closeAllOpenModule() {
            EventManager.event(globalEvent.CLOSING_ALL_MODULE);
            for (const mod of this._opendModuleHash.getValues()) {
                mod.needOpenMod = null;
                mod.needOpenData = null;
                mod.destroy();
            }
            this._opendModuleHash.clear();
            this.handleModuleClose();
            EventManager.event(globalEvent.CLOSE_ALL_MODULE)
        }
        public static get curShowModuleNum(): number {
            return this._opendModuleHash.getValues().length;
        }
    }
}