namespace clientCore {
    export class CoRoleInfo {
        readonly xlsInfo: xls.collectCharactercg;
        /**是否已领奖 */
        rewarded: boolean;

        constructor(info: xls.collectCharactercg) {
            this.xlsInfo = info;
        }

        public get id() {
            return this.xlsInfo.id;
        }

        /**收集进度 */
        public get progress() {
            let obj = { have: 0, total: 0 };
            obj.total = this.xlsInfo.characerID.length;
            for (const id of this.xlsInfo.characerID) {
                if (RoleManager.instance.getRoleById(id)) {
                    obj.have++;
                }
            }
            return obj;
        }
    }
}