namespace rotateJump {
    /**
     * 游乐园游戏control
     * **/
    export class RotateJumpGameControl2 extends RotateJumpGameControl {
        /** 开始游戏*/
        public startGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_collect_start({ id: this.model.stageId })).then((msg: pb.sc_mini_game_collect_start) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 结束游戏*/
        public overGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_collect_over({ id: this.model.stageId, score: this.model.score })).then((msg: pb.sc_mini_game_collect_over) => {
                thenHandler?.runWith({ outcome: msg.flag, rewardInfo: msg.items });
            }).catch(() => {
                catchHandler?.run();
            });
        }
    }
}