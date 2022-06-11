namespace family {

    export enum BaseBuild {
        /** 生命之树*/
        TREE = 499995,
        /** 神秘花园*/
        GARDEN = 499996,
        /** 裁缝小屋*/
        SHOP = 499997,
        /** 神秘商店*/
        TAILOR = 499998
    }

    /**
     * 家族数据 - 玩家在家族场景的数据缓存
     */
    export class FamilyModel {

        /** 神树等级*/
        public treeLv: number = 1;

        constructor() { }

        private static _ins: FamilyModel;
        public static get ins(): FamilyModel {
            return this._ins || (this._ins = new FamilyModel());
        }
    }
}