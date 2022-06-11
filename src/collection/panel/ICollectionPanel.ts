namespace collection {
    export interface ICollectionPanel {
        ui: ui.collection.panel.BadgePanelUI |
        ui.collection.panel.BasePanelUI |
        ui.collection.panel.CgPanelUI |
        ui.collection.panel.ClothPanelUI |
        ui.collection.panel.CollectPanelUI |
        ui.collection.panel.EventPanelUI |
        ui.collection.panel.GardenPanelUI |
        ui.collection.panel.RolePanelUI;
        show(d?: any);
        waitLoad(): Promise<any>;
        destory();
    }
}