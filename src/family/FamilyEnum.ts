namespace family {

    export enum FamlyPost {
        /** 族长*/
        SHAIKH = 1,
        /** 副族长*/
        VICE_SHAIKH,
        /** 长老*/
        ELDER,
        /** 精英*/
        ELITE,
        /** 族员*/
        MEMBER
    }

    /** 家族权力*/
    export enum FamilyAuthority {
        /** 任命权限*/
        NOMINATE = "nominate",
        /** 审批权限*/
        APPROVE = "approve",
        /** 踢出权限*/
        DISMISS = "dismiss",
        /** 离开权限*/
        LEAVE = "leave",
        /** 修改宣言权限*/
        CHANGESTATEMENT = "changeStatement",
        /** 修改族徽权限*/
        CHANGEBADGE = "changeBadge",
        /** 布置场景权限*/
        ARRANGEMENT = "arrangement",
        /** 建筑解锁权限*/
        UNLOCK = "unlock"
    }

    /** 家族事件*/
    export enum FamlyEvent {
        /** 加入*/
        JOIN = 1,
        /** 离开*/
        LEAVE,
        /** 被请离*/
        PLEASE_LEAVE,
        /** 任命*/
        APPOINT,
        /** 自动任命*/
        APPOINT2,
        /** 建筑解锁*/
        UNLOCK
    }
}