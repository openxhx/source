namespace core {
    export class BaseModule extends Laya.View {

        /** 使用CManager框架产生的sign*/
        public sign: number;
        /** 作为弹窗时 是否需要侧边关闭 默认为true*/
        public sideClose: boolean = false;
        /** 是否是弹窗*/
        public isDialog: boolean = false;
        /** 是否是全面屏*/
        public fullScreen: boolean = false;
        /** 是否是模块- 现在是默认通过ModuleManager打开是模块 如果用其他方式打开模块 请复写实现^_^ */
        public isMod: boolean = false;
        /** 关闭时需要打开的模块*/
        public needOpenMod: string;
        /** 关闭时需要打开模块参数 */
        public needOpenData: any;
        /** 是否立即关闭模块*/
        public isPromptlyClose: boolean = false;

        /** 以下是偏移比例*/
        public offsetX: number = 0.5;
        public offsetY: number = 0.5;

        protected _preLoadList: Promise<any>[] = [];
        protected _data: any;
        protected _closed: boolean = false;

        constructor() {
            super();
        }
        /** 第1步 初始化，可以在这里面初始化ui 添加preload */
        public init(d: any) {
            this._data = d;
            this._closed = false;
        }

        /** 第2步 加载preload，同时无序加载(子类不要重写/继承该方法) */
        public waitPreLoad() {
            return Promise.all(this._preLoadList);
        }

        /** 第3步 序列预加载项 在preload完成后执行，子类重写时需全用await
        *   public async SeqPreLoad() {
        *       await fun1();
        *       await fun2();
        *   }
        */
        public async seqPreLoad() {
        }

        /** 第4步 所有预加载完成，loading条关闭*/
        public onPreloadOver() {
        }

        /** 第5步 添加事件 */
        public addEventListeners() {
        }

        /**第6步 初始化完成 事件也添加完成 */
        public initOver() {

        }
        /**第七部，loading条隐藏完了 新手引导用，
         * 在其他方法里面调用，会出现loading还没隐藏，新手引导的半透明遮罩就出现
         * 有点不太对，所以需要早loading条隐藏完，在显示引导的遮罩
        */

        /** 弹出完成*/
        public popupOver(): void {
        }

        public removeEventListeners() {
        }

        public destroy() {
            this._closed = true;
            if (this.fullScreen && core.GameConfig.enterGame) { //每次关闭全面屏的时候 清理一次未用到的资源
                Laya.Resource.destroyUnusedResources();
            }
            if (!this.isMod || this.isDialog || this.fullScreen) {
                this._onClose();
            } else {
                EventManager.event(globalEvent.CLOSE_DIALOG_MODULE, this);
            }
        }

        protected _onClose(): void {
            this._data = null;
            this._preLoadList = []; //赋值新对象 旧的对象引用计数为0 等待js垃圾回收
            this.removeEventListeners();
            this.removeSelf();
            this.event(Laya.Event.CLOSE);
            // if (this.parent) {
            //     if (this.isDialog)
            //         this.removeSelf();
            //     else
            //         super.destroy();
            // }
        }

        public closeMod(): void {
            this._onClose();
        }

        /** 预加载的长度*/
        public get preLength(): number {
            return this._preLoadList.length;
        }

        /** 添加预加载项（无序，同时进行） */
        protected addPreLoad(pro: Promise<any>) {
            this._preLoadList.push(pro);
        }
    }
}