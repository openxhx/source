namespace clientCore{
    /**
     * 碧星的宝藏数据项
     */
    export class EarthPerciousMgr{
        /** 进化点*/
        static readonly ITEM_ID: number = 9900136;

        /** 全服进度*/
        static step: number;
        /** 特殊任务完成状态*/
        static taskFlag: number;
        /** 奖励领取标记位*/
        static rewardIdx: number;

        static initMsg(msg: pb.sc_treasure_of_planet_panel): void{
            this.step = msg.step;
            this.taskFlag = msg.specialTaskFlag;
            this.rewardIdx = msg.rewardFlag;
        }

        /** 获取神秘植物生长状态*/
        static get level(): number{
            let count: number = this.point;
            if(count < 20)return 0;
            if(count < 40)return 1;
            if(count < 60)return 2;
            if(count < 90)return 3;
            if(count < 120)return 4;
            if(count < 150)return 5;
            return 6;
        }

        static getInfo(): {level: number,current: number,target: number}{
            let count: number = this.point;
            if(count < 20) return {level: 0,current: count,target: 20};
            if(count < 40) return {level: 1,current: count-20,target: 20};
            if(count < 60) return {level: 2,current: count-40,target: 20};
            if(count < 90) return {level: 3,current: count-60,target: 30};
            if(count < 120) return {level: 4,current: count-90,target: 30};
            if(count < 150) return {level: 5,current: count-120,target: 30};
            return {level: 6,current: 0,target: 0};
        }

        /** 进化点*/
        static get point(): number{
            return ItemsInfo.getItemNum(this.ITEM_ID);
        }

        /**
         * 检查是否领奖
         * @param pos 1开始
         */
        static checkReward(pos: number): boolean{
            return util.getBit(this.rewardIdx,pos) == 1;
        }

        /**
         * 设置领奖位置
         * @param pos 
         */
        static setReward(pos: number): void{
            this.rewardIdx = util.setBit(this.rewardIdx,pos,1);
        }
    }
}