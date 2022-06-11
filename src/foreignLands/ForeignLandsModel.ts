namespace foreignLands{

    export class ForeignLandsModel implements clientCore.BaseModel{

        /** 活动ID*/
        public readonly ACTIVITY_ID: number = 146;
        /** 活动代币ID*/
        public readonly ACTIVITY_MONEY_ID: number = 9900164;
        /** 奖励领取信息*/
        public rewardIdx: number;
        
        public makeTimes: number;
        public buyTimes: number;

        constructor(){}

        dispose(): void{
        }
        
        checkReward(): boolean{
            for(let i: number=1; i<13; i++){
                if(util.getBit(this.rewardIdx,i) == 0)return false;
            }
            return true;
        }
    
    }
}