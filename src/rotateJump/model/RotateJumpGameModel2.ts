namespace rotateJump {
    /**
     * 游乐园游戏model
     * **/
    export class RotateJumpGameModel2 extends RotateJumpGameModel {

        /**获取所需积分**/
        public get needSource(): number {
            return xls.get(xls.park).get(this.stageId).passType;
        }
    }
}