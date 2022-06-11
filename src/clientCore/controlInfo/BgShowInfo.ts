namespace clientCore {
    export class BgShowInfo {
        private _srvInfo: pb.ITimeLimitAttire;
        private _xlsInfo: xls.bgshow;
        constructor(id: number) {
            this._xlsInfo = xls.get(xls.bgshow).get(id);
        }

        setSrvInfo(srv: pb.ITimeLimitAttire) {
            this._srvInfo = srv;
        }

        get id() {
            return this.xlsInfo.id;
        }

        /**表信息 */
        get xlsInfo() {
            return this._xlsInfo;
        }

        /**服务器回的信息，如果没有获得过 则是undefined */
        get srvInfo() {
            return this._srvInfo;
        }

        get isNew() {
            return this._srvInfo && this._srvInfo.isNew == 1;
        }

        /**剩余持续时间（秒） 0代表时间到了，-1代表永久的(如果未获得 也是0)*/
        get restTime() {
            if (this._srvInfo) {
                if (this._xlsInfo.existTime == 0)
                    return -1;
                return Math.max(0, this._srvInfo.endTime - clientCore.ServerManager.curServerTime);
            }
            return 0;
        }

        /**到期时间戳（秒） */
        get endTimeStamp() {
            return this._srvInfo.endTime;
        }

        setNewOff() {
            if (this._srvInfo)
                this._srvInfo.isNew = 0;
        }
    }
}