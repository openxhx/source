
/// <reference path="MapBase.ts" />
namespace clientCore {

    export class AnswerMap extends MapBase {

        constructor() { super(); }

        async init(): Promise<void> {
            UIManager.changeMainUI('answer');
            await super.init();
        }
    }
}