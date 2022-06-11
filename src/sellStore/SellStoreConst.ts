namespace sellStore {
    import cloth_type = clientCore.CLOTH_TYPE;
    export const RETURN_BASE: number = -100; //返回按钮
    export const TIME_LIMIT: number = 9999;

    export enum SUIT_STYLE {
        GRACE = 90001,//优雅
        GORGEOUS = 90002,//华丽
        LOVELY = 90003//可爱
    }

    export const TAB_BASE_CHILDREN: number[] = [
        cloth_type.CLOTH_ARR,
        cloth_type.FACE_ARR,
        cloth_type.JEWELRY_ARR,
        cloth_type.DECO_ARR
    ];

    export const TAB_CLOTH_CHILDREN: number[] = [
        cloth_type.Hair,
        cloth_type.Cloth,
        cloth_type.Skirt,
        cloth_type.Shoe,
        cloth_type.Wing,
    ]

    export const TAB_FACE_CHILDREN: number[] = [
        cloth_type.Eyebrow,
        cloth_type.Eye,
        cloth_type.Mouth
    ];

    export const TAB_JEWERY_CHILDREN: number[] = [
        cloth_type.HandTool,
        cloth_type.Head,
        cloth_type.Ear,
        cloth_type.Necklace,
        cloth_type.Hand,
        cloth_type.Belt,
        cloth_type.Anklet,
        cloth_type.Face
    ];

    export const TAB_DECO_CHILDREN: number[] = [
        // cloth_type.Rider,
        cloth_type.Stage,
        cloth_type.Bg
    ];

    export const TAB_SUITS: number[] = [
        SUIT_STYLE.GRACE,
        SUIT_STYLE.GORGEOUS,
        SUIT_STYLE.LOVELY
    ]

    export const UI_NAME_DIC: util.HashMap<string> = new util.HashMap();
    UI_NAME_DIC.add(cloth_type.HandTool, 'shouchi');
    UI_NAME_DIC.add(cloth_type.Head, 'toushi');
    UI_NAME_DIC.add(cloth_type.Face, 'mianshi');
    UI_NAME_DIC.add(cloth_type.Hair, 'faxing');
    UI_NAME_DIC.add(cloth_type.Ear, 'ershi');
    UI_NAME_DIC.add(cloth_type.Necklace, 'xianglian');
    UI_NAME_DIC.add(cloth_type.Belt, 'yaodai');
    UI_NAME_DIC.add(cloth_type.Cloth, 'shangyi');
    UI_NAME_DIC.add(cloth_type.Hand, 'shoushi');
    UI_NAME_DIC.add(cloth_type.Shoe, 'xiezi');
    UI_NAME_DIC.add(cloth_type.Anklet, 'jiaoshi');
    UI_NAME_DIC.add(cloth_type.Skirt, 'xiazhuang');
    UI_NAME_DIC.add(cloth_type.Wing, 'chibang');
    UI_NAME_DIC.add(cloth_type.Eyebrow, 'meimao');
    UI_NAME_DIC.add(cloth_type.Eye, 'yanjing');
    UI_NAME_DIC.add(cloth_type.Mouth, 'zuiba');
    UI_NAME_DIC.add(cloth_type.Skin, 'fuse');
    UI_NAME_DIC.add(cloth_type.Bg, 'beijingxiu');
    UI_NAME_DIC.add(cloth_type.Stage, 'wutai');
    UI_NAME_DIC.add(cloth_type.Rider, 'zuoqi');
    //特殊
    UI_NAME_DIC.add(cloth_type.FACE_ARR, 'mianzhuang');
    UI_NAME_DIC.add(cloth_type.JEWELRY_ARR, 'shiping');
    UI_NAME_DIC.add(cloth_type.DECO_ARR, 'zhuangshi');
    UI_NAME_DIC.add(TIME_LIMIT, 'xianshi');
    UI_NAME_DIC.add(RETURN_BASE, 'back');
    UI_NAME_DIC.add(cloth_type.CLOTH_ARR, 'fuzhuang');
    //套装面板
    UI_NAME_DIC.add(SUIT_STYLE.GRACE, 'youya');
    UI_NAME_DIC.add(SUIT_STYLE.GORGEOUS, 'huali');
    UI_NAME_DIC.add(SUIT_STYLE.LOVELY, 'keai');
}