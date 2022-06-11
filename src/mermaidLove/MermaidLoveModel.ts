namespace mermaidLove{

    export class MermaidLoveModel implements clientCore.BaseModel{

        /** 活动ID*/
        public readonly ACTIVITY_ID: number = 226;
        /** 活动代币ID*/
        public readonly ACTIVITY_MONEY_ID: number = 9900298;
        /** 奖励领取信息*/
        public rewardIdx: number;
        
        public buyTimes: pb.IcommonShop[];

        constructor(){}

        dispose(): void{
            this.buyTimes.length = 0;
            this.buyTimes = null;
        }
        
        checkReward(): boolean{
            for(let i: number=1; i<11; i++){
                if(util.getBit(this.rewardIdx,i) == 0)return false;
            }
            return true;
        }
    
    }
}