namespace oceanicSong{
    export const enum TypeOceanicSongPage{
        MAIN = 1,
        DETAIL_FLASH = 2,
        DETAIL_LEGEND = 3,
        DETAIL_BUY = 4,
        DETAIL_LOVE = 5,
        DETAIL_FISH = 6,
        DETAIL_MILAN = 7
    }

    export class EventType{
        static UPDATE_TIME: string = '1';
        static RESET_MAIN_TAB_ABLE: string = "2"
    }
}
