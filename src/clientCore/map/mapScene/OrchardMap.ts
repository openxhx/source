/// <reference path="MapBase.ts" />
namespace clientCore {

    export class OrchardMap extends MapBase {

        constructor() { super(); }

        async init(): Promise<void> {
            UIManager.changeMainUI('orchard');
            //预加载资源
            await Promise.all([
                xls.load(xls.miniCatcher),
                ModuleManager.loadatlas('orchard'),
                ModuleManager.loadModule('pickingApple')
            ])
            await super.init();
        }
    }
}