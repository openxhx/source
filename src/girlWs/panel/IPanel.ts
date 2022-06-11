namespace girlWs{
    export interface IPanel{
        init(sign: number, ui: Laya.View): void;
        show(): void;
        dispose(): void;
    }
}