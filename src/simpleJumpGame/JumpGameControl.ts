namespace simpleJumpGame {
    /**
     * 冒险游戏control
     * **/
    export class JumpGameControl implements clientCore.BaseControl {
        public model: JumpGameModel;

        /**
         * 游戏开启
         */
         public GameStart() {
            net.send(new pb.cs_jump_game_star());
        }

        /**
         * 游戏结束
         */
        public GameEnd(items: pb.Item[]) {
            return net.sendAndWait(new pb.cs_jump_game_over({ item: items })).then((msg: pb.sc_jump_game_over) => {
                return Promise.resolve(msg);
            })
        }

        public dispose(): void {
            this.model = null;
        }
    }
}