namespace searchCherryClues {
    export interface IPanel {
        init(sign: number): void;
        show(parent: Laya.Sprite, sign: number): void;
        hide(): void;
        dispose(): void;
    }
}