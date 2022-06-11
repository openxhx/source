namespace clientCore {
    /**
     * 角色趣闻管理
     */
    export class NpcNewsManager {
        /**所有已获得趣闻*/
        public totalNews: number[];
        /**未阅读趣闻 */
        public unreadNews: number[];
        constructor() { }

        public async setup() {
            let msg = await this.getNews();
            this.totalNews = msg.ids;
            this.unreadNews = msg.newIds;
        }

        private getNews() {
            return net.sendAndWait(new pb.cs_get_all_customer_tidbits()).then((msg: pb.sc_get_all_customer_tidbits) => {
                return Promise.resolve(msg);
            });
        }

        private static _ins: NpcNewsManager;
        public static get ins(): NpcNewsManager {
            return this._ins || (this._ins = new NpcNewsManager());
        }
    }
}