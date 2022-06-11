namespace family {

    export class FamilyConstant {
        constructor() { }

        /** 生命之树ID*/
        public static TREE_ID: number = 499995;

        public static POST: string[] = ["无职位", "族长", "副族长", "长老", "精英", "族员"];
        /** 职位变化*/
        public static UPDATE_POST: string = "UPDATE_POST";
        /** 捐献完成*/
        public static DONATE_COMPLETE: string = "DONATE_COMPLETE";
        /** 订单更新*/
        public static UPDATE_ORDER: string = "UPDATE_ORDER";

        /** 活跃类型*/
        public static DONATE_TYPE: string[] = ["总活跃值", "本周活跃", "本月活跃"];
        /** 事件信息*/
        public static EVENT_MSG: string[] = ["",
            "<span style='color:#e1727b;'>{0}</span>加入了家族",
            "<span style='color:#e1727b;'>{0}</span>离开了家族",
            "<span style='color:#e1727b;'>{0}</span>被 <span style='color:#e1727b;'>{1}</span>请离了家族",
            "<span style='color:#e1727b;'>{0}</span>被任命为<span style='color:#e1727b;'>{1}</span>",
            "<span style='color:#e1727b;'>{0}</span>被自动任命为<span style='color:#e1727b;'>{1}</span>",
            "<span style='color:#e1727b;'>{0}</span>已解锁，成员可开始捐献"];
    }
}