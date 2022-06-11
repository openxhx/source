namespace clientCore {
    /**
     * 数据缓存管理类
     */
    export class CacheInfoManager {
        private static _instance:CacheInfoManager;
        public static get instance():CacheInfoManager{
            if(!this._instance){
                this._instance = new CacheInfoManager();
            }
            return this._instance;
        }

        public mapInfoCache:MapInfoCache;
        public partyInfoCache:PartyInfoCache;
        public familyInfoCache:FamilyInfoCache;
        public orderInfoCache:OrderInfoCache;

        public setUp(){

        }
    }
}