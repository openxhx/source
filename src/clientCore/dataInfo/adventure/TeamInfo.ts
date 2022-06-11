namespace clientCore {
    /**冒险队伍状态 */
    export enum TEAM_STATE {
        /**待配置 */
        WAIT_SET,
        /**探索中 */
        WORKING,
        /**探索完毕 */
        COMPLETE
    }
    export class TeamInfo {
        public restTime: number;
        private _srvData: pb.Iexplore_team;
        private _name: string;

        public get teamName() {
            return this._name;
        }
        constructor(srv: pb.Iexplore_team, idx: number) {
            this.setSrvData(srv)
            this._name = "ABCD".charAt(idx);
        }

        setSrvData(srv: pb.Iexplore_team) {
            this._srvData = srv;
            this.restTime = srv.restTime;
        }

        /**消耗的时间 */
        public get useTime() {
            return this.srvData.lastTime - this.restTime;
        }

        public get srvData() {
            return this._srvData;
        }

        /**是否已解锁 */
        public get unlocked() {
            return this._srvData.locked == 1;
        }

        public get state() {
            if (_.compact(this._srvData.roleId).length == 0) {
                return TEAM_STATE.WAIT_SET;
            }
            if (this.restTime == 0) {
                return TEAM_STATE.COMPLETE;
            }
            if (this.restTime > 0) {
                return TEAM_STATE.WORKING;
            }
        }
    }
}