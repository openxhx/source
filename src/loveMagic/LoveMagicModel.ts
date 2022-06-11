namespace loveMagic{
    export class LoveMagicModel implements clientCore.BaseModel{
        /** 活动ID*/
        public readonly ACTIVITY_ID: number = 139;
        /** 活动代币*/
        public readonly ACTIVITY_ITEM_ID: number = 9900150;
        /** 活动称号ID*/
        public readonly ACTIVITY_TITLE_ID: number = 3500038;
        /** 吹泡泡的游戏时长*/
        public readonly GAME_TIME: number = 15;
        /** 收集甜点最大游戏次数*/
        public readonly MAX_GAME_COUNT: number = 3;
        /** 收集甜点游戏次数*/
        public collectTimes: number;
        /** 吹气球游戏次数*/
        public bubbleTimes: number;
        /** 是否第一次打开*/
        public isFirst: boolean;
        /** 今日兑换次数*/
        public exchangeTimes: number;

        dispose(): void{

        }
    }
}