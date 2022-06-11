namespace newYearEggGame {
    /**
     * 游乐园游戏control
     * **/
    export class NewYearEggGameControl{
        /** 开始游戏*/
        public startGame() {

        }

        /** 结束游戏*/
        public overGame(score:number) {
            net.sendAndWait(new pb.cs_yuan_egg_game({score:score})).then((msg: pb.sc_yuan_egg_game) => {
                alert.showReward(msg.item);
                clientCore.ModuleManager.open("newYearEgg.NewYearEggModule");
            });
        }
    }
}