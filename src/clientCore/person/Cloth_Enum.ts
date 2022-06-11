// TypeScript file
namespace clientCore {
    export enum CLOTH_TYPE {
        /** 手持*/
        HandTool = 1,
        /** 头饰*/
        Head = 2,
        /** 面部装饰*/
        Face = 3,
        /** 头发*/
        Hair = 4,
        /** 耳环*/
        Ear = 5,
        /** 项链*/
        Necklace = 6,
        /** 腰带*/
        Belt = 7,
        /** 上衣*/
        Cloth = 8,
        /** 手部装饰*/
        Hand = 9,
        /** 鞋子*/
        Shoe = 10,
        /** 脚部装饰*/
        Anklet = 11,
        /** 裙子*/
        Skirt = 12,
        /** 翅膀*/
        Wing = 13,
        /** 眉毛*/
        Eyebrow = 102,
        /** 眼睛*/
        Eye = 103,
        /** 嘴巴*/
        Mouth = 104,
        /**肤色 */
        Skin = 106,
        Bg = 18,
        Stage = 19,
        Rider = 20,
        //特殊(换装里面Tab页用)
        CLOTH_ARR = 999,//服装
        FACE_ARR = 1000, //面妆
        JEWELRY_ARR = 1001,//饰品
        SUIT_ARR = 1002,//套装
        DECO_ARR = 1003//装饰（坐骑 舞台 背景秀）
    }

    export var CLOTH_TYPE_NAME_OBJ = {
        1: "手持",
        2: "头饰",
        3: "面饰",
        4: "头发",
        5: "耳环",
        6: "项链",
        7: "腰带",
        8: "上衣",
        9: "手饰",
        10: "鞋子",
        11: "脚饰",
        12: "下装",
        13: "翅膀",
        102: "眉毛",
        103: "眼睛",
        104: "嘴巴",
        17: "脸型",
        106:'皮肤'
    };
}

