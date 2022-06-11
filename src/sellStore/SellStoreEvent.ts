namespace sellStore {
    export class SellStoreEvent {
        /**model数据更新  */
        static EV_NEED_CHANGE_CLOTH: string = "EV_NEED_CHANGE_CLOTH";
        static EV_CLEAR_CHANGE_CLOTH: string = "EV_CLEAR_CHANGE_CLOTH";
        static EV_OPEN_CART: string = "EV_OPEN_CART";
        static EV_DETAIL_PANEL: string = "EV_DETAIL_PANEL";
        static EV_NEED_REFRESH_LIST: string = "EV_NEED_REFRESH_LIST";//需要更新列表
        static EV_CHANGE_BG_STAGE: string = "EV_CHANGE_BG_STAGE";
    }
}