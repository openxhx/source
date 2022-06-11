namespace waterSong {
    export class WaterSongModel {
        private static _model: WaterSongModel;
        private constructor() { };
        public static get instance(): WaterSongModel {
            if (!this._model) {
                this._model = new WaterSongModel();
            }
            return this._model;
        }

        /**已消耗代币数量 */
        public costCnt: number = 0;
        /**累计消耗代币数量 */
        public costAllCnt: number = 0;
        public coinCost(cnt: number, canDraw: boolean = true) {
            if (canDraw) this.costCnt += cnt;
            this.costAllCnt += cnt;
        }
    }

}