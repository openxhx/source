namespace produce.panel {
    /**
     * 未放置时的信息面板
     */
    export class NormalPanel extends ui.produce.panel.NormalPanelUI implements IPanel {

        constructor() { super(); }

        update(parent: Laya.Sprite, info: clientCore.MapItemInfo ,state:number): void {
            parent.addChild(this);
            this.pos(158, 602);

            let isSeed: boolean = info.type == 2;
            let scale: number = isSeed ? 0.55 : 0.45;
            this.good.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.produceOutPutItemID);
            this.good.ico.scale(scale, scale);
            this.good.txName.changeText(clientCore.ItemsInfo.getItemInfo(info.produceOutPutItemID).name);
        }

        updateFrame(): void { }

        dispose(): void {
            this.removeSelf();
        }
    }
}