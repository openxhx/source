namespace clientCore {
    export interface BaseMoveImp {
        enableMove();
        disableMove();
        mouseDown(e: Laya.Event);
        mouseMove(e: Laya.Event);
        mouseUpOrOut(e: Laya.Event);
        mouseWheel(e: Laya.Event);
    }
}