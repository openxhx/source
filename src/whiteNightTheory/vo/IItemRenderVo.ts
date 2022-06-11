namespace whiteNightTheory {
    export interface IItemRenderVo extends IItemVo {
        /**是否已经完成*/
        isFinished: boolean;
        /**是否为操作项*/
        isFlag: boolean;
    }
}