namespace playground {
    export class PlaygroundModel implements clientCore.BaseModel {
        public normalCnt: number;
        public specialCnt: number;
        public energy: number;
        public severEnergy: number = -1;
        public step: number;
        /** 用来缓存 当主角进入神秘花园时 主地图的位置*/
        public majorStep: number;
        public diceInfo: number[];
        /** 遥控骰子购买次数*/
        public specialBuyCnt: number = 0;

        constructor() { }

        initMsg(msg: pb.sc_flower_land_panel): void {
            this.normalCnt = msg.normalDiceNum;
            this.specialCnt = msg.specialDiceNum;
            this.energy = msg.energy;
            this.step = this.majorStep = msg.stepNum;
            this.diceInfo = msg.diceInfo;
            this.specialBuyCnt = msg.buySpecialDiceTimes;
        }
        dispose() {
            this.diceInfo.length = 0;
            this.diceInfo = null;
        }
    }
}