namespace coolBeach{
    export class CoolBeachModel{
        private static _model: CoolBeachModel;
        private constructor() { };
        public static get instance(): CoolBeachModel {
            if (!this._model) {
                this._model = new CoolBeachModel();
            }
            return this._model;
        }

        /**今日参与评选次数 */
        public judgeTimes:number;
        /**是否领取评选宝箱 */
        public isGetJudgeBox:number;
        /**参与评选次数 */
        public allJudgeCnt:number;

        /**今日是否提交过形象 */
        public isSetImage:number;
        /**当前清凉点数 */
        public curCoolPoint:number;
        /**当前形象总数 */
        public allImageCnt:number;
        /**清凉点数领奖状态 */
        public pointReward:number;

        
        dispose() {
        }
    }
}