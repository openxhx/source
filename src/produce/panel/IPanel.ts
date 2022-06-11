namespace produce.panel {
    /**
     * 信息面板接口
     */
    export interface IPanel {
        update(parent: Laya.Sprite, info: clientCore.MapItemInfo|pb.FlowerInfo|xls.shop,state:number): void;
        updateFrame(): void;
        dispose(): void;
    }
}