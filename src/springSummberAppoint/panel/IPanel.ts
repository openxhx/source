namespace springSummberAppoint{
    export interface IPanel{
        ruleId: number;
        show(sign:number,parent: Laya.Sprite): void;
        hide(): void;
        dispose(): void;
    }
}