namespace clientCore {
    /**教师身份 */
    export enum MENTOR_IDENTITY {
        /**无任何身份（需要进一步判断能否拜师，收徒） */
        NONE,
        /**学生 */
        STUDENT,
        /**导师 */
        TEACHER,
    }

    /**求助状态 */
    export enum MENTOR_HELP_STATE {
        /**今日还没有发起求助 */
        NO_HELP,
        /**学生已提交求助，等待中 */
        WAITTING,
        /**导师交付道具给学生 */
        HELP_OVER,
        /**学生已领取今日道具 */
        REWARD
    }

    /**导师系统相关常量及判断 */
    export class MentorConst {
        /**成为导师最低需求等级*/
        static minTeacherLv: number;
        /**成为学生最大需求等级 */
        static maxStudentLv: number;

        private static _xlsLvInfo: xls.tutorLevel[];

        /**判断是否能成为导师(不传参数就用自身等级) */
        static checkCanTeacherByLv(lv?: number) {
            if (lv)
                return lv >= this.minTeacherLv;
            else
                return clientCore.LocalInfo.userLv >= this.minTeacherLv;
        }

        /**判断是否能成为学生(不传参数就用自身等级) */
        static checkCanStudentByLv(lv?: number) {
            if (lv)
                return lv < this.maxStudentLv;
            else
                return clientCore.LocalInfo.userLv < this.maxStudentLv;
        }

        /**根据成长点数解析
         * @returns lv：等级0-4新生|学徒|助手|精英|毕业
         * @returns currExp:当前等级经验
         * @returns totalExp:下一级需要的总经验值
         */
        static parseLvByGrow(p: number) {
            this._xlsLvInfo = this._xlsLvInfo || xls.get(xls.tutorLevel).getValues();
            let rtn: { lv: number, totalExp: number, currExp: number } = { lv: 0, totalExp: 0, currExp: 0 };
            let idx = 999;
            for (let i = 0; i < this._xlsLvInfo.length; i++) {
                if (p < this._xlsLvInfo[i].growPoint) {
                    idx = i - 1
                    break;
                }
            }
            let nextInfo = this._xlsLvInfo[_.clamp(idx + 1, 0, this._xlsLvInfo.length - 1)];
            rtn.lv = _.clamp(idx + 1, 0,4);
            rtn.totalExp = nextInfo.growPoint;
            rtn.currExp = Math.min(p, rtn.totalExp);
            return rtn;
        }
    }
}