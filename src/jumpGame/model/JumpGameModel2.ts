namespace jumpGame {
    /**
     * 游乐园游戏model
     * **/
    export class JumpGameModel2 extends JumpGameModel {

        initData(data: ModuleInfo): void {
            data.isTry = false;
            data.historyHighScore = xls.get(xls.park).get(data.stageId).passType;
            super.initData(data);
        }
    }
}