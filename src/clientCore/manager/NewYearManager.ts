namespace clientCore{
    /**
     * 新年活动
     */
    export class NewYearManager{
        private static _instance: NewYearManager;
        public static get instance(): NewYearManager{
            return this._instance || (this._instance = new NewYearManager());
        }
        /** 已经抽过的NPC缓存*/
        public npcCache: object = {};
        /** 当前年兽所在地图*/
        public mapID: number = 0;
        constructor(){}
    }
}