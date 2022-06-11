namespace clientCore {
    export class MapGridInfo {
        /**0不可放置地块 1是陆地 2是水 3是天空*/
        public blockType: number;
        public occupyState: boolean;
        public lockState: boolean;
        public oriData: number;//这个保存表里面读取的原始数据
    }
}