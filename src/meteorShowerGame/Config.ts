
namespace meteorShowerGame{
    /**
     * 参数配置
     */
    export class Config{
        /** 开始创建高度*/
        static readonly CREATE_HEIGHT: number = 100;
        /** 每叠加多少高度创建*/
        static readonly ADD_HEIGHT: number = 300;
        /** 飞行速度比例*/
        static readonly FLY_SPEED: number = 0.2;
        /** 每波创建数量区间*/
        static readonly WARE_COUNT: number[] = [6,10];
        /** 游戏时间*/
        static readonly TIME: number = 90;
        constructor(){}
    }
}