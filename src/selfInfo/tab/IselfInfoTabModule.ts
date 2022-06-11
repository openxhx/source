namespace selfInfo {
    export interface IselfInfoTabModule {
        tab: number;
        show<T>(param?: T);
        hide();
        destroy();
    }
}