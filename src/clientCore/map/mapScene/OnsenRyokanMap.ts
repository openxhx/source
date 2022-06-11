
/// <reference path="MapBase.ts" />
namespace clientCore {

    export class OnsenRyokanMap extends MapBase {

        constructor() { super(); }

        async init(): Promise<void> {
            await res.load("atlas/main/onsenRyokan.atlas");
            UIManager.changeMainUI('onsenRyokan');
            await super.init();
        }
    }
}