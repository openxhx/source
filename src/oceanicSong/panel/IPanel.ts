namespace oceanicSong{
    export interface IPanel{
        ruleId: number;
        init(sign: number): void;
        show(parent: Laya.Sprite): void;
        hide(): void;
        dispose(): void;
    }
}
