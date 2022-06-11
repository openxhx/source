
namespace clientCore {


    export interface BaseModel {
        dispose(): void;
    }
    export interface BaseControl {
    }

    /**
     * 框架管理
     * 这里借用了ECS的理念 申请一个序列数组 按照下标标记模块
     */
    export class CManager {
        private static readonly SIGN_COUNT: number = 20;
        private static _models: BaseModel[] = new Array(CManager.SIGN_COUNT);
        private static _controls: BaseControl[] = new Array(CManager.SIGN_COUNT);

        constructor() { }

        /**
         * 注册模块
         * @param model
         * @param control
         * @return 返回注册模块的下标 
         */
        public static regSign(model: BaseModel, control: BaseControl): number {
            for (let i: number = 0; i < this.SIGN_COUNT; i++) {
                if (!this._models[i] && !this._controls[i]) {
                    this._models[i] = model;
                    this._controls[i] = control;
                    //TODO control需要访问model
                    control['sign'] = i;
                    return i;
                }
            }
            console.error(`模块注册的上限为${this.SIGN_COUNT}`);
            return -1;
        }

        public static unRegSign(sign: number): void {
            this._models[sign]?.dispose();
            this._models[sign] = this._controls[sign] = null;
        }

        public static getModel(sign: number): BaseModel {
            let model: BaseModel = this._models[sign];
            if (!model) {
                console.error(`sign为${sign}的模块似乎并未注册~`);
            }
            return model;
        }

        public static getControl(sign: number): BaseControl {
            let control: BaseControl = this._controls[sign];
            if (!control) {
                console.error(`sign为${sign}的模块似乎并未注册~`);
            }
            return control;
        }
    }

}