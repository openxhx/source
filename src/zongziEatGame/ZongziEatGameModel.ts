namespace zongziEatGame {
    export class ZongziEatGameModel {
        private static _model: ZongziEatGameModel;
        private constructor() { };
        public static get instance(): ZongziEatGameModel {
            if (!this._model) {
                this._model = new ZongziEatGameModel();
            }
            return this._model;
        }
        /**对手信息 */
        public otherInfo: { uid: number, nick: string,side:number, cloths: number[], sex: number };
        /**自己分数 */
        public selfCoin:number;
        /**别人分数 */
        public otherCoin:number;
    }
}