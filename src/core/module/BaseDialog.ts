/// <reference path="BaseModule.ts" />

namespace core {
    /**
     * 弹窗基类
     */
    export class BaseDialog extends BaseModule {

        constructor() { super(); }

        public destroy(): void {
            this._onClose();
        }
    }
}