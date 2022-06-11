namespace snowNightFestival{
    export class SnowNightFestivalModel implements clientCore.BaseModel{
        /**购物车内容 */
        public buyCarInfo: number[] = [];
        /**屏蔽切换界面 */
        public disPanelChange:boolean;
        dispose(){

        }
    }
}