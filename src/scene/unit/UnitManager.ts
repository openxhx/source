
namespace scene.unit {
    /**
     * 单元管理
     */
    export class UnitManager {

        private _teams: Team[];

        constructor() {
            this._teams = [];
            this._teams[CampEnum.MY] = new Team();
            this._teams[CampEnum.MY].leaderID = clientCore.LocalInfo.uid;
            this._teams[CampEnum.MONSTER] = new Team();
        }

        public addUnit(unit: Fighter, index: number): void {
            let team: Team = this._teams[unit.campID];
            team && team.addUnit(unit, index);
        }

        public removeUnit(unit: Fighter): void {
            let team: Team = this._teams[unit.campID];
            team && team.removeUnit(unit);
        }

        public getTeam(campID: CampEnum): Team {
            return this._teams[campID];
        }

        /** 清理场上的队伍*/
        public clear(): void {
            _.forEach(this._teams, (element: Team) => {
                element && element.clear();
            });
        }

        private static _ins: UnitManager;
        public static get ins(): UnitManager {
            return this._ins || (this._ins = new UnitManager());
        }
    }
}