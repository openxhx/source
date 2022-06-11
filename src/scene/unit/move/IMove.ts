namespace scene.unit.move {
    /**
     * 移动接口
     */
    export interface IMove {
        start(data: any, movement: Movement, complete?: Laya.Handler): void;
        update(): void;
        dispose(): void;
    }
}