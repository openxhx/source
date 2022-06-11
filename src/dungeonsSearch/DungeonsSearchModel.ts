namespace dungeonsSearch {
    export class DungeonsSearchModel implements clientCore.BaseModel {
        /**火把id */
        public torchId: number = 9900048;
        /**套装id */
        public suitId: number = 2110002;
        /**当前步数 */
        public curStep: number;
        /**游戏已完次数 */
        public gameCnt: number;
        /**火把购买次数 */
        public buyCnt: number;
        /**火把领取时间 */
        public gainTime: number;
        /**礼包id */
        public giftIds: number[] = [0, 71, 72, 73, 74];
        /**相关勋章 */
        public readonly _medalArr: number[] = [MedalConst.DUNGEONS_SEARCH_OPEN];
        public _storyInfo: number;

        /**获取勋章情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal(this._medalArr);
            this._storyInfo = totalInfo[0].value;
            return Promise.resolve();
        }
        dispose() {

        }
    }
}