namespace sellStore {
    export interface ISellStorePanel {
        init(parent: SellStoreModule);
        show(d?: any);
        hide();
        destory();
    }
}