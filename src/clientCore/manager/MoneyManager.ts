namespace clientCore {
    export class MoneyManager {
        /**仙豆 */
        public static FAIRY_BEAN_MONEY_ID = 9900001;
        /**神叶 */
        public static LEAF_MONEY_ID = 9900002;
        /** 灵豆 */
        public static SPIRIT_BEAN_MONEY_ID = 9900003;
        /**装饰币 */
        public static DECORATION_MONEY_ID = 9900004;
        /**服装币 */
        public static CLOTH_MONEY_ID = 9900005;
        /**体力 */
        public static HEALTH_ID = 9900006;
        /**经验值 */
        public static EXP_ID = 9900007;
        /**爱心值 */
        public static LOVE_ID = 9900013;
        /**好感度 */
        public static FAVOR_ID = 9900009;
        /**花宝经验 */
        public static PET_EXP = 9900016;
        /**vip经验值 */
        public static VIP_EXP_ID = 9900017;
        /** 心之瓣*/
        public static HEART_ID: number = 1540001;
        /** 仙露*/
        public static FAIRY_DEW_MONEY_ID: number = 1550002;
        /** 秀秀豆*/
        public static SHOW_MONEY_ID: number = 1550005;
        /** 家族贡献*/
        public static FAMILY_CON: number = 9900010;
        /** 友情币*/
        public static FRIEND_MONEY_ID: number = 9900012;

        private static _dic: util.HashMap<number>;

        public static setUp() {
            this._dic = new util.HashMap();
        }
        public static add(itemId: number, cnt: number) {
            this._dic.add(itemId, cnt);
            if (itemId == this.EXP_ID) {
                console.log('经验值变动,当前经验值' + cnt);
                LocalInfo.userInfo.exp = cnt;
                LocalInfo.refreshUserLv();
            }
            else if (itemId == this.PET_EXP) {
                console.log("花宝经验值变动，当前经验值" + cnt);
                FlowerPetInfo.freeExp = cnt;
                EventManager.event(globalEvent.FLOWER_PET_CHANGE);
            }
            else if (itemId == this.VIP_EXP_ID) {
                if (LocalInfo.srvUserInfo)
                    LocalInfo.srvUserInfo.vipExp = cnt;
                EventManager.event(globalEvent.USER_VIP_EXP_CHANGE);
            }
        }

        static getNumById(id: number) {
            return this._dic.has(id) ? this._dic.get(id) : 0;
        }
        public static checkIsMoney(id: number) {
            return this._dic.has(id);
        }
        static getLeafCnt(): number {
            return ItemsInfo.getItemNum(this.LEAF_MONEY_ID);
        }
        static checkLeaf(cnt: number): boolean {
            let isEn: boolean = this.getLeafCnt() >= cnt;
            !isEn && alert.showFWords('神叶不足~');
            return isEn;
        }
        /** 检查灵豆是否足够*/
        static checkSpirit(cnt: number, showTips: boolean = true): boolean {
            let isEn: boolean = ItemsInfo.getItemNum(this.SPIRIT_BEAN_MONEY_ID) >= cnt;
            !isEn && showTips && alert.showFWords('灵豆不足~');
            return isEn;
        }
    }
}