namespace clientCore {
    export class SpriteBuildQueueInfo {
        srvInfo: pb.IspiritInfo;

        /**增减时间间隔 */
        private static addTime: number;

        constructor(info: pb.IspiritInfo) {
            this.srvInfo = info;
            SpriteBuildQueueInfo.addTime = xls.get(xls.globaltest).get(1).fairyPower.v2;
        }


        /**当前数量 */
        get num() {
            let disTime = ServerManager.curServerTime - this.srvInfo.updateTime;
            return Math.min(this.srvInfo.remain + Math.floor(disTime / SpriteBuildQueueInfo.addTime), this.total);
        }

        get id() {
            return this.srvInfo.id;
        }

        /**总共多少 */
        get total() {
            return this.srvInfo.total;
        }

        /**剩下多少秒要开始增加 */
        get restTimeToAdd() {
            let disTime = ServerManager.curServerTime - this.srvInfo.updateTime;
            return SpriteBuildQueueInfo.addTime - disTime % SpriteBuildQueueInfo.addTime;
        }
    }
}