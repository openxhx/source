namespace family.panel {

    export interface IPanel {
        update(parent: Laya.Sprite): void;
        dispose(): void;
        destroy(): void;
    }
}