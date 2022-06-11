namespace clientCore {
    export interface SearchClubsMapData {
        /**
         * 序号第几个, 从1开始
         */
        index: number;
        /**
         * 0, 没有完成 , 1: 没有领取奖励 , 2: 已经完成
         */
        state: number;
        /**
         * 对应的Img
         */
        target: Laya.Image;
        /**
         * 2 box 1 雪花
         */
        panelType?: number;
    }
}