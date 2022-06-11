namespace seventhMoonNight {
    export const enum SeventhMoonNightEventType {
        CLOSE_CreateFlowerLightTipsPanel = "CLOSE_CreateFlowerLightTipsPanel",
        CLOSE_PlayFlowerLightHandlerPanel = "CLOSE_PlayFlowerLightHandlerPanel",
        CLOSE_GameFlowerLightPanel = "CLOSE_GameFlowerLightPanel",
        /**选择了花灯*/
        PLAYFLOWERLIGHT_SELECTED_FLOWER = "PLAYFLOWERLIGHT_SELECTED_FLOWER",
        /**选择了花灯材料*/
        PLAYFLOWERLIGHT_SELECTED_ITEM = "PLAYFLOWERLIGHT_SELECTED_ITEM",
        /**小游戏倒计时结束*/
        COUNTDOWN_TIMER_FINISHED = "COUNTDOWN_TIMER_FINISHED",
        /**小游戏成功*/
        GAME_SUCC = "GAME_SUCC",
        /**小游戏成功后 - AI结束后*/
        GAME_SUCC_LIGHTAI_FINISHED = "GAME_SUCC_LIGHTAI_FINISHED"
    }
}