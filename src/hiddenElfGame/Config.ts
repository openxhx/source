namespace hiddenElfGame{
    /**
     * 游戏配置
     */
    export class Config{
        /** 捕获cd*/
        static readonly CATCH_CD: number = 1;
        /** 使用显影道具CD*/
        static readonly USE_SHOW_CD: number = 1;
        /** 显影显示时间*/
        static readonly SHOW_TIME: number = 1;
        /** 使用放大道具CD*/
        static readonly USE_AMP_CD: number = 10;
        /** 放大镜放大倍数*/
        static readonly AMP_SCALE: number = 1.5;
        /** 放大镜道具持续时间*/
        static readonly AMP_TIME: number = 6;

        static readonly AMP_ITEM_ID: number = 1511023;
        static readonly SHOW_ITEM_ID: number = 1511024;
    }
}