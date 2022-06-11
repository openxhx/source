namespace allGoesWell{

    export class AllGoesWellModel implements clientCore.BaseModel{
        /**每日布置次数 */
        public setTimes:number;
        /**每日吃元宵次数 */
        public eatTimes:number;
        /**福运积分 */
        public point:number;
        /**代币id */
        public coin:number = 9900307;
        /**剩余元宵 */
        public curCnt:number;
        dispose(){

        }
    }
}