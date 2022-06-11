namespace roleChain2 {
    export enum TAB {
        /**事件 */
        Event,
        /**羁绊 */
        Chain,
        /**绽放(觉醒) */
        Awake,
        /** 情报*/
        Intelli
    }

    /**事件面板tab页 */
    export enum Event_Tab {
        /** 约会*/
        Appointment = "appointment",
        /**好感回顾 */
        Review = "review"
    }

    /**羁绊面板tab页 */
    export enum Chain_Tab {
        /** 羁绊*/
        Chain = "chain"
    }

    /**绽放面板tab页 */
    export enum Awake_Tab {
        /** 绽放*/
        Awake = "awake"
    }

    /**情报面板tab页 */
    export enum InteliJ_Tab {
        /** 偏好*/
        Hobby = "hobby",
        /**绽放 */
        Awake = "awake",
        /**CG */
        CG = "cg"
    }

    /**通知主界面更换立绘 参数角色id */
    export const EV_SHOW_ROLE_BIG_IMAGE: string = 'EV_SHOW_ROLE_BIG_IMAGE';

    /**通知主界面刷新左侧头像 */
    export const EV_REFRESH_LEFT_HEAD: string = 'EV_REFRESH_LEFT_HEAD';
}