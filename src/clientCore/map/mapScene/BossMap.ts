
/// <reference path="MapBase.ts" />
namespace clientCore {

    export class BossMap extends MapBase {

        constructor() { super(); }

        async init(): Promise<void> {
            let promises: Promise<void>[] = ModuleManager.loadModule('boss');
            promises.push(xls.load(xls.bossReward));
            await Promise.all(promises);
            UIManager.changeMainUI('boss');
            await super.init();
        }
    }
}