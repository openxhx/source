namespace rotateJump {
    /**
     * 冒险游戏control
     * **/
    export class RotateJumpGameControl implements clientCore.BaseControl {
        public model: RotateJumpGameModel;

        /** 开始游戏*/
        public startGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_begin({ stageId: this.model.stageId, type: this.model.type })).then((msg: pb.sc_mini_game_begin) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 结束游戏*/
        public overGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_over({ stageId: this.model.stageId, type: this.model.type, score: this.model.score })).then((msg: pb.sc_mini_game_over) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}