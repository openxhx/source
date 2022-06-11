namespace snowEvent {
    export interface ISnowEventPanel {
        boxAward: Laya.Box;
        boxGame: Laya.Box;
        btnClose: Laya.Sprite;
        btnGive: Laya.Sprite;
        /**完成交互回调*/
        sweepHanlder: Laya.Handler;
    }
}