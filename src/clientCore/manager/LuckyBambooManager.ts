namespace clientCore {
    export class LuckyBambooManager {
        /**好友信息缓存 */
        public friendsInfo: util.HashMap<any>;

        

        private constructor() { }

        private static _slef: LuckyBambooManager;
        public static get ins(): LuckyBambooManager {
            if (!this._slef) this._slef = new LuckyBambooManager();
            return this._slef;
        }
    }
}