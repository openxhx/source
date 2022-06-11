namespace seventhMoonNight {
    /**
     * 放花灯,放材料
     */
    export interface IPlayFlowerUsingItemVo extends IMaterialCreateVo {
        status?: PlayFlowerLightHandlerPanelStatusType;
        /**是否被选中*/
        selected: boolean;
        // 0仙豆 1神叶 2指尖音符
        // 0红线  1含蕴  2吉祥
        index: number;
    }
}