namespace familyTailor {
    /**
     * 数据
     */
    export class FamilyTailorModel {

        /** 模块类型*/
        public shopType: ShopType;
        /** 裁缝小铺等级*/
        public tailorLevel: number;
        /** 当前解锁到*/
        public unLockIndex: number;
        /**花灵餐厅等级 */
        public restaurantLevel: number;
        /** 当前闪耀变身章节*/
        public twinkleChapter: number;
        /**闪耀变身活动章节 */
        public twinkleEventChapter: number[];

        constructor() { }

        private static _ins: FamilyTailorModel;
        public static get ins(): FamilyTailorModel {
            return this._ins || (this._ins = new FamilyTailorModel());
        }

        public checkTwinkleFinish(id: number) {
            if (id < 10) return this.twinkleChapter > id;
            else return this.twinkleEventChapter?.includes(id);
        }
    }
}