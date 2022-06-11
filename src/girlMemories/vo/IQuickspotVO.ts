namespace girlMemories {
    /**
     * 找茬数据
     */
    export interface IQuickspotVO {
        /**第一处*/
        a: IQuickspotLocation;
        /**第二处 */
        b: IQuickspotLocation;
        /**第三处 */
        c: IQuickspotLocation;
    }


    export interface IQuickspotLocation {
        x: number;
        y: number;
    }
}