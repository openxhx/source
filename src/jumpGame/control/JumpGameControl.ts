namespace jumpGame {
    /**
     * 冒险游戏control
     * **/
    export class JumpGameControl implements clientCore.BaseControl {
        public model: JumpGameModel;

        /** 开始游戏*/
        public startGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_jump_game_begin()).then((msg: pb.sc_jump_game_begin) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 结束游戏*/
        public overGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_jump_game_end({ totalPoint: this.model.score, totalStep: this.model.totalStep, flag: (this.model.isTry ? 1 : 0) })).then((msg: pb.sc_jump_game_end) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 获取排行数据*/
        public getFriendStep(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_jump_game_get_friend_step({})).then((msg: pb.sc_jump_game_get_friend_step) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 当前是否是奖励花朵*/
        public gameSync(flowerNum: number, thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_jump_game_sync({ flowerNum: flowerNum })).then((msg: pb.sc_jump_game_get_friend_step) => {
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